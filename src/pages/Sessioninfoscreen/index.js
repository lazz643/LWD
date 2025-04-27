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
import {arrowback, trash} from '../../assets/icon';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {BoxInfo, ListInfo} from '../../components/molecules';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Sessioninfoscreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const session = route.params?.session || {}; // Menggunakan project sebagai objek yang dilewatkan

  const [sensorDatas, setSensorDatas] = useState([]);
  const [l_Filter, setL_Filter] = useState([]);
  const [locations, setLocations] = useState([]);

  // Fungsi untuk mengambil daftar lokasi dari AsyncStorage
  const loadLocationsFromStorage = async () => {
    try {
      const storedLocations = await AsyncStorage.getItem('locations');
      if (storedLocations) {
        const parsedLocations = JSON.parse(storedLocations);
        // Memfilter lokasi berdasarkan S_id yang cocok dengan session.S_id
        const filteredLocations = parsedLocations.filter(
          location => location.S_id === session.S_id,
        );
        setL_Filter(filteredLocations);
        setLocations(parsedLocations);
        console.log(
          'Filtered locations loaded successfully:',
          filteredLocations,
        ); // Log saat data berhasil difilter dan dimuat
      } else {
        console.log('No locations found for this project.');
      }
    } catch (error) {
      console.error('Failed to load locations from storage', error);
    }
  };

  const loadSensorDataFromStorage = async () => {
    try {
      const storedSensorDatas = await AsyncStorage.getItem('SensorDatas');
      if (storedSensorDatas) {
        setSensorDatas(JSON.parse(storedSensorDatas));
        console.log(
          'SensorDatas loaded successfully:',
          JSON.parse(storedSensorDatas),
        );
      }
    } catch (error) {
      console.error('Failed to load SensorDatas from storage', error);
    }
  };

  // Memuat ulang lokasi setiap kali layar difokuskan
  useFocusEffect(
    React.useCallback(() => {
      loadLocationsFromStorage();
      loadSensorDataFromStorage();
    }, [session.S_id]), // Pastikan ini diperbarui jika `project.S_id` berubah
  );

  // Fungsi untuk menghapus lokasi dengan konfirmasi
  const handleDeleteLocation = index => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this location?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const locationToDelete = l_Filter[index];

            const newLocationsFilter = l_Filter.filter((_, i) => i !== index);
            const newLocations = locations.filter(
              location => location.L_id !== locationToDelete.L_id,
            );

            setL_Filter(newLocationsFilter);
            setLocations(newLocations);
            console.log('Location deleted successfully:', newLocations);

            const newSensorDatas = sensorDatas.filter(
              sensorData => sensorData.L_id !== locationToDelete.L_id,
            );
            setSensorDatas(newSensorDatas);

            await saveLocationsToStorage(newLocations); // Simpan perubahan ke AsyncStorage
            await saveSensorToStorage(newSensorDatas);
          },
          style: 'destructive',
        },
      ],
    );
  };

  // Fungsi untuk menyimpan lokasi ke AsyncStorage
  const saveLocationsToStorage = async newLocations => {
    try {
      await AsyncStorage.setItem('locations', JSON.stringify(newLocations));
      console.log('Locations saved successfully:', newLocations); // Log saat data berhasil disimpan
    } catch (error) {
      console.error('Failed to save locations to storage', error);
    }
  };

  const saveSensorToStorage = async newSensorDatas => {
    try {
      await AsyncStorage.setItem('SensorDatas', JSON.stringify(newSensorDatas));
      console.log('SensorDatas saved successfully:', newSensorDatas);
    } catch (error) {
      console.error('Failed to save SensorDatas to storage', error);
    }
  };

  const handleCreateLocation = () => {
    navigation.navigate('Createlocationscreen', {session});
  };

  const handleLocationClick = location => {
    // Navigasi ke ProjectInfoScreen dengan detail proyek
    navigation.navigate('Locationinfoscreen', {location});
  };
  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <ScrollView>
        <BoxInfo
          items={[
            {
              label: 'Name: ',
              value: session.S_title,
            },
            {
              label: 'Description: ',
              value: session.description,
            },
            {
              label: 'Wheater: ',
              value: session.wheater,
            },
            {
              label: 'Material Type: ',
              value: session.materialType,
            },
            {label: 'Layer: ', value: session.layer},
            {
              label: 'Session Start: ',
              value: session.projectStart,
            },
          ]}
        />

        <ListInfo
          title="Locations"
          data={l_Filter}
          onItemPress={handleLocationClick}
          onDeletePress={handleDeleteLocation}
          emptyText="No Locations saved"
        />
      </ScrollView>
      {/* Tombol Create berada di luar ScrollView */}
      <TouchableOpacity style={styles.box3} onPress={handleCreateLocation}>
        <Text style={styles.label6}>Create New Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  label6: {
    fontSize: 18,
    color: '#FFFFFF',
    alignSelf: 'center',
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
  scrollContainer: {
    maxHeight: 150,
    marginTop: 10,
  },
});

export default Sessioninfoscreen;
