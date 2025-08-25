import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList, Listing } from '../../types';
import { CustomButton } from '../../components/common/CustomButton';
import { ListingCard } from '../../components/listings/ListingCard';
import { SearchBar } from '../../components/common/SearchBar';
import { mockListings } from '../../utils/mockData';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      // TODO: Replace with actual API call
      setListings(mockListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  };

  const navigateToSearch = () => {
    navigation.navigate('Search' as any);
  };

  const navigateToCreateListing = () => {
    navigation.navigate('CreateListing');
  };

  const navigateToListingDetails = (listingId: string) => {
    navigation.navigate('ListingDetails', { listingId });
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredListings = filteredListings.filter(listing => listing.featured);
  const recentListings = filteredListings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] || 'User'}! 👋
            </Text>
            <Text style={styles.subtitle}>
              {user?.userType === 'landlord' 
                ? 'Manage your properties' 
                : 'Find your perfect home'}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search by city, college, or keywords..."
          onFocus={navigateToSearch}
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {user?.userType === 'landlord' && (
          <View style={styles.section}>
            <CustomButton
              title="+ Create New Listing"
              onPress={navigateToCreateListing}
              style={styles.createListingButton}
            />
          </View>
        )}

        {featuredListings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Properties</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.horizontalList}>
                {featuredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onPress={() => navigateToListingDetails(listing.id)}
                    style={styles.featuredCard}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={navigateToSearch}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentListings.length > 0 ? (
            recentListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onPress={() => navigateToListingDetails(listing.id)}
                style={styles.listingCard}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>No listings found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or check back later
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  createListingButton: {
    marginBottom: 8,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  featuredCard: {
    width: 280,
    marginRight: 16,
  },
  listingCard: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
});

export default HomeScreen;
