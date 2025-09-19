import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Listing, SearchFilters } from '../../types';
import { SearchBar } from '../../components/common/SearchBar';
import { ListingCard } from '../../components/listings/ListingCard';
import { SearchFiltersModal } from '../../components/listings/SearchFiltersModal';
import { College } from '../../services/CollegeSearchService';
import { PropertyService } from '../../services/PropertyService';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, filters, listings]);

  const loadListings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading listings for search from Supabase...');
      
      // Load real listings from Supabase
      const properties = await PropertyService.getAllProperties();
      console.log('✅ Loaded', properties.length, 'listings for search');
      
      // Convert Property[] to Listing[] format
      const allListings: Listing[] = properties.map(property => ({
        id: property.id,
        title: property.title,
        description: property.description,
        rent: property.rent,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zip_code,
        college: property.college || '',
        landlordId: property.landlord_id,
        images: property.images,
        amenities: property.amenities,
        available: property.available,
        availableDate: property.available_from,
        featured: false, // Default value
        createdAt: property.created_at,
        updatedAt: property.updated_at,
      }));
      
      setListings(allListings);
    } catch (error) {
      console.error('❌ Error loading listings for search:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...listings];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.city.toLowerCase().includes(query) ||
        listing.state.toLowerCase().includes(query) ||
        listing.college?.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.location) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.city.toLowerCase().includes(location) ||
        listing.state.toLowerCase().includes(location) ||
        listing.zipCode.includes(location)
      );
    }

    if (filters.college) {
      filtered = filtered.filter(listing =>
        listing.college?.toLowerCase().includes(filters.college!.toLowerCase())
      );
    }

    if (filters.minRent !== undefined) {
      filtered = filtered.filter(listing => listing.rent >= filters.minRent!);
    }

    if (filters.maxRent !== undefined) {
      filtered = filtered.filter(listing => listing.rent <= filters.maxRent!);
    }

    if (filters.bedrooms !== undefined) {
      filtered = filtered.filter(listing => listing.bedrooms >= filters.bedrooms!);
    }

    if (filters.bathrooms !== undefined) {
      filtered = filtered.filter(listing => listing.bathrooms >= filters.bathrooms!);
    }

    // Only show available listings
    filtered = filtered.filter(listing => listing.available);

    setFilteredListings(filtered);
  };

  const handleFiltersApply = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ location: '' });
    setSearchQuery('');
  };

  const handleCollegeSelect = (college: College) => {
    setFilters(prev => ({ ...prev, college: college.name, location: `${college.city}, ${college.stateCode}` }));
    setSearchQuery(college.name);
  };

  const navigateToListingDetails = (listingId: string) => {
    navigation.navigate('ListingDetails', { listingId });
  };

  const hasActiveFilters = () => {
    return filters.college || filters.minRent || filters.maxRent || 
           filters.bedrooms || filters.bathrooms;
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <ListingCard
      listing={item}
      onPress={() => navigateToListingDetails(item.id)}
      style={styles.listingCard}
    />
  );

  const renderQuickFilter = (label: string, onPress: () => void, active: boolean = false) => (
    <TouchableOpacity
      style={[styles.quickFilter, active && styles.activeQuickFilter]}
      onPress={onPress}
    >
      <Text style={[styles.quickFilterText, active && styles.activeQuickFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by city, college, or keywords..."
          showFilter
          onFilterPress={() => setShowFilters(true)}
          onCollegeSelect={handleCollegeSelect}
        />
      </View>

      <View style={styles.quickFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.quickFilters}>
            {renderQuickFilter('All', clearFilters, !hasActiveFilters())}
            {renderQuickFilter('Boston', () => setFilters({...filters, location: 'Boston'}))}
            {renderQuickFilter('Cambridge', () => setFilters({...filters, location: 'Cambridge'}))}
            {renderQuickFilter('Berkeley', () => setFilters({...filters, location: 'Berkeley'}))}
            {renderQuickFilter('Under $2000', () => setFilters({...filters, maxRent: 2000}))}
            {renderQuickFilter('2+ Bedrooms', () => setFilters({...filters, bedrooms: 2}))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
        </Text>
        {hasActiveFilters() && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredListings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No properties found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search criteria or filters
            </Text>
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <SearchFiltersModal
        visible={showFilters}
        filters={filters}
        onApply={handleFiltersApply}
        onClose={() => setShowFilters(false)}
        colleges={[
          'Harvard University',
          'Massachusetts Institute of Technology',
          'Stanford University',
          'University of California, Berkeley',
          'University of California, Los Angeles'
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  quickFiltersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  quickFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeQuickFilter: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  quickFilterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeQuickFilterText: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  resultsCount: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listingCard: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchScreen;
