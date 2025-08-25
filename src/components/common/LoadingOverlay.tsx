import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Modal,
} from 'react-native';

interface LoadingOverlayProps {
  visible?: boolean;
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  message = 'Loading...',
  transparent = true,
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={transparent}
      animationType="fade"
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
});
