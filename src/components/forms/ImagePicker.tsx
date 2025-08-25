import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
}) => {
  const handleAddImage = () => {
    if (images.length >= maxImages) {
      Alert.alert('Maximum Images', `You can only add up to ${maxImages} images`);
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Camera',
          onPress: () => {
            // TODO: Implement camera functionality
            // For now, add a placeholder image
            const newImages = [...images, `https://picsum.photos/400/300?random=${Date.now()}`];
            onImagesChange(newImages);
          },
        },
        {
          text: 'Photo Library',
          onPress: () => {
            // TODO: Implement photo library functionality
            // For now, add a placeholder image
            const newImages = [...images, `https://picsum.photos/400/300?random=${Date.now()}`];
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Add up to {maxImages} photos. The first photo will be used as the main image.
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.imageList}>
          {/* Add Image Button */}
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={handleAddImage}
            disabled={images.length >= maxImages}
          >
            <Ionicons 
              name="camera" 
              size={32} 
              color={images.length >= maxImages ? '#CCCCCC' : '#007AFF'} 
            />
            <Text style={[
              styles.addImageText,
              images.length >= maxImages && styles.disabledText
            ]}>
              Add Photo
            </Text>
          </TouchableOpacity>

          {/* Image Items */}
          {images.map((image, index) => (
            <View key={index} style={styles.imageItem}>
              <Image source={{ uri: image }} style={styles.image} />
              
              {/* Main Image Badge */}
              {index === 0 && (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>Main</Text>
                </View>
              )}

              {/* Remove Button */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>

              {/* Order Number */}
              <View style={styles.orderBadge}>
                <Text style={styles.orderText}>{index + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {images.length > 0 && (
        <Text style={styles.helpText}>
          Tap and hold to reorder photos. The first photo will be the main image.
        </Text>
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
    marginBottom: 12,
    lineHeight: 20,
  },
  imageList: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FAFAFA',
  },
  addImageText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  disabledText: {
    color: '#CCCCCC',
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  mainBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mainBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  orderBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
