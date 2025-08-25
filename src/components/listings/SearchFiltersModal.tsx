import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchFilters } from '../../types';
import { CustomInput } from '../common/CustomInput';
import { CustomButton } from '../common/CustomButton';
import { PickerModal } from '../common/PickerModal';

interface SearchFiltersModalProps {
  visible: boolean;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
  colleges: string[];
}

export const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
  visible,
  filters,
  onApply,
  onClose,
  colleges,
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [showCollegePicker, setShowCollegePicker] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    // Validate price range
    if (localFilters.minRent && localFilters.maxRent && 
        localFilters.minRent > localFilters.maxRent) {
      Alert.alert('Invalid Range', 'Minimum rent cannot be greater than maximum rent');
      return;
    }

    onApply(localFilters);
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = { location: '' };
    setLocalFilters(clearedFilters);
  };

  const handleClose = () => {
    setLocalFilters(filters); // Reset to original filters
    onClose();
  };

  const formatPrice = (price: string) => {
    const numericPrice = price.replace(/[^0-9]/g, '');
    return numericPrice ? parseInt(numericPrice) : undefined;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <CustomInput
              label="City, State, or ZIP Code"
              value={localFilters.location}
              onChangeText={(value) => updateFilter('location', value)}
              placeholder="e.g. Boston, MA or 02115"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>College/University</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCollegePicker(true)}
            >
              <Text style={[
                styles.pickerButtonText,
                !localFilters.college && styles.pickerPlaceholder
              ]}>
                {localFilters.college || 'Select a college'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRange}>
              <View style={styles.priceInput}>
                <CustomInput
                  label="Min Rent"
                  value={localFilters.minRent?.toString() || ''}
                  onChangeText={(value) => updateFilter('minRent', formatPrice(value))}
                  placeholder="$0"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.priceSeparator}>to</Text>
              <View style={styles.priceInput}>
                <CustomInput
                  label="Max Rent"
                  value={localFilters.maxRent?.toString() || ''}
                  onChangeText={(value) => updateFilter('maxRent', formatPrice(value))}
                  placeholder="Any"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.detailsRow}>
              <View style={styles.detailInput}>
                <CustomInput
                  label="Min Bedrooms"
                  value={localFilters.bedrooms?.toString() || ''}
                  onChangeText={(value) => updateFilter('bedrooms', value ? parseInt(value) : undefined)}
                  placeholder="Any"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.detailInput}>
                <CustomInput
                  label="Min Bathrooms"
                  value={localFilters.bathrooms?.toString() || ''}
                  onChangeText={(value) => updateFilter('bathrooms', value ? parseInt(value) : undefined)}
                  placeholder="Any"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title="Apply Filters"
            onPress={handleApply}
            style={styles.applyButton}
          />
        </View>

        <PickerModal
          visible={showCollegePicker}
          title="Select College"
          options={colleges}
          selectedValue={localFilters.college}
          onSelect={(value) => {
            updateFilter('college', value);
            setShowCollegePicker(false);
          }}
          onClose={() => setShowCollegePicker(false)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  pickerPlaceholder: {
    color: '#999999',
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    fontSize: 16,
    color: '#666666',
    paddingTop: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailInput: {
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  applyButton: {
    marginBottom: 0,
  },
});
