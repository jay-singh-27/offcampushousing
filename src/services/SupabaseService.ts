import { supabase, User, College, Property, UserSearch } from '../config/supabase';

export class SupabaseService {
  
  // User Management
  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // College Management
  static async searchColleges(query: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`)
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  static async getCollegeById(collegeId: string) {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('id', collegeId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async insertCollege(collegeData: Omit<College, 'created_at'>) {
    const { data, error } = await supabase
      .from('colleges')
      .insert([{ ...collegeData, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getPopularColleges(limit: number = 20) {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('name')
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // User Search History
  static async saveUserSearch(searchData: Omit<UserSearch, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('user_searches')
      .insert([{ ...searchData, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserSearchHistory(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('user_searches')
      .select(`
        *,
        college:college_id (
          name,
          city,
          state_code
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // Property Management
  static async searchProperties(filters: {
    city?: string;
    state?: string;
    collegeId?: string;
    minRent?: number;
    maxRent?: number;
    bedrooms?: number;
    bathrooms?: number;
    available?: boolean;
  }) {
    let query = supabase
      .from('properties')
      .select(`
        *,
        college:college_id (
          name,
          city,
          state_code
        )
      `);

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    
    if (filters.state) {
      query = query.ilike('state', `%${filters.state}%`);
    }
    
    if (filters.collegeId) {
      query = query.eq('college_id', filters.collegeId);
    }
    
    if (filters.minRent) {
      query = query.gte('rent', filters.minRent);
    }
    
    if (filters.maxRent) {
      query = query.lte('rent', filters.maxRent);
    }
    
    if (filters.bedrooms) {
      query = query.gte('bedrooms', filters.bedrooms);
    }
    
    if (filters.bathrooms) {
      query = query.gte('bathrooms', filters.bathrooms);
    }
    
    if (filters.available !== undefined) {
      query = query.eq('available', filters.available);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Analytics
  static async getSearchAnalytics(userId?: string) {
    let query = supabase
      .from('user_searches')
      .select('search_query, college_id, created_at');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data || [];
  }
}

export default SupabaseService;
