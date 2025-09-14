import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CollegeSearchService, { College } from '../../services/CollegeSearchService';

interface CollegeSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onCollegeSelect: (college: College) => void;
  placeholder?: string;
  style?: any;
  showPopularOnFocus?: boolean;
}

const CollegeSearchInput: React.FC<CollegeSearchInputProps> = ({
  value,
  onChangeText,
  onCollegeSelect,
  placeholder = "Search colleges and universities...",
  style,
  showPopularOnFocus = true,
}) => {
  const [suggestions, setSuggestions] = useState<College[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popularColleges, setPopularColleges] = useState<College[]>([]);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load popular colleges on mount
    loadPopularColleges();
  }, []);

  useEffect(() => {
    // Animate suggestions container
    Animated.timing(animatedHeight, {
      toValue: showSuggestions ? Math.min(suggestions.length * 60, 240) : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showSuggestions, suggestions.length]);

  const loadPopularColleges = async () => {
    try {
      const colleges = await CollegeSearchService.getPopularColleges();
      setPopularColleges(colleges);
    } catch (error) {
      console.error('Error loading popular colleges:', error);
    }
  };

  const searchColleges = async (query: string) => {
    if (query.length < 2) {
      setSuggestions(showPopularOnFocus ? popularColleges.slice(0, 8) : []);
      return;
    }

    setLoading(true);
    
    try {
      const result = await CollegeSearchService.searchColleges(query, 8);
      setSuggestions(result.colleges);
    } catch (error) {
      console.error('Error searching colleges:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchColleges(text);
    }, 300); // Debounce search by 300ms
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    if (value.length < 2 && showPopularOnFocus) {
      setSuggestions(popularColleges.slice(0, 8));
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleCollegeSelect = (college: College) => {
    onCollegeSelect(college);
    onChangeText(college.name);
    setShowSuggestions(false);
  };

  const renderSuggestionItem = ({ item }: { item: College }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleCollegeSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionContent}>
        <View style={styles.suggestionIcon}>
          <Ionicons name="school-outline" size={20} color="#007AFF" />
        </View>
        <View style={styles.suggestionText}>
          <Text style={styles.collegeName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.collegeLocation} numberOfLines={1}>
            {item.city}, {item.stateCode}
          </Text>
        </View>
        {item.type && (
          <View style={[
            styles.typeChip, 
            { backgroundColor: item.type === 'private' ? '#FF6B6B' : '#4ECDC4' }
          ]}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          autoCapitalize="words"
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIcon} />
        )}
        {value.length > 0 && !loading && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              setSuggestions(showPopularOnFocus ? popularColleges.slice(0, 8) : []);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#999999" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <Animated.View style={[styles.suggestionsContainer, { height: animatedHeight }]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              loading ? null : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {value.length < 2 
                      ? "Start typing to search colleges..." 
                      : "No colleges found"}
                  </Text>
                </View>
              )
            }
            ListHeaderComponent={
              value.length < 2 && popularColleges.length > 0 ? (
                <View style={styles.headerContainer}>
                  <Text style={styles.headerText}>Popular Colleges</Text>
                </View>
              ) : null
            }
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 1001,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  collegeLocation: {
    fontSize: 14,
    color: '#666666',
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default CollegeSearchInput;
