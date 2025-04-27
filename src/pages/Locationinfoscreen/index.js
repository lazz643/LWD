import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {arrowback, camera, location2} from '../../assets/icon';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BoxInfo} from '../../components/molecules';
import ImageViewing from 'react-native-image-viewing';
import openMap from 'react-native-open-maps';

const Locationinfoscreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const location = route.params?.location || {}; // Menggunakan project sebagai objek yang dilewatkan
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState([]);

  const handleImageClick = (locationImages, index) => {
    setImages(locationImages.map(image => ({uri: image.uri})));
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const handleOpenMap = () => {
    if (location.latitude && location.longitude) {
      Alert.alert('Alert', 'Make sure location mode is enabled.', [
        {
          text: 'OK',
          onPress: () => {
            const latitude = location.latitude;
            const longitude = location.longitude;
            openMap({latitude, longitude});
          },
        },
      ]);
    } else {
      Alert.alert(
        'Location not available',
        'Please wait until your location is detected.',
      );
    }
  };

  const handleDrops = location => {
    // Navigasi ke ProjectScreen dengan detail proyek
    navigation.navigate('Projectscreen', {location});
  };

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <ScrollView>
        <BoxInfo
          items={[
            {
              label: 'Name: ',
              value: location.L_title,
            },
            {
              label: 'Description: ',
              value: location.description,
            },
            {
              label: 'Soil Moisture Content: ',
              value: location.soil,
            },
            {
              label: 'Project Start: ',
              value: location.projectStart,
            },
            {
              label: 'Air Temperature: ',
              value: location.air,
            },
            {
              label: 'Surface Temperature: ',
              value: location.surface,
            },
            {
              label: 'Material Temperature: ',
              value: location.material,
            },
          ]}
        />

        <View style={styles.boxx}>
          <Text style={styles.label5}>Images</Text>
          {/* Mengecek apakah ada gambar di imageUris */}
          {location.imageUris && location.imageUris.length > 0 ? (
            // Menampilkan daftar gambar secara dinamis
            <View style={styles.imageContainer}>
              {location.imageUris.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImageClick(location.imageUris, index)}>
                  <Image source={{uri: image.uri}} style={styles.image} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Menampilkan teks jika tidak ada gambar
            <Text style={styles.noImageText}>No images saved</Text>
          )}
        </View>

        <TouchableOpacity style={styles.mapsbutton} onPress={handleOpenMap}>
          <Image source={location2} style={styles.mapsIcon} />
          <Text style={styles.label2}>Open Maps</Text>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity
        style={styles.box3}
        onPress={() => handleDrops(location)}>
        <Text style={styles.label6}>Drops </Text>
      </TouchableOpacity>

      <ImageViewing
        images={images}
        imageIndex={selectedImageIndex}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#FFCC00',
    borderRadius: 5,
    marginTop: 5,
    padding: 10,
    marginHorizontal: 16,
  },
  boxx: {
    marginHorizontal: 16,
    backgroundColor: '#FFCC00',
    borderRadius: 5,
    marginTop: 25,
    padding: 15,
    marginBottom: 10,
  },
  mapsbutton: {
    marginHorizontal: 16,
    height: 90,
    backgroundColor: '#4541E4',
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 5,
    marginBottom: 80,
    justifyContent: 'center',
  },
  mapsIcon: {
    width: 30,
    height: 37,
    alignSelf: 'center',
    top: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoContainer: {
    width: '60%',
    alignItems: 'flex-end',
  },
  label1: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  label2: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 55,
    top: 6,
  },
  label5: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    width: '35%',
    marginBottom: 10,
  },
  label6: {
    fontSize: 18,
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  imageContainer: {
    flexDirection: 'row', // Menyusun gambar dalam satu baris
    flexWrap: 'wrap', // Membungkus gambar ke baris berikutnya jika penuh
    justifyContent: 'flex-start', // Mengatur gambar agar mulai dari kiri
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    margin: 6,
  },
  noImageText: {
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  info1: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 20,
    textAlign: 'justify',
  },
  box3: {
    height: 45,
    marginHorizontal: 16,
    backgroundColor: '#4541E4',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 30,
    justifyContent: 'center',
  },
});

export default Locationinfoscreen;
