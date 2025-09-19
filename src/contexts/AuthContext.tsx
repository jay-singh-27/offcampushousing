import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../config/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  needsEmailConfirmation: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, userType: 'landlord' | 'tenant') => Promise<void>;
  logout: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  useEffect(() => {
    // Check initial session
    checkAuthState();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session ? 'with session' : 'no session');
        
        if (session?.user) {
          console.log('✅ User session confirmed - logging in');
          await handleUserSession(session.user);
          setNeedsEmailConfirmation(false);
        } else {
          setUser(null);
          if (event === 'SIGNED_OUT') {
            setNeedsEmailConfirmation(false);
          }
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleUserSession(session.user);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSession = async (supabaseUser: SupabaseUser) => {
    // Convert Supabase user to our User type
    const userData: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || 'User',
      userType: supabaseUser.user_metadata?.userType || 'tenant',
      createdAt: new Date(supabaseUser.created_at),
    };
    
    setUser(userData);
  };


  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      console.log('🔓 Attempting login:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📝 Login response:', { data, error });

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.id);
        await handleUserSession(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, userType: 'landlord' | 'tenant') => {
    try {
      setIsLoading(true);
      
      console.log('🔐 Attempting registration:', { email, name, userType });
      console.log('📍 Supabase URL:', supabase.supabaseUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            userType,
          }
        }
      });

      console.log('📝 Registration response:', { data, error });

      if (error) {
        console.error('❌ Registration error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.id);
        console.log('📊 Database trigger will automatically create user record');
        
        // Check if email confirmation is required
        if (data.session) {
          console.log('🎯 User has active session - logging in');
          await handleUserSession(data.user);
        } else {
          console.log('📧 Email confirmation required - check your email to confirm account');
          setNeedsEmailConfirmation(true);
          // User will be handled by the auth state change listener when they confirm email
          // The database trigger has already created the user record
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
      setNeedsEmailConfirmation(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('📧 Confirmation email resent');
    } catch (error) {
      console.error('Resend confirmation error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    needsEmailConfirmation,
    login,
    register,
    logout,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
