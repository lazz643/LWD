import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageViewing from 'react-native-image-viewing';
import { arrowback, camera, location2 } from '../../assets/icon';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const ImageScreen = () => {
    const navigation = useNavigation();
    const [locations, setLocations] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);
    const [images, setImages] = useState([]);

    // Function to load locations from AsyncStorage
    const loadLocationsFromStorage = async () => {
        try {
            const storedLocations = await AsyncStorage.getItem('locations');
            if (storedLocations !== null) {
                const filteredLocations = JSON.parse(storedLocations).filter(
                    (location) => location.imageUris && location.imageUris.length > 0
                );
                setLocations(filteredLocations);
            }
        } catch (error) {
            console.error('Failed to load locations from storage', error);
        }
    };

    // Use useFocusEffect to reload data when the screen is focused
    useFocusEffect(
        React.useCallback(() => {
            loadLocationsFromStorage();
        }, [])
    );

    // Handle project click to navigate or perform any action
    const handleProjectClick = (location) => {
        navigation.navigate('Locationinfoscreen', { location });
    };

    // Handle image click to open modal with image and date
    const handleImageClick = (locationImages, index) => {
        setImages(locationImages.map(image => ({ uri: image.uri })));
        setSelectedImageIndex(index);
        setModalVisible(true);
    };

    return (
        <View style={{ backgroundColor: "white", flex: 1 }}>
            <View>
                <Text style={styles.title}>Images</Text>
            </View>
            {locations.length > 0 ? (
                <ScrollView>
                    <View style={styles.container}>
                        {locations
                            .slice()
                            .reverse()
                            .map((location, index) => (
                                <View key={index} style={styles.box}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.text1}>Location: </Text>
                                        <View style={styles.infoContainer}>
                                            <Text style={styles.text1}>{location.L_title}</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={styles.date}>Location Start Date: {location.projectStart}</Text>
                                    </View>

                                    <TouchableOpacity style={styles.buttontoloc} onPress={() => handleProjectClick(location)}>
                                        <Image source={location2} style={styles.mapsIcon} />
                                    </TouchableOpacity>

                                    <View style={styles.imageContainer}>
                                        {location.imageUris.map((image, imgIndex) => (
                                            <TouchableOpacity
                                                key={imgIndex}
                                                onPress={() => handleImageClick(location.imageUris, imgIndex)}
                                            >
                                                <Image source={{ uri: image.uri }} style={styles.image} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ))}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.centeredContainer}>
                    <Text style={styles.noImageText}>No images saved</Text>
                </View>
            )}
            {/* Swipeable image gallery modal */}
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 22,
        marginBottom: 10,
        color: "#000000"
    },
    box: {
        flexDirection: 'column',
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#000000',
        backgroundColor: 'rgba(255, 204, 0, 0)',
        borderRadius: 5,
        marginHorizontal: 16,
    },
    buttontoloc: {
        position: 'absolute',
        backgroundColor: '#4541E4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4541E4',
        borderRadius: 5,
        width: 40,
        right: 15,
        top: 15,
        padding: 5,
    },
    mapsIcon: {
        width: 16,
        height: 20,
        alignSelf: 'center',
    },
    centeredContainer: {
        flex: 1, // Membuat container memenuhi layar
        justifyContent: 'center', // Mengatur konten agar berada di tengah secara vertikal
        alignItems: 'center', // Mengatur konten agar berada di tengah secara horizontal
    },
    noImageText: {
        fontSize: 16,
        color: '#000',
    },
    infoRow: {
        flexDirection: 'row',
    },
    infoContainer: {
        width: '60%',
    },
    text1: {
        fontSize: 16,
        textAlign: 'justify',
        fontWeight: 'bold',
        color: 'grey',
    },
    date: {
        fontSize: 12,
        color: 'grey',
        marginVertical: 5,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 5,
        margin: 5,
        marginBottom: 10,
    },
});

export default ImageScreen;
