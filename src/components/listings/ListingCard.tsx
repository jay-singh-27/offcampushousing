import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '../../types';

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
  style?: ViewStyle;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
  style,
}) => {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}/month`;
  };

  const formatBedBath = (bedrooms: number, bathrooms: number) => {
    return `${bedrooms} bed • ${bathrooms} bath`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: listing.images[0] || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
          resizeMode="cover"
        />
        {listing.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatPrice(listing.rent)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {listing.title}
          </Text>
          {!listing.available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Rented</Text>
            </View>
          )}
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#666666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {listing.city}, {listing.state}
          </Text>
        </View>

        {listing.college && (
          <View style={styles.collegeContainer}>
            <Ionicons name="school-outline" size={14} color="#666666" />
            <Text style={styles.collegeText} numberOfLines={1}>
              Near {listing.college}
            </Text>
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.detailsText}>
            {formatBedBath(listing.bedrooms, listing.bathrooms)}
          </Text>
          <Text style={styles.availableDate}>
            Available {new Date(listing.availableDate).toLocaleDateString()}
          </Text>
        </View>

        {listing.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {listing.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {listing.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>
                +{listing.amenities.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 8,
  },
  unavailableBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unavailableText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
    flex: 1,
  },
  collegeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  collegeText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  availableDate: {
    fontSize: 12,
    color: '#666666',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  amenityTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  moreAmenities: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
});
