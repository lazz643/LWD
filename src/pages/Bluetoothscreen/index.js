import { useNavigation, useRoute } from '@react-navigation/native';
import React, { Component } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, ImageBackground, Image, PermissionsAndroid, Platform } from 'react-native';
import { arrowback} from '../../assets/icon';
import DeviceInfo from 'react-native-device-info';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import BluetoothSerial from 'react-native-bluetooth-classic';


const styles = StyleSheet.create({
  // ... (style objects remain unchanged)
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    justifyContent: 'flex-start',
    marginTop: '8%',
    textAlign: 'center',
    color: 'black',
  },
  buttonback: {
    position: 'absolute',
    marginTop: '8%',
    marginLeft: 15,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  buttontukar: {
    position: 'absolute',
    bottom: 90,
    paddingVertical: 5,
    backgroundColor: '#4541E4',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4541E4',
    borderRadius: 5,
    left: 30,
    right: 30,
  },
  imageback: {
    width: 16,
    height: 26,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagemeter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    right: 40,
    top: 160,
  },
  imagehp: {
    position: 'absolute',
    width: 150,
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    left: 20,
    top: 160,
  },
});

class Bluetoothscreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permission: '',
      onBluetooth: false,
      apiLevelInfo: '',
    };
  }

  componentDidMount() {
    this.checkBluetoothState();
    this.requestPermissions(async (granted) => {
      if (granted) {
          this.setState({ permission: 'true' });
          console.log('Bluetooth permission:', this.state.permission);
      } else {
          this.setState({ permission: 'false' });
          console.log('Bluetooth permission:', this.state.permission);
      }
    });
  }

  checkBluetoothState = async () => {
    try {
      const bluetoothState = await BluetoothSerial.isBluetoothEnabled();
      console.log('Bluetooth state:', bluetoothState);
      if (bluetoothState) {
        this.setState({ onBluetooth: true });
      } else {
        this.setState({ onBluetooth: false });
      }
    } catch (error) {
      console.error('Error checking Bluetooth state:', error);
    }
  };

  requestPermissions = async (cb) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
        console.log('granted:', granted);
        console.log('Versi Android dibawah Android 12');
        this.setState({ apiLevelInfo: '1' });
      } else {
        const result = await requestMultiple([
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ]);
  
          const isGranted =
            result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
            result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
            result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
  
          cb(isGranted);
          console.log('granted multiple:', isGranted);
        console.log('Versi Android diatas Android 11');
        this.setState({ apiLevelInfo: '2' });
      }
    } else {
      cb(true);
    }
  };

  NextUpload = async () => {
    const { permission } = this.state;
    try {
      if (permission == 'true') {
        await this.checkBluetoothState();
    
        if (this.state.onBluetooth) {
          const code = "1";
          this.props.navigation.navigate('Connectedscreen',{code});
        } else {
          if (this.state.apiLevelInfo == '1') {
            alert("Aktifkan Mode Bluetooth dan Lokasi");
          } else {
            alert("Aktifkan Mode Bluetooth");
          }
        }
      } else if (permission == 'false') {
        if (this.state.apiLevelInfo == '1') {
          alert("Pastikan Izin Bluetooth Diterima");
        } else {
          alert("Pastikan Izin Bluetooth dan Lokasi Diterima");
        }
      }
    } catch (error) {
      console.error("Error checking Bluetooth state:", error);
    }
  };

  Masuk_Homescreen = () => {
    this.props.navigation.navigate('Homescreen');
  };

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={{ uri: 'https://wallpaperaccess.com/full/1227835.jpg' }}
          style={styles.background}
        >
            <Text style={styles.title}>Device</Text>

            <TouchableOpacity style={styles.buttonback} onPress={this.Masuk_Homescreen}>
               <Image source={arrowback} style={styles.imageback} />
            </TouchableOpacity>

            
            <Text style={{ fontFamily: 'Helvetica', fontSize: 17, fontWeight: 'bold', color: '#4541E4', marginTop: 310, alignSelf: 'center', }}>Pastikan ponsel anda terhubung ke water mater</Text>

            <TouchableOpacity style={styles.buttontukar} onPress={this.NextUpload}>
            <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>Lanjut</Text>
            </TouchableOpacity>

        </ImageBackground>
      </View>
    );
  }
}

export default function(props) {
  const navigation = useNavigation();
  const route = useRoute();
  return <Bluetoothscreen {...props} navigation={navigation} route={route} />;
}