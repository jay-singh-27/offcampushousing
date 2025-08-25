import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserTypeSelectorProps {
  selectedType: 'landlord' | 'tenant';
  onTypeChange: (type: 'landlord' | 'tenant') => void;
}

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const userTypes = [
    {
      type: 'tenant' as const,
      title: 'Tenant',
      description: 'Looking for housing',
      icon: 'search-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      type: 'landlord' as const,
      title: 'Landlord',
      description: 'Listing properties',
      icon: 'home-outline' as keyof typeof Ionicons.glyphMap,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>I am a...</Text>
      <View style={styles.optionsContainer}>
        {userTypes.map((userType) => (
          <TouchableOpacity
            key={userType.type}
            style={[
              styles.option,
              selectedType === userType.type && styles.selectedOption,
            ]}
            onPress={() => onTypeChange(userType.type)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Ionicons
                name={userType.icon}
                size={24}
                color={selectedType === userType.type ? '#007AFF' : '#666666'}
              />
              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionTitle,
                    selectedType === userType.type && styles.selectedOptionTitle,
                  ]}
                >
                  {userType.title}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    selectedType === userType.type && styles.selectedOptionDescription,
                  ]}
                >
                  {userType.description}
                </Text>
              </View>
              {selectedType === userType.type && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  selectedOptionTitle: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  selectedOptionDescription: {
    color: '#0066CC',
  },
});
