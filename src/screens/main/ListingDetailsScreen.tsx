import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList, Listing, Property } from '../../types';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { PropertyService } from '../../services/PropertyService';

type ListingDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListingDetails'>;
type ListingDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ListingDetails'>;

const { width } = Dimensions.get('window');

const ListingDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ListingDetailsScreenNavigationProp>();
  const route = useRoute<ListingDetailsScreenRouteProp>();
  const { user } = useAuth();
  
  const { listingId } = route.params;
  const [listing, setListing] = useState<Listing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadListingDetails();
  }, [listingId]);

  const convertPropertyToListing = (property: Property): Listing => {
    return {
      id: property.id,
      title: property.title,
      rent: property.rent,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zip_code,
      college: property.college || '',
      landlordId: property.landlord_id,
      description: property.description,
      images: property.images || [],
      amenities: property.amenities || [],
      availableDate: property.available_from,
      available: property.available ?? true,
      coordinates: property.coordinates || undefined,
      createdAt: property.created_at,
      updatedAt: property.updated_at,
      featured: false, // Default value
    };
  };

  const loadListingDetails = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Loading listing details for ID:', listingId);
      
      // Get specific property by ID
      const foundProperty = await PropertyService.getPropertyById(listingId);
      
      if (foundProperty) {
        console.log('✅ Found listing:', foundProperty.title);
        const listing = convertPropertyToListing(foundProperty);
        setListing(listing);
      } else {
        console.log('❌ Listing not found for ID:', listingId);
        setListing(null);
      }
    } catch (error) {
      console.error('❌ Error loading listing details:', error);
      Alert.alert('Error', 'Failed to load listing details');
      setListing(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSaveListing = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save/unsave functionality
  };

  const handleContact = () => {
    if (!listing) return;
    
    Alert.alert(
      'Contact Landlord',
      'How would you like to contact the landlord?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // TODO: Get actual landlord phone number
            Linking.openURL('tel:+1234567890');
          },
        },
        {
          text: 'Email',
          onPress: () => {
            // TODO: Get actual landlord email
            Linking.openURL('mailto:landlord@example.com?subject=Inquiry about ' + listing.title);
          },
        },
      ]
    );
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert('Coming Soon', 'Share functionality will be available soon');
  };

  const handleReportListing = () => {
    Alert.alert(
      'Report Listing',
      'Why are you reporting this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate Content', onPress: () => submitReport('inappropriate') },
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Misleading Information', onPress: () => submitReport('misleading') },
        { text: 'Other', onPress: () => submitReport('other') },
      ]
    );
  };

  const submitReport = (reason: string) => {
    // TODO: Implement report functionality
    Alert.alert('Report Submitted', 'Thank you for your report. We will review it shortly.');
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}/month`;
  };

  const formatBedBath = (bedrooms: number, bathrooms: number) => {
    const bedroomText = bedrooms === 0 ? 'Studio' : `${bedrooms} ${bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`;
    const bathroomText = `${bathrooms} ${bathrooms === 1 ? 'Bath' : 'Baths'}`;
    return `${bedroomText} • ${bathroomText}`;
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading listing details..." />;
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#CCCCCC" />
          <Text style={styles.errorText}>Listing not found</Text>
          <CustomButton title="Go Back" onPress={handleGoBack} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {user?.userType === 'tenant' && (
            <TouchableOpacity onPress={handleSaveListing} style={styles.headerButton}>
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={24}
                color={isSaved ? "#FF3B30" : "#FFFFFF"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {listing.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.image} />
            ))}
          </ScrollView>
          
          <View style={styles.imageIndicator}>
            <Text style={styles.imageCounter}>
              {currentImageIndex + 1} / {listing.images.length}
            </Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(listing.rent)}</Text>
            {!listing.available && (
              <View style={styles.unavailableBadge}>
                <Text style={styles.unavailableText}>Not Available</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.details}>{formatBedBath(listing.bedrooms, listing.bathrooms)}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#666666" />
            <Text style={styles.location}>
              {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
            </Text>
          </View>

          {listing.college && (
            <View style={styles.collegeRow}>
              <Ionicons name="school-outline" size={16} color="#666666" />
              <Text style={styles.college}>Near {listing.college}</Text>
            </View>
          )}

          <View style={styles.availabilityRow}>
            <Ionicons name="calendar-outline" size={16} color="#666666" />
            <Text style={styles.availability}>
              Available {new Date(listing.availableDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* Amenities */}
        {listing.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {listing.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#28A745" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Map */}
        {listing.coordinates && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: listing.coordinates.latitude,
                  longitude: listing.coordinates.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={listing.coordinates}
                  title={listing.title}
                  description={`${listing.city}, ${listing.state}`}
                />
              </MapView>
            </View>
          </View>
        )}

        {/* Report Section */}
        <View style={styles.reportSection}>
          <TouchableOpacity onPress={handleReportListing} style={styles.reportButton}>
            <Ionicons name="flag-outline" size={16} color="#FF3B30" />
            <Text style={styles.reportText}>Report this listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Contact Footer */}
      {user?.userType === 'tenant' && listing.available && (
        <View style={styles.footer}>
          <CustomButton
            title="Contact Landlord"
            onPress={handleContact}
            style={styles.contactButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounter: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  basicInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  unavailableBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unavailableText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  collegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  college: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availability: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  reportSection: {
    padding: 20,
    alignItems: 'center',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reportText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 6,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  contactButton: {
    marginBottom: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
    marginVertical: 20,
  },
});

export default ListingDetailsScreen;
