import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList, Listing } from '../../types';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { PickerModal } from '../../components/common/PickerModal';
import { ImagePicker } from '../../components/forms/ImagePicker';
import { AmenitiesSelector } from '../../components/forms/AmenitiesSelector';
import { HybridPaymentService } from '../../services/HybridPaymentService';
import { mockColleges } from '../../utils/mockData';

type CreateListingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateListing'>;

interface ListingFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  college: string;
  rent: string;
  bedrooms: string;
  bathrooms: string;
  availableDate: string;
  images: string[];
  amenities: string[];
}

const LISTING_FEE = 25; // $25 to post a listing

const CreateListingScreen: React.FC = () => {
  const navigation = useNavigation<CreateListingScreenNavigationProp>();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    college: '',
    rent: '',
    bedrooms: '',
    bathrooms: '',
    availableDate: '',
    images: [],
    amenities: [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showCollegePicker, setShowCollegePicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const updateFormData = (field: keyof ListingFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your listing');
      return false;
    }
    
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    
    if (!formData.address.trim() || !formData.city.trim() || !formData.state) {
      Alert.alert('Error', 'Please enter the complete address');
      return false;
    }
    
    if (!formData.zipCode.trim()) {
      Alert.alert('Error', 'Please enter the ZIP code');
      return false;
    }
    
    const rent = parseFloat(formData.rent);
    if (!formData.rent || isNaN(rent) || rent <= 0) {
      Alert.alert('Error', 'Please enter a valid rent amount');
      return false;
    }
    
    const bedrooms = parseInt(formData.bedrooms);
    const bathrooms = parseFloat(formData.bathrooms);
    
    if (!formData.bedrooms || isNaN(bedrooms) || bedrooms < 0) {
      Alert.alert('Error', 'Please enter a valid number of bedrooms');
      return false;
    }
    
    if (!formData.bathrooms || isNaN(bathrooms) || bathrooms <= 0) {
      Alert.alert('Error', 'Please enter a valid number of bathrooms');
      return false;
    }
    
    if (!formData.availableDate) {
      Alert.alert('Error', 'Please enter the available date');
      return false;
    }

    if (formData.images.length === 0) {
      Alert.alert('Error', 'Please add at least one photo of your property');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Show Stripe payment dialog
    const result = await HybridPaymentService.showStripePaymentDialog({
      listingId: 'new',
      amount: LISTING_FEE,
      description: 'OffCampus Housing - Listing Fee',
    });
    
    if (result.success) {
      // Payment flow initiated successfully
      // The user will be redirected to Stripe Checkout in their browser
      // Return handling will be done via deep links
      Alert.alert(
        'Redirecting to Payment',
        'You will now be redirected to Stripe for secure payment processing. Please complete your payment and return to the app.',
        [{ text: 'OK' }]
      );
    } else if (result.method !== 'cancelled') {
      Alert.alert('Error', 'Failed to start payment process. Please try again.');
    }
  };

  const handleGoBack = () => {
    if (Object.values(formData).some(value => 
      Array.isArray(value) ? value.length > 0 : value.trim() !== ''
    )) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to go back? Your changes will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Listing</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <CustomInput
              label="Property Title *"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="e.g. Modern 2BR Apartment Near Campus"
              style={styles.input}
            />

            <CustomInput
              label="Description *"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Describe your property, amenities, and neighborhood..."
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            <CustomInput
              label="Street Address *"
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              placeholder="123 Main Street"
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={styles.flex}>
                <CustomInput
                  label="City *"
                  value={formData.city}
                  onChangeText={(value) => updateFormData('city', value)}
                  placeholder="Boston"
                  style={styles.input}
                />
              </View>
              
              <View style={styles.stateContainer}>
                <Text style={styles.inputLabel}>State *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowStatePicker(true)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    !formData.state && styles.pickerPlaceholder
                  ]}>
                    {formData.state || 'State'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flex}>
                <CustomInput
                  label="ZIP Code *"
                  value={formData.zipCode}
                  onChangeText={(value) => updateFormData('zipCode', value)}
                  placeholder="02115"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.collegeSection}>
              <Text style={styles.inputLabel}>Nearby College/University</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCollegePicker(true)}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.college && styles.pickerPlaceholder
                ]}>
                  {formData.college || 'Select a college (optional)'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            
            <CustomInput
              label="Monthly Rent *"
              value={formData.rent}
              onChangeText={(value) => updateFormData('rent', value.replace(/[^0-9]/g, ''))}
              placeholder="2500"
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={styles.flex}>
                <CustomInput
                  label="Bedrooms *"
                  value={formData.bedrooms}
                  onChangeText={(value) => updateFormData('bedrooms', value.replace(/[^0-9]/g, ''))}
                  placeholder="2"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              
              <View style={styles.flex}>
                <CustomInput
                  label="Bathrooms *"
                  value={formData.bathrooms}
                  onChangeText={(value) => updateFormData('bathrooms', value.replace(/[^0-9.]/g, ''))}
                  placeholder="1.5"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <CustomInput
              label="Available Date *"
              value={formData.availableDate}
              onChangeText={(value) => updateFormData('availableDate', value)}
              placeholder="MM/DD/YYYY"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ImagePicker
              images={formData.images}
              onImagesChange={(images) => updateFormData('images', images)}
              maxImages={10}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <AmenitiesSelector
              selectedAmenities={formData.amenities}
              onAmenitiesChange={(amenities) => updateFormData('amenities', amenities)}
            />
          </View>

          <View style={styles.feeSection}>
            <View style={styles.feeCard}>
              <Ionicons name="card-outline" size={24} color="#007AFF" />
              <View style={styles.feeInfo}>
                <Text style={styles.feeTitle}>Listing Fee</Text>
                <Text style={styles.feeDescription}>
                  One-time fee to post your listing for 30 days
                </Text>
              </View>
              <Text style={styles.feeAmount}>${LISTING_FEE}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title={`Pay $${LISTING_FEE} & Publish Listing`}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>

      <PickerModal
        visible={showCollegePicker}
        title="Select College"
        options={mockColleges}
        selectedValue={formData.college}
        onSelect={(value) => {
          updateFormData('college', value);
          setShowCollegePicker(false);
        }}
        onClose={() => setShowCollegePicker(false)}
        allowClear
      />

      <PickerModal
        visible={showStatePicker}
        title="Select State"
        options={states}
        selectedValue={formData.state}
        onSelect={(value) => {
          updateFormData('state', value);
          setShowStatePicker(false);
        }}
        onClose={() => setShowStatePicker(false)}
        allowClear={false}
      />

      {isLoading && <LoadingOverlay message="Creating listing..." />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 32,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  stateContainer: {
    width: 100,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
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
    minHeight: 48,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  pickerPlaceholder: {
    color: '#999999',
  },
  collegeSection: {
    marginTop: 16,
  },
  feeSection: {
    paddingVertical: 20,
  },
  feeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  feeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  feeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  feeDescription: {
    fontSize: 14,
    color: '#666666',
  },
  feeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    marginBottom: 0,
  },
});

export default CreateListingScreen;
