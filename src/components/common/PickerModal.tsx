import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  allowClear?: boolean;
}

export const PickerModal: React.FC<PickerModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  allowClear = true,
}) => {
  const renderOption = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.option,
        selectedValue === item && styles.selectedOption,
      ]}
      onPress={() => onSelect(item)}
    >
      <Text
        style={[
          styles.optionText,
          selectedValue === item && styles.selectedOptionText,
        ]}
      >
        {item}
      </Text>
      {selectedValue === item && (
        <Ionicons name="checkmark" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  const allOptions = allowClear && selectedValue ? ['Clear Selection', ...options] : options;

  const handleSelect = (value: string) => {
    if (value === 'Clear Selection') {
      onSelect('');
    } else {
      onSelect(value);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={allOptions}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.option,
                selectedValue === item && styles.selectedOption,
                item === 'Clear Selection' && styles.clearOption,
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedValue === item && styles.selectedOptionText,
                  item === 'Clear Selection' && styles.clearOptionText,
                ]}
              >
                {item}
              </Text>
              {selectedValue === item && item !== 'Clear Selection' && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          style={styles.list}
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
  placeholder: {
    width: 32,
  },
  list: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectedOption: {
    backgroundColor: '#F0F8FF',
  },
  clearOption: {
    backgroundColor: '#FFF5F5',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  clearOptionText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});
