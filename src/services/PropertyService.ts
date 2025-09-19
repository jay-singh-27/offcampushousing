import { supabase } from '../config/supabase';
import { Property } from '../types';

export interface CreatePropertyRequest {
  title: string;
  description: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  college_id?: string;
  images: string[];
  amenities: string[];
  available_from: string;
  lease_term?: string;
  utilities_included?: boolean;
  pets_allowed?: boolean;
  parking_included?: boolean;
  payment_intent_id?: string;
}


export class PropertyService {
  static async createProperty(propertyData: CreatePropertyRequest): Promise<Property> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🏠 Creating property:', propertyData);

      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            ...propertyData,
            landlord_id: user.id,
            available: true,
            utilities_included: propertyData.utilities_included || false,
            pets_allowed: propertyData.pets_allowed || false,
            parking_included: propertyData.parking_included || false,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating property:', error);
        throw new Error(error.message);
      }

      console.log('✅ Property created successfully:', data.id);
      return data as Property;
    } catch (error) {
      console.error('PropertyService.createProperty error:', error);
      throw error;
    }
  }

  static async getUserProperties(): Promise<Property[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user properties:', error);
        throw new Error(error.message);
      }

      return data as Property[];
    } catch (error) {
      console.error('PropertyService.getUserProperties error:', error);
      throw error;
    }
  }

  static async getAllProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          colleges (
            id,
            name,
            city,
            state
          )
        `)
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching properties:', error);
        throw new Error(error.message);
      }

      return data as Property[];
    } catch (error) {
      console.error('PropertyService.getAllProperties error:', error);
      throw error;
    }
  }

  static async getPropertyById(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          colleges (
            id,
            name,
            city,
            state
          ),
          users!properties_landlord_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Property not found
        }
        console.error('❌ Error fetching property:', error);
        throw new Error(error.message);
      }

      return data as Property;
    } catch (error) {
      console.error('PropertyService.getPropertyById error:', error);
      throw error;
    }
  }

  static async updateProperty(id: string, updates: Partial<CreatePropertyRequest>): Promise<Property> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .eq('landlord_id', user.id) // Ensure user owns the property
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating property:', error);
        throw new Error(error.message);
      }

      return data as Property;
    } catch (error) {
      console.error('PropertyService.updateProperty error:', error);
      throw error;
    }
  }

  static async deleteProperty(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('landlord_id', user.id); // Ensure user owns the property

      if (error) {
        console.error('❌ Error deleting property:', error);
        throw new Error(error.message);
      }

      console.log('✅ Property deleted successfully');
    } catch (error) {
      console.error('PropertyService.deleteProperty error:', error);
      throw error;
    }
  }
}
