import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { arrowback, trash } from '../../assets/icon';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
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
                const filteredLocations = parsedLocations.filter(location => location.S_id === session.S_id);
                setL_Filter(filteredLocations);
                setLocations(parsedLocations);
                console.log('Filtered locations loaded successfully:', filteredLocations); // Log saat data berhasil difilter dan dimuat
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
            console.log('SensorDatas loaded successfully:', JSON.parse(storedSensorDatas));
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
        }, [session.S_id]) // Pastikan ini diperbarui jika `project.S_id` berubah
    );

    // Fungsi untuk menghapus lokasi dengan konfirmasi
    const handleDeleteLocation = (index) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this location?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        const locationToDelete = l_Filter[index];

                        const newLocationsFilter = l_Filter.filter((_, i) => i !== index);
                        const newLocations = locations.filter(location => location.L_id !== locationToDelete.L_id);

                        setL_Filter(newLocationsFilter);
                        setLocations(newLocations);
                        console.log('Location deleted successfully:', newLocations);

                        const newSensorDatas = sensorDatas.filter(sensorData => sensorData.L_id !== locationToDelete.L_id);
                        setSensorDatas(newSensorDatas);
                        
                        await saveLocationsToStorage(newLocations); // Simpan perubahan ke AsyncStorage
                        await saveSensorToStorage(newSensorDatas);
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Fungsi untuk menyimpan lokasi ke AsyncStorage
    const saveLocationsToStorage = async (newLocations) => {
        try {
            await AsyncStorage.setItem('locations', JSON.stringify(newLocations));
            console.log('Locations saved successfully:', newLocations); // Log saat data berhasil disimpan
        } catch (error) {
            console.error('Failed to save locations to storage', error);
        }
    };

    const saveSensorToStorage = async (newSensorDatas) => {
        try {
            await AsyncStorage.setItem('SensorDatas', JSON.stringify(newSensorDatas));
            console.log('SensorDatas saved successfully:', newSensorDatas);
        } catch (error) {
            console.error('Failed to save SensorDatas to storage', error);
        }
    };

    const handleCreateLocation = () => {
        navigation.navigate('Createlocationscreen', { session });
    };

    const handleLocationClick = (location) => {
        // Navigasi ke ProjectInfoScreen dengan detail proyek
        navigation.navigate('Locationinfoscreen', { location });
    };
    return (
        <View style={{ backgroundColor: "white", flex: 1 }}>
            <Text style = {styles.judul}> Session Info </Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={arrowback} style={styles.backIcon} />
            </TouchableOpacity>

            <ScrollView>
                <View style={styles.box}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label1}>Name: </Text>
                        <View style={styles.infoContainer}>
                            <Text style={styles.info1}>{session.S_title || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label1}>Description: </Text>
                        <View style={styles.infoContainer}>
                            <Text style={styles.info1}>{session.description || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label1}>Wheater: </Text>
                        <Text style={styles.info1}>{session.wheater || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label1}>Material Type: </Text>
                        <Text style={styles.info1}>{session.materialType || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label1}>Layer: </Text>
                        <Text style={styles.info1}>{session.layer || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label1, { marginBottom: 0 }]}>Session Start: </Text>
                        <Text style={[styles.info1, { marginBottom: 0 }]}>{session.projectStart || 'N/A'}</Text>
                    </View>
                </View>
                
                <View style={styles.boxx}>
                    <Text style={styles.label5}>Locations </Text>
                    {/* Menampilkan daftar lokasi secara dinamis */}
                    {l_Filter.length > 0 ? (
                        l_Filter.map((location, index) => (
                            <TouchableOpacity key={index} style={styles.box4} onPress={() => handleLocationClick(location)}>
                                <View style={styles.projectInfo}>
                                    <View style={styles.nameLocContainer}>
                                        <Text style={styles.sessionText}>{location.L_title}</Text>
                                    </View>
                                    {/* Ikon trash untuk menghapus lokasi */}
                                    <TouchableOpacity onPress={() => handleDeleteLocation(index)}>
                                        <Image source={trash} style={styles.trashIcon} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        // Menampilkan pesan jika tidak ada sesi yang disimpan
                        <Text style={styles.noLocationText}>No Locations saved</Text>
                    )}
                </View>
        
            </ScrollView>
            {/* Tombol Create berada di luar ScrollView */}
            <TouchableOpacity style={styles.box3} onPress={handleCreateLocation}>
                <Text style={styles.label6}>Create New Location</Text>
            </TouchableOpacity>
        </View>
    );
}    


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
        marginBottom : 90,
        padding: 15,
    },
    backButton: {
        position: 'absolute',
        top: 28,
        left: 16,
    },
    backIcon: {
        width: 27,
        height: 20,
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
    nameLocContainer: {
        width: '80%',
    },
    noLocationText: {
        marginTop: 10,
        marginBottom: 15,
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
    },
    label1: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 20,
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
    box4: {
        height: 55,
        backgroundColor: '#4541E4',
        borderRadius: 5,
        marginTop: 10,
        marginBottom : 5,
        justifyContent: 'center',
    },
    scrollContainer: {
        maxHeight: 150,
        marginTop: 10,
    },
    sessionText: {
        left: 15,
        fontSize: 14,
        color: '#E0E0E0',
    },
    projectInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trashIcon: {
        width: 25,
        height: 25,
        tintColor: '#F6F6F6',
        right: 15,
    },
    judul : {
        marginTop: 22,
        marginBottom: 25,
        textAlign : 'center',
        fontSize : 20,
        color : '#000000'

    }
});


export default Sessioninfoscreen;
