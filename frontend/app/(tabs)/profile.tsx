import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  TextInput,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { Colors } from '../../constants/colors';
import { Config } from '../../constants/config';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);

  // Edit Goal State
  const [goal, setGoal] = useState(user?.daily_goal_minutes?.toString() || '15');
  // Server IP state
  const [customIp, setCustomIp] = useState('');

  const handleUpdateGoal = async () => {
    try {
      const minutes = parseInt(goal, 10);
      if (isNaN(minutes) || minutes < 5) {
        Alert.alert('Invalid Goal', 'Please enter a target of at least 5 minutes.');
        return;
      }
      await userService.updateProfile({ daily_goal_minutes: minutes });
      await refreshUser();
      setModalVisible(false);
      Alert.alert('Success', 'Daily learning goal updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSaveServerIp = async () => {
    if (!customIp) return;
    await AsyncStorage.setItem('@englishgo_api_url', customIp.trim());
    setServerModalVisible(false);
    Alert.alert('Server Configured', `API URL updated to: ${customIp.trim()}`);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Settings</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <Image
          source={{
            uri:
              user?.avatar_url ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.full_name || 'Nguyen Van A'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'student@englishgo.edu.vn'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="school" size={12} color={Colors.primary} />
            <Text style={styles.roleText}>Student Learner</Text>
          </View>
        </View>
      </View>

      {/* Learning Preferences */}
      <Text style={styles.sectionHeader}>LEARNING PREFERENCES</Text>
      <View style={styles.menuGroup}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
          <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="timer-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.menuBody}>
            <Text style={styles.menuTitle}>Daily Study Goal</Text>
            <Text style={styles.menuSubtitle}>{user?.daily_goal_minutes || 15} minutes / day</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="notifications-outline" size={20} color="#D97706" />
          </View>
          <View style={styles.menuBody}>
            <Text style={styles.menuTitle}>Study Reminder</Text>
            <Text style={styles.menuSubtitle}>Notify daily at 8:00 PM</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>
      </View>

      {/* Technical & Defense Settings */}
      <Text style={styles.sectionHeader}>TECHNICAL & DEMO SETTINGS</Text>
      <View style={styles.menuGroup}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setServerModalVisible(true)}>
          <View style={[styles.menuIcon, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="server-outline" size={20} color="#059669" />
          </View>
          <View style={styles.menuBody}>
            <Text style={styles.menuTitle}>Backend Server Connection</Text>
            <Text style={styles.menuSubtitle}>Configure IP for Real Device Demo</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
          </View>
          <View style={styles.menuBody}>
            <Text style={styles.menuTitle}>App Version</Text>
            <Text style={styles.menuSubtitle}>EnglishGo v{Config.version} (Mobile Final Project)</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Modal: Edit Goal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Set Daily Study Goal</Text>
            <Text style={styles.modalDesc}>How many minutes do you want to practice each day?</Text>

            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={goal}
              onChangeText={setGoal}
              placeholder="e.g. 20"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleUpdateGoal}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Server IP */}
      <Modal visible={serverModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Configure API Server</Text>
            <Text style={styles.modalDesc}>
              Enter your computer's local IP address (e.g. http://192.168.1.100:5000/api)
            </Text>

            <TextInput
              style={styles.modalInput}
              value={customIp}
              onChangeText={setCustomIp}
              placeholder="http://192.168.x.x:5000/api"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setServerModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleSaveServerIp}
              >
                <Text style={styles.modalSaveText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5
  },
  menuGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  menuBody: {
    flex: 1
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 10
  },
  logoutText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  modalBox: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18
  },
  modalInput: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 10
  },
  modalCancelBtn: {
    backgroundColor: Colors.surfaceAlt
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary
  },
  modalSaveText: {
    color: Colors.white,
    fontWeight: '700'
  }
});

