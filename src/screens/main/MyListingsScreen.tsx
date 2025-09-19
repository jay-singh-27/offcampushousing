import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList, Listing } from '../../types';
import { CustomButton } from '../../components/common/CustomButton';
import { ListingCard } from '../../components/listings/ListingCard';
import { PropertyService } from '../../services/PropertyService';

type MyListingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyListingsScreen: React.FC = () => {
  const navigation = useNavigation<MyListingsScreenNavigationProp>();
  const { user } = useAuth();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyListings();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadMyListings();
    }, [])
  );

  const loadMyListings = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading user listings from Supabase...');
      
      // Load real listings from Supabase
      const properties = await PropertyService.getUserProperties();
      console.log('✅ Loaded', properties.length, 'listings');
      
      // Convert Property[] to Listing[] format
      const userListings: Listing[] = properties.map(property => ({
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
        college: '', // TODO: Add college name lookup
        landlordId: property.landlord_id,
        images: property.images,
        amenities: property.amenities,
        available: property.available,
        availableDate: property.available_from,
        featured: false, // Default value
        createdAt: property.created_at,
        updatedAt: property.updated_at,
      }));
      
      setListings(userListings);
    } catch (error) {
      console.error('❌ Error loading listings:', error);
      Alert.alert('Error', 'Failed to load your listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyListings();
    setRefreshing(false);
  };

  const navigateToCreateListing = () => {
    navigation.navigate('CreateListing');
  };

  const navigateToListingDetails = (listingId: string) => {
    navigation.navigate('ListingDetails', { listingId });
  };

  const handleEditListing = (listingId: string) => {
    // TODO: Navigate to edit listing screen
    Alert.alert('Coming Soon', 'Listing editing will be available soon');
  };

  const handleDeleteListing = (listingId: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            setListings(prev => prev.filter(listing => listing.id !== listingId));
            Alert.alert('Success', 'Listing deleted successfully');
          },
        },
      ]
    );
  };

  const handleToggleAvailability = (listingId: string) => {
    setListings(prev =>
      prev.map(listing =>
        listing.id === listingId
          ? { ...listing, available: !listing.available }
          : listing
      )
    );
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <View style={styles.listingContainer}>
      <ListingCard
        listing={item}
        onPress={() => navigateToListingDetails(item.id)}
        style={styles.listingCard}
      />
      <View style={styles.listingActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.availabilityButton,
            !item.available && styles.unavailableButton,
          ]}
          onPress={() => handleToggleAvailability(item.id)}
        >
          <Ionicons
            name={item.available ? 'eye' : 'eye-off'}
            size={16}
            color={item.available ? '#28A745' : '#DC3545'}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: item.available ? '#28A745' : '#DC3545' },
            ]}
          >
            {item.available ? 'Available' : 'Hidden'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditListing(item.id)}
        >
          <Ionicons name="pencil" size={16} color="#007AFF" />
          <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteListing(item.id)}
        >
          <Ionicons name="trash" size={16} color="#DC3545" />
          <Text style={[styles.actionButtonText, { color: '#DC3545' }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="home-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No Listings Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Create your first listing to start receiving inquiries from potential tenants.
      </Text>
      <CustomButton
        title="Create Your First Listing"
        onPress={navigateToCreateListing}
        style={styles.emptyStateButton}
      />
    </View>
  );

  const renderStats = () => {
    const totalListings = listings.length;
    const availableListings = listings.filter(l => l.available).length;
    const totalViews = listings.reduce((sum, listing) => sum + (listing.featured ? 50 : 20), 0); // Mock views

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalListings}</Text>
          <Text style={styles.statLabel}>Total Listings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{availableListings}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalViews}</Text>
          <Text style={styles.statLabel}>Total Views</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={navigateToCreateListing}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {listings.length > 0 && renderStats()}

      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListHeaderComponent={
          listings.length > 0 ? (
            <CustomButton
              title="+ Create New Listing"
              onPress={navigateToCreateListing}
              style={styles.createButton}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  createButton: {
    marginBottom: 20,
  },
  listingContainer: {
    marginBottom: 20,
  },
  listingCard: {
    marginBottom: 12,
  },
  listingActions: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  availabilityButton: {
    backgroundColor: '#F0F8FF',
  },
  unavailableButton: {
    backgroundColor: '#FFF5F5',
  },
  editButton: {
    backgroundColor: '#F0F8FF',
  },
  deleteButton: {
    backgroundColor: '#FFF5F5',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
});

export default MyListingsScreen;
