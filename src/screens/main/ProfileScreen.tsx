import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { CustomButton } from '../../components/common/CustomButton';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const profileOptions = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        // TODO: Navigate to edit profile screen
        Alert.alert('Coming Soon', 'Profile editing will be available soon');
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        // TODO: Navigate to notifications settings
        Alert.alert('Coming Soon', 'Notification settings will be available soon');
      },
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      icon: 'card-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        // TODO: Navigate to payment methods
        Alert.alert('Coming Soon', 'Payment methods will be available soon');
      },
      showForLandlord: true,
    },
    {
      id: 'favorites',
      title: 'Saved Properties',
      icon: 'heart-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        // TODO: Navigate to saved properties
        Alert.alert('Coming Soon', 'Saved properties will be available soon');
      },
      showForTenant: true,
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        // TODO: Navigate to help screen
        Alert.alert('Coming Soon', 'Help & Support will be available soon');
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        // TODO: Navigate to privacy policy
        Alert.alert('Coming Soon', 'Privacy Policy will be available soon');
      },
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        // TODO: Navigate to terms of service
        Alert.alert('Coming Soon', 'Terms of Service will be available soon');
      },
    },
  ];

  const filteredOptions = profileOptions.filter(option => {
    if (option.showForLandlord && user?.userType !== 'landlord') return false;
    if (option.showForTenant && user?.userType !== 'tenant') return false;
    return true;
  });

  const renderProfileOption = (option: typeof profileOptions[0]) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionItem}
      onPress={option.onPress}
    >
      <View style={styles.optionLeft}>
        <View style={styles.optionIcon}>
          <Ionicons name={option.icon} size={22} color="#007AFF" />
        </View>
        <Text style={styles.optionTitle}>{option.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.userTypeBadge}>
                <Text style={styles.userTypeText}>
                  {user?.userType === 'landlord' ? 'Landlord' : 'Tenant'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {user?.userType === 'landlord' ? '0' : '0'}
            </Text>
            <Text style={styles.statLabel}>
              {user?.userType === 'landlord' ? 'Active Listings' : 'Saved Properties'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>
              {user?.userType === 'landlord' ? 'Total Views' : 'Applications'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Date(user?.createdAt || new Date()).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        <View style={styles.optionsSection}>
          {filteredOptions.map(renderProfileOption)}
        </View>

        <View style={styles.logoutSection}>
          <CustomButton
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 OffCampus Housing</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  userTypeBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  optionsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoutButton: {
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});

export default ProfileScreen;
