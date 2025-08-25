import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AmenitiesSelectorProps {
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
}

const AVAILABLE_AMENITIES = [
  { id: 'wifi', name: 'WiFi', icon: 'wifi' },
  { id: 'parking', name: 'Parking', icon: 'car' },
  { id: 'laundry', name: 'Laundry', icon: 'shirt' },
  { id: 'dishwasher', name: 'Dishwasher', icon: 'restaurant' },
  { id: 'air-conditioning', name: 'Air Conditioning', icon: 'snow' },
  { id: 'heating', name: 'Heating', icon: 'flame' },
  { id: 'gym', name: 'Gym', icon: 'fitness' },
  { id: 'pool', name: 'Pool', icon: 'water' },
  { id: 'pet-friendly', name: 'Pet Friendly', icon: 'paw' },
  { id: 'furnished', name: 'Furnished', icon: 'bed' },
  { id: 'balcony', name: 'Balcony', icon: 'home' },
  { id: 'yard', name: 'Yard', icon: 'leaf' },
  { id: 'security', name: 'Security System', icon: 'shield-checkmark' },
  { id: 'elevator', name: 'Elevator', icon: 'arrow-up' },
  { id: 'storage', name: 'Storage', icon: 'cube' },
  { id: 'bike-storage', name: 'Bike Storage', icon: 'bicycle' },
  { id: 'rooftop', name: 'Rooftop Access', icon: 'business' },
  { id: 'concierge', name: 'Concierge', icon: 'person' },
  { id: 'hardwood', name: 'Hardwood Floors', icon: 'grid' },
  { id: 'fireplace', name: 'Fireplace', icon: 'bonfire' },
];

export const AmenitiesSelector: React.FC<AmenitiesSelectorProps> = ({
  selectedAmenities,
  onAmenitiesChange,
}) => {
  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onAmenitiesChange(selectedAmenities.filter(id => id !== amenityId));
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId]);
    }
  };

  const renderAmenity = (amenity: typeof AVAILABLE_AMENITIES[0]) => {
    const isSelected = selectedAmenities.includes(amenity.id);
    
    return (
      <TouchableOpacity
        key={amenity.id}
        style={[
          styles.amenityItem,
          isSelected && styles.selectedAmenityItem,
        ]}
        onPress={() => toggleAmenity(amenity.id)}
      >
        <View style={[
          styles.amenityIcon,
          isSelected && styles.selectedAmenityIcon,
        ]}>
          <Ionicons
            name={amenity.icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={isSelected ? '#FFFFFF' : '#666666'}
          />
        </View>
        <Text style={[
          styles.amenityText,
          isSelected && styles.selectedAmenityText,
        ]}>
          {amenity.name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color="#007AFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Select all amenities that apply to your property
      </Text>
      
      <View style={styles.amenitiesGrid}>
        {AVAILABLE_AMENITIES.map(renderAmenity)}
      </View>

      {selectedAmenities.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>
            Selected ({selectedAmenities.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedList}>
              {selectedAmenities.map(amenityId => {
                const amenity = AVAILABLE_AMENITIES.find(a => a.id === amenityId);
                if (!amenity) return null;
                
                return (
                  <View key={amenityId} style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>{amenity.name}</Text>
                    <TouchableOpacity
                      onPress={() => toggleAmenity(amenityId)}
                      style={styles.removeTagButton}
                    >
                      <Ionicons name="close" size={14} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  selectedAmenityItem: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  amenityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedAmenityIcon: {
    backgroundColor: '#007AFF',
  },
  amenityText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    marginRight: 8,
  },
  selectedAmenityText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  selectedSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  selectedList: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTagText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 6,
  },
  removeTagButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
