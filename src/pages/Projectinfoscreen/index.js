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

const ProjectinfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const project = route.params?.project || {};

  const [s_Filter, setS_Filter] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sensorDatas, setSensorDatas] = useState([]);

  // Fungsi untuk mengambil daftar sesi dari AsyncStorage
  const loadSessionsFromStorage = async () => {
    try {
      const storedSessions = await AsyncStorage.getItem('sessions');
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        // Memfilter sesi berdasarkan P_id yang cocok dengan project.P_id
        const filteredSessions = parsedSessions.filter(
          session => session.P_id === project.P_id,
        );
        setSessions(parsedSessions);
        setS_Filter(filteredSessions);
        console.log('Filtered sessions loaded successfully:', filteredSessions); // Log saat data berhasil difilter dan dimuat
      } else {
        console.log('No sessions found for this project.');
      }
    } catch (error) {
      console.error('Failed to load sessions from storage', error);
    }
  };

  // Fungsi untuk mengambil daftar lokasi dari AsyncStorage
  const loadLocationsFromStorage = async () => {
    try {
      const storedLocations = await AsyncStorage.getItem('locations');
      if (storedLocations) {
        const parsedLocations = JSON.parse(storedLocations);
        setLocations(parsedLocations);
        console.log('All locations loaded successfully:', parsedLocations); // Log saat data berhasil difilter dan dimuat
      } else {
        console.log('No locations found.');
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

  // Memuat ulang sesi setiap kali layar difokuskan
  useFocusEffect(
    React.useCallback(() => {
      loadSessionsFromStorage();
      loadLocationsFromStorage();
      loadSensorDataFromStorage();
    }, [project.P_id]), // Pastikan ini diperbarui jika `project.title` berubah
  );

  // Fungsi untuk menghapus sesi dengan konfirmasi
  const handleDeleteSession = index => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const sessionToDelete = s_Filter[index]; // Get the session to delete

            const newSessionsFilter = s_Filter.filter((_, i) => i !== index);
            const newSessions = sessions.filter(
              session => session.S_id !== sessionToDelete.S_id,
            );

            setS_Filter(newSessionsFilter);
            setSessions(newSessions);
            console.log('Sessions deleted successfully:', newSessions);

            // Delete corresponding locations
            const newLocations = locations.filter(
              location => location.S_id !== sessionToDelete.S_id,
            );
            setLocations(newLocations);

            const newSensorDatas = sensorDatas.filter(
              sensorData => sensorData.S_id !== sessionToDelete.S_id,
            );
            setSensorDatas(newSensorDatas);

            await saveLocationsToStorage(newLocations); // Save updated locations to AsyncStorage
            await saveSessionsToStorage(newSessions);
            await saveSensorToStorage(newSensorDatas);
          },
          style: 'destructive',
        },
      ],
    );
  };

  // Fungsi untuk menyimpan sesi ke AsyncStorage
  const saveSessionsToStorage = async newSessions => {
    try {
      await AsyncStorage.setItem('sessions', JSON.stringify(newSessions));
      console.log('Sessions saved successfully:', newSessions); // Log saat data berhasil disimpan
    } catch (error) {
      console.error('Failed to save sessions to storage', error);
    }
  };

  const saveLocationsToStorage = async newLocations => {
    try {
      await AsyncStorage.setItem('locations', JSON.stringify(newLocations));
      console.log('Locations saved successfully:', newLocations);
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

  const handleCreateSession = () => {
    navigation.navigate('Sessionscreen', {project});
  };

  const handleSessionClick = session => {
    // Navigasi ke ProjectInfoScreen dengan detail proyek
    navigation.navigate('Sessioninfoscreen', {session});
  };

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <ScrollView>
        <BoxInfo
          items={[
            {
              label: 'Name: ',
              value: project.P_title,
            },
            {
              label: 'Description: ',
              value: project.description,
            },
            {
              label: 'Project Start: ',
              value: project.projectStart,
            },
            {
              label: 'Project End: ',
              value: project.projectEnd,
            },
          ]}
        />

        <ListInfo
          title="Sessions"
          data={s_Filter}
          onItemPress={handleSessionClick}
          onDeletePress={handleDeleteSession}
          emptyText="No Sessions saved"
        />
      </ScrollView>
      <TouchableOpacity style={styles.box3} onPress={handleCreateSession}>
        <Text style={styles.label6}>Create New Session</Text>
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
    margintop: 10,
    marginBottom: 30,
    justifyContent: 'center',
  },
  scrollContainer: {
    maxHeight: 150,
    marginTop: 10,
  },
});

export default ProjectinfoScreen;
