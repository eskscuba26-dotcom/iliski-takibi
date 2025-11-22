import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface Photo {
  id: string;
  image_base64: string;
  uploaded_at: string;
}

export default function Index() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mainPhoto, setMainPhoto] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const lastHourRef = useRef<number>(-1);
  const lastDayRef = useRef<number>(-1);

  // Start date: 25 Ocak 2025 20:30 (Turkey time)
  const startDate = new Date('2025-01-25T20:30:00+03:00');

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };
    requestPermissions();
  }, []);

  // Send hourly notification
  const sendHeartNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '❤️ Bir Saat Daha Geçti',
        body: 'Birlikte geçirdiğiniz her an değerli!',
        sound: true,
      },
      trigger: null, // Send immediately
    });
  };

  // Calculate time elapsed
  const calculateTimeElapsed = () => {
    const now = new Date();
    
    // Calculate total difference
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    let hours = now.getHours() - startDate.getHours();
    let minutes = now.getMinutes() - startDate.getMinutes();
    let seconds = now.getSeconds() - startDate.getSeconds();

    // Adjust for negative values
    if (seconds < 0) {
      seconds += 60;
      minutes -= 1;
    }

    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    
    if (hours < 0) {
      hours += 24;
      days -= 1;
    }
    
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months -= 1;
    }
    
    if (months < 0) {
      months += 12;
      years -= 1;
    }

    // Check if hour changed and send notification
    const currentTotalHours = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    if (lastHourRef.current !== -1 && currentTotalHours > lastHourRef.current) {
      sendHeartNotification();
    }
    lastHourRef.current = currentTotalHours;

    setTimeElapsed({
      years: years < 0 ? 0 : years,
      months: months < 0 ? 0 : months,
      days: days < 0 ? 0 : days,
      hours: hours < 0 ? 0 : hours,
      minutes: minutes < 0 ? 0 : minutes,
      seconds: seconds < 0 ? 0 : seconds,
    });
  };

  // Update timer every second
  useEffect(() => {
    calculateTimeElapsed();
    const interval = setInterval(() => {
      calculateTimeElapsed();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Fetch main photo
  const fetchMainPhoto = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/main-photo`);
      if (response.ok) {
        const data = await response.json();
        setMainPhoto(data.main_photo);
      }
    } catch (error) {
      console.error('Error fetching main photo:', error);
    }
  };

  // Fetch photos
  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/photos`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMainPhoto();
    fetchPhotos();
  }, []);

  // Request permissions and pick image
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Fotoğraf yüklemek için galeri erişim izni gereklidir.'
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await uploadPhoto(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Fotoğraf çekmek için kamera erişim izni gereklidir.'
        );
        return;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await uploadPhoto(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
    }
  };

  // Upload photo
  const uploadPhoto = async (base64: string) => {
    setUploading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: `data:image/jpeg;base64,${base64}`,
        }),
      });

      if (response.ok) {
        await fetchPhotos();
        Alert.alert('Başarılı', 'Fotoğraf yüklendi!');
      } else {
        Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Hata', 'Fotoğraf yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  // Delete photo
  const deletePhoto = async (photoId: string) => {
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu fotoğrafı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${EXPO_PUBLIC_BACKEND_URL}/api/photos/${photoId}`,
                { method: 'DELETE' }
              );

              if (response.ok) {
                await fetchPhotos();
                Alert.alert('Başarılı', 'Fotoğraf silindi.');
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Hata', 'Fotoğraf silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  // Update main photo
  const updateMainPhoto = async (base64: string) => {
    setUploading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/main-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: `data:image/jpeg;base64,${base64}`,
        }),
      });

      if (response.ok) {
        await fetchMainPhoto();
        Alert.alert('Başarılı', 'Ana fotoğraf güncellendi!');
      } else {
        Alert.alert('Hata', 'Fotoğraf güncellenemedi.');
      }
    } catch (error) {
      console.error('Error updating main photo:', error);
      Alert.alert('Hata', 'Fotoğraf güncellenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  // Change main photo
  const changeMainPhoto = async () => {
    Alert.alert(
      'Ana Fotoğrafı Değiştir',
      'Nereden fotoğraf seçmek istersiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Galeri',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('İzin Gerekli', 'Galeri erişim izni gereklidir.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              await updateMainPhoto(result.assets[0].base64);
            }
          },
        },
        {
          text: 'Kamera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('İzin Gerekli', 'Kamera erişim izni gereklidir.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              await updateMainPhoto(result.assets[0].base64);
            }
          },
        },
      ]
    );
  };

  // Show image picker options
  const showImageOptions = () => {
    Alert.alert(
      'Fotoğraf Ekle',
      'Nereden fotoğraf eklemek istersiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeri', onPress: pickImage },
        { text: 'Kamera', onPress: takePhoto },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF1493" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Widget Style - Photo, Time, Add Button */}
        <View style={styles.widgetContainer}>
          {/* Left - Photo */}
          <TouchableOpacity
            style={styles.widgetPhoto}
            onPress={changeMainPhoto}
            disabled={uploading}
          >
            {mainPhoto ? (
              <Image
                source={{ uri: mainPhoto }}
                style={styles.widgetPhotoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.widgetPhotoPlaceholder}>
                <Ionicons name="camera" size={24} color="#666" />
              </View>
            )}
          </TouchableOpacity>

          {/* Center - Time Display (Horizontal) */}
          <View style={styles.widgetTimeContainer}>
            <View style={styles.widgetTimeBlock}>
              <Text style={styles.widgetTimeNumber}>{timeElapsed.minutes}</Text>
              <Text style={styles.widgetTimeLabel}>Dakika</Text>
            </View>
            <View style={styles.widgetTimeBlock}>
              <Text style={styles.widgetTimeNumber}>{timeElapsed.hours}</Text>
              <Text style={styles.widgetTimeLabel}>Saat</Text>
            </View>
            <View style={styles.widgetTimeBlock}>
              <Text style={styles.widgetTimeNumber}>{timeElapsed.days}</Text>
              <Text style={styles.widgetTimeLabel}>Gün</Text>
            </View>
            <View style={styles.widgetTimeBlock}>
              <Text style={styles.widgetTimeNumber}>{timeElapsed.months}</Text>
              <Text style={styles.widgetTimeLabel}>Ay</Text>
            </View>
            <View style={styles.widgetTimeBlock}>
              <Text style={styles.widgetTimeNumber}>{timeElapsed.years}</Text>
              <Text style={styles.widgetTimeLabel}>Yıl</Text>
            </View>
          </View>

          {/* Right - Add Button (Small) */}
          <TouchableOpacity
            style={styles.widgetAddButton}
            onPress={showImageOptions}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#999" />
            ) : (
              <Ionicons name="add" size={24} color="#999" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  widgetContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  widgetPhoto: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
  },
  widgetPhotoImage: {
    width: '100%',
    height: '100%',
  },
  widgetPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetTimeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  widgetTimeBlock: {
    alignItems: 'center',
  },
  widgetTimeNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  widgetTimeLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  widgetAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
