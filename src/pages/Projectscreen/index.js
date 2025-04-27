import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SettingON} from '../../assets/icon';
import {arrowback, trash} from '../../assets/icon';
import {LineChart} from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import FFT from 'fft-js';
import Svg, {G, Path, Line, Circle, Text as SvgText} from 'react-native-svg';
import ExcelJS from 'exceljs';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

/*
const getNextPowerOfTwo = (num) => {
    return Math.pow(2, Math.ceil(Math.log2(num)));
};
*/
const padToPowerOfTwo = data => {
  const length = data.length;
  const previousPowerOfTwo = Math.pow(2, Math.floor(Math.log2(length)));
  return [...data.slice(0, previousPowerOfTwo)]; // Potong array jika panjangnya melebihi pangkat dua yang lebih kecil
};

class Projectscreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.route.params.location,
      totalData: 0,
      sensorData: {
        pulse: 0,
        press: 0,
        poissonRatio: 0,
      },
      saveAllSensorData: [],
      saveSensorData: [],
      settingData: {},
      connectedDevice: null,
      isLoading: false,
      sensortotal: 1,
      receivedtime: [],
      receivedforce: [],
      frequencyData_s1: [],
      frequencyData_s2: [],
      frequencyData_s3: [],
      amplitudeData_s1: [],
      amplitudeData_s2: [],
      amplitudeData_s3: [],
      dominantFrequency_s1: null,
      dominantFrequency_s2: null,
      dominantFrequency_s3: null,
      maxDeflection_s1: null,
      maxDeflection_s2: null,
      maxDeflection_s3: null,
      eModuli_s1: null,
      eModuli_s2: null,
      eModuli_s3: null,
      rOffset_1: null,
      rOffset_2: null,
      rOffset_3: null,
      maxForce: null,
      yAxisLabels: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      yAxisLabels2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      xAxisLabels: [0, 10, 20, 30, 40, 50, 60],
      dPath: '', // Path for receivedforce
      dPath2: '', // Path for amplitudeData_s1
      dPath3: '', // Path for amplitudeData_s2
      dPath4: '', // Path for amplitudeData_s3
    };
    this.timer = null;
    this.readInterval = null;
  }

  componentDidMount() {
    //this.loadDeviceFromStorage();

    this.focusListener = this.props.navigation.addListener('focus', () => {
      // Fungsi ini akan dipanggil ulang ketika halaman aktif kembali
      this.loadDeviceFromStorage();
      this.loadSettingsFromStorage();
      this.loadSensorDataFromStorage();
    });
  }

  // fungsi yang akan jalan ketika user meninggalkan halaman
  componentWillUnmount() {
    if (this.readInterval) {
      clearInterval(this.readInterval);
    }
    // Hapus listener ketika komponen unmount
    if (this.focusListener) {
      this.focusListener();
    }
  }

  // perhitungan FFT
  processFFT = (amplitudeData, label) => {
    if (!amplitudeData || amplitudeData.length === 0) {
      this.setState({isLoading: false});
      console.log(`${label} data is invalid or empty.`);
      return;
    }

    const paddedAmplitudeData = padToPowerOfTwo(amplitudeData);

    if (!paddedAmplitudeData || paddedAmplitudeData.length === 0) {
      this.setState({isLoading: false});
      console.log(`Padded ${label} data is invalid or empty.`);
      return;
    }

    const N = paddedAmplitudeData.length;
    console.log(`${label} N >>>>>>>>>>>>>>> `, paddedAmplitudeData.length);

    try {
      const phasors = FFT.fft(paddedAmplitudeData);
      const frequencies = Array.from(
        {length: N},
        (_, i) => (i * (1 / 0.1)) / N,
      ); // Assuming fs = 10 Hz
      const magnitudes = phasors.map(p => Math.sqrt(p[0] ** 2 + p[1] ** 2));

      // Store frequency and amplitude data in state
      this.setState(
        {
          [`frequencyData_${label}`]: frequencies,
          [`amplitudeData_${label}`]: magnitudes,
        },
        () => {
          this.findDominantFrequency(magnitudes, frequencies, label);
          this.findMaxDeflection(magnitudes, label);
        },
      );

      console.log(`${label} frequencies:`, frequencies);
      console.log(`${label} amplitudeData:`, magnitudes);
    } catch (error) {
      this.setState({isLoading: false});
      console.error(`Error processing FFT for ${label}:`, error);
    }
  };

  // Fungsi untuk mencari frekuensi dominan
  findDominantFrequency = (magnitudes, frequencies, label) => {
    const maxMagnitude = Math.max(...magnitudes);
    const dominantIndex = magnitudes.indexOf(maxMagnitude);
    const dominantFrequency = frequencies[dominantIndex];

    this.setState({[`dominantFrequency_${label}`]: dominantFrequency});
    console.log(`Dominant Frequency ${label}:`, dominantFrequency);
  };

  // Fungsi untuk mencari defleksi maksimum
  findMaxDeflection = (magnitudes, label) => {
    const maxDeflection = Math.max(...magnitudes);
    this.setState({[`maxDeflection_${label}`]: maxDeflection}, () => {
      this.findEModuli(label); // Call findEModuli after state is updated
    });
    console.log(`Max Deflection ${label}:`, maxDeflection);
  };

  // Fungsi untuk mencari E-Moduli
  findEModuli = label => {
    const {maxForce, settingData} = this.state;
    const maxDeflection = this.state[`maxDeflection_${label}`];

    // Periksa apakah semua nilai yang dibutuhkan tersedia
    if (
      maxForce != null &&
      settingData.poissonRatio != 0 &&
      maxDeflection != null &&
      settingData.diameter != 0
    ) {
      const poissonRatioSquared = Math.pow(settingData.poissonRatio, 2);
      const radius = settingData.diameter / 2;
      const emoduli =
        (maxForce * (1 - poissonRatioSquared)) / (maxDeflection * radius);

      console.log(`E-Moduli ${label}:`, emoduli);
      // Set E-Moduli ke dalam state jika diperlukan
      this.setState({[`eModuli_${label}`]: emoduli});
      this.setState({isLoading: false});
    } else {
      this.setState({isLoading: false});
      console.log(`Data tidak lengkap untuk menghitung E-Moduli ${label}.`);
      console.log(`maxForce ${label}:`, maxForce);
      console.log(`poissonRatio ${label}:`, settingData.poissonRatio);
      console.log(`maxDeflection ${label}:`, maxDeflection);
      console.log(`diameter ${label}:`, settingData.diameter);
    }
  };

  // Fungsi untuk mencari force maksimum
  findMaxForce = forceData => {
    const maxForce = Math.max(...forceData);
    this.setState({maxForce});
    console.log('Max Force:', maxForce);
  };

  // memuat apakah ada perangkat bluetooth yang tersambung
  loadDeviceFromStorage = async () => {
    try {
      const stillOnBluetooth = await RNBluetoothClassic.isBluetoothEnabled();
      if (stillOnBluetooth) {
        const storedDevice = await AsyncStorage.getItem('device_connect');
        if (storedDevice) {
          const parsedDevice = JSON.parse(storedDevice);
          const bondedDevices = await RNBluetoothClassic.getBondedDevices();
          const connectedDevice = bondedDevices.find(
            d => d.id === parsedDevice.id,
          );

          if (connectedDevice) {
            let isConnected = await connectedDevice.isConnected();
            if (!isConnected) {
              // Remove the connected device from AsyncStorage
              await AsyncStorage.removeItem('device_connect');
              console.log('Device removed from storage:', connectedDevice.name);
            } else {
              this.setState({connectedDevice});
              console.log('Connected device loaded:', connectedDevice);
              // Cek apakah interval sudah berjalan sebelum memulai ulang
              if (!this.readInterval) {
                this.startReadingData(connectedDevice);
              }
            }
          } else {
            console.log('Device not found in bonded devices');
            this.setState({connectedDevice: null});
            // Remove the connected device from AsyncStorage
            await AsyncStorage.removeItem('device_connect');
          }
        } else {
          console.log('No devices connected found in storage.');
          this.setState({connectedDevice: null});
        }
      }
    } catch (error) {
      Alert.alert(
        'Failed to load connected device from storage',
        error.message,
      );
      this.setState({connectedDevice: null});
    }
  };

  loadSettingsFromStorage = async () => {
    // memuat settingan dari halaman setting karena ada data yang diperlukan untuk perhitungan
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Convert all loaded settings values to float
        const floatSettings = {};
        Object.keys(parsedSettings).forEach(key => {
          floatSettings[key] = parseFloat(parsedSettings[key]);
        });

        this.setState({settingData: floatSettings});
        console.log('Settings loaded successfully:', floatSettings);
      } else {
        console.log('No settings found, initialized with default values');
      }
    } catch (error) {
      console.error('Failed to load settings from storage', error);
    }
  };

  loadSensorDataFromStorage = async () => {
    const {location} = this.state;
    try {
      const storedSensorDatas = await AsyncStorage.getItem('SensorDatas');
      if (storedSensorDatas) {
        const parsedSensorDatas = JSON.parse(storedSensorDatas);
        const filteredSensorDatas = parsedSensorDatas.filter(
          sensordata => sensordata.L_id === location.L_id,
        );

        this.setState({saveAllSensorData: parsedSensorDatas});
        this.setState({saveSensorData: filteredSensorDatas});
        console.log('SensorDatas loaded successfully:', filteredSensorDatas);
        this.setState({totalData: filteredSensorDatas.length});
      }
    } catch (error) {
      console.error('Failed to load SensorDatas from storage', error);
    }
  };

  handleSaveSensor = async () => {
    const {
      saveAllSensorData,
      location,
      sensortotal,
      sensorData,
      maxDeflection_s1,
      maxDeflection_s2,
      maxDeflection_s3,
      eModuli_s1,
      eModuli_s2,
      eModuli_s3,
      maxForce,
      dPath,
      dPath2,
      dPath3,
      dPath4,
      rOffset_1,
      rOffset_2,
      rOffset_3,
    } = this.state;
    if (!location || !sensortotal || !sensorData || !maxForce) {
      Alert.alert('Please fill in all fields');
      return;
    }

    const newId =
      saveAllSensorData.length > 0
        ? saveAllSensorData[saveAllSensorData.length - 1].D_id + 1
        : 1;

    // Create new sensor data object
    const newSensorData = {
      D_id: newId,
      L_id: location.L_id,
      S_id: location.S_id,
      P_id: location.P_id,
      sensortotal,
      pulse: sensorData.pulse,
      press: sensorData.press,
      poissonRatio: sensorData.poissonRatio,
      maxDeflection_s1,
      maxDeflection_s2,
      maxDeflection_s3,
      eModuli_s1,
      eModuli_s2,
      eModuli_s3,
      rOffset_1,
      rOffset_2,
      rOffset_3,
      maxForce,
      dPath,
      dPath2,
      dPath3,
      dPath4,
    };

    // Add new data to the existing list
    const updatedSensorData = [...saveAllSensorData, newSensorData];

    // Save updated list to AsyncStorage
    await this.saveSensorToStorage(updatedSensorData);
    await this.loadSensorDataFromStorage();
  };

  saveSensorToStorage = async updatedSensorData => {
    try {
      await AsyncStorage.setItem(
        'SensorDatas',
        JSON.stringify(updatedSensorData),
      );
      console.log('SensorDatas saved successfully:', updatedSensorData);
    } catch (error) {
      console.error('Failed to save SensorDatas to storage', error);
    }
  };

  handleIncomingData = data => {
    // fungsi yang terus di loop untuk cek ada data ngga yang dikirim dari alat
    const {settingData} = this.state;
    console.log('Data received:', data); // lihat apakah data null atau tidak valid

    if (this.state.isLoading) {
      if (!data || data === 'null') {
        console.log('-------------------------------:');
        console.log('>>>>>>>>>>>>>>>>>> timer:', this.timer);
        if (!this.timer) {
          // Set timer 3 detik jika isLoading = true dan data kosong, ini menunggu kira kira dalam 3 detik ada data dikirim dari alat atau ngga
          this.timer = setTimeout(() => {
            if (!data || data === 'null') {
              // jika selama 3 detik alat tidak ada mengirim data, loading berhenti dan bisa klik button tarik data kembali
              console.log('Data yang diterima tidak valid atau null:', data);
              Alert.alert('Alert', 'Sensor data is not yet available.');

              clearTimeout(this.timer);
              this.timer = null;
              this.setState({isLoading: false});
              console.log('+++++++++++++++++++++++ timer:', this.timer);
            }
          }, 3000);
        }
        return; // jika selama 3 detik alat tidak ada mengirim data, kode handleIncomingData stop disini. kode dibawah ini tidak dijalankan
      }

      // jika sebelum 3 detik ada data dikirim dari alat, kode ini dijalankan
      // Hapus referensi ke timer setelah selesai
      clearTimeout(this.timer);
      this.timer = null;

      try {
        // pecah data yang dikirim dari alat
        const parsedData = JSON.parse(data);
        const roffsetvalue = 0;

        // update data sesuai data dari alat
        const stateUpdate = {
          sensorData: {
            pulse: parsedData.Pulse,
            press: parsedData.Press,
            poissonRatio: parsedData.PoissonRatio,
          },
          roffset: parsedData.ROffset1,
          receivedtime: parsedData.TimeData || [],
          receivedforce: parsedData.ForceData || [],
        };

        // cari nilai force maksimum
        this.findMaxForce(parsedData.ForceData);

        // cek ada berapa sensor alat yang digunakan untuk ambil data, apakah pake 1 sensor atau 3 sensor
        // perhitungan FFT mulai dari sini
        if (parsedData.AmplitudeData) {
          // jalankan perhitungan untuk sensor pertama
          this.setState({rOffset_1: roffsetvalue});
          this.processFFT(parsedData.AmplitudeData, 's1');
        }

        if (parsedData.AmplitudeData2) {
          // jika ada data untuk sensor kedua & ketiga, berarti mengunakan 3 sensor dan kode ini akan dijalankan untuk menghitung sensor 2 danb 3
          this.setState({rOffset_2: settingData.roffset});
          this.processFFT(parsedData.AmplitudeData2, 's2');

          if (parsedData.AmplitudeData3) {
            this.setState({rOffset_3: settingData.roffset * 2});
            this.processFFT(parsedData.AmplitudeData3, 's3');
          }
        }

        // jika sudah selesai menjalankan kode diatas, dilakukan update grafik disini
        this.setState(stateUpdate, () => {
          this.valuegraph(); // menjalankan fungsi generate koordinat grafik sinyal
        });

        this.handleSaveSensor(); // data FFT dan update grafik yang baru akan disimpan di asyncstorage
      } catch (error) {
        this.setState({isLoading: false});
        console.error('Failed to parse incoming data:', error);
      }
    } else {
      if (!data || data === 'null') {
        console.log('Data yang diterima tidak valid atau null:', data);

        this.setState({isLoading: false});
        return; // Lewati pemrosesan jika data tidak valid
      }
    }
  };

  // fungsi yang akan jalan ketika user tekan button tarik data dari alat
  handleStartReading = async () => {
    const {connectedDevice, sensortotal, settingData} = this.state;
    this.setState({isLoading: true}); // menjalankan loading

    // cek user udah atur data poissonRatio, diameter, roffset di halaman setting atau belum
    // data ini harus diisi selain 0
    if (
      settingData.poissonRatio === 0 ||
      settingData.diameter === 0 ||
      settingData.roffset === 0
    ) {
      this.setState({isLoading: false});
      Alert.alert(
        'Setting data values have not been set',
        'Please go to settings to set the value.',
      );
      return;
    }

    // kalau udah ada perangkat bluetooth yang tersambung dan, user udah pilih mau ambil data dari 1 sensor atau 3 sensor, kode ini dijalankan
    // mengirim perintah ke alat berupa data string bahwa akan menggunakan 1 sensor atau 3 sensor
    if (connectedDevice) {
      try {
        let message = '';
        if (sensortotal === 1) {
          message = '1sensor';
        } else if (sensortotal === 3) {
          message = '3sensor';
        } else {
          Alert.alert('Error', 'Invalid sensor count.');
        }

        const formattedMessage = `${message}\n`;
        console.log(`Attempting to send data: ${formattedMessage}`);

        await connectedDevice.write(formattedMessage); // mengirim data string ke alat
        console.log('Data sent successfully');
      } catch (error) {
        this.setState({isLoading: false});
        console.error('Error reading data:', error);
        Alert.alert('Error', 'Failed to read data from the device.');
      }
    } else {
      this.setState({isLoading: false});
      Alert.alert('No device connected', 'Please connect to a device first.');
    }
  };

  // fungsi yang dijalankan otomatis jika user mengunjungi page ini dan sudah ada koneksi ke perangkat bluetooth
  // fungsi ini menjalankan interval tiap 1 detik untuk cek apakah bluetooth masih tersambung dan apakah ada data dikirim dari luar
  startReadingData = device => {
    if (this.readInterval) {
      // kalo interval cek koneksi bluetooth blm dijalankan
      console.log('Interval already running, skipping new interval setup.');
      return;
    }

    this.readInterval = setInterval(async () => {
      // membuat interval jika belum ada
      try {
        const stillConnected = await device.isConnected();
        console.log('Connection device status:', stillConnected);
        if (!stillConnected) {
          // kalau terdeteksi koneksi terputus
          await this.functionCheckDevice(device);
          Alert.alert(
            `Disconnected with ${device.name}`,
            `Device ${device.name} is inactive or out of range`,
          );
        } else {
          // kalau terdapat koneksi maka akan mendeteksi apakah ada data yang dikirim dari luar
          let data = await device.read();
          this.handleIncomingData(data); // menjalankan fungsi untuk memproses FFT jika ada data terkirim dari luar
        }
      } catch (error) {
        if (error.message.includes('Bluetooth mAdapter is not enabled')) {
          await this.functionCheckDevice(device);
          Alert.alert(`Disconnected`, `Bluetooth has been turned off.`);
        }
      }
    }, 1000);
  };

  // fungsi untuk menghapus data koneksi perangkat jika terdeteksi perangkat terputus
  functionCheckDevice = async device => {
    clearInterval(this.readInterval);

    this.setState({connectedDevice: null});

    // menghapus data koneksi dari asyncstorage
    await AsyncStorage.removeItem('device_connect');
    console.log('Device removed from storage:', device.name);
  };

  // ketika mau masuk ke halaman bluetooth
  Masuk_Connectedscreen = async () => {
    const code = '2';
    const stillOnBluetooth = await RNBluetoothClassic.isBluetoothEnabled();

    if (stillOnBluetooth) {
      // Hentikan interval pembacaan data sebelum berpindah ke halaman lain
      if (this.readInterval) {
        clearInterval(this.readInterval);
        this.readInterval = null; // Reset interval setelah dihentikan
      }
      this.props.navigation.navigate('Connectedscreen', {code});
    } else {
      Alert.alert('Turn on the bluetooth mode');
    }
  };

  // ketika mau masuk ke halaman setting
  Masuk_Settingscreen = async () => {
    if (this.readInterval) {
      clearInterval(this.readInterval);
      this.readInterval = null; // Reset interval setelah dihentikan
    }
    const code = 1;
    this.props.navigation.navigate('Summaryscreen', {code});
  };

  // fungsi tampilan untuk data numerik geophone hasil perhitungan
  renderGeophoneSensor = (sensorNumber, roffset, maxDeflection, eModuli) => {
    return (
      <>
        <Text style={styles.geophoneHeader}>Sensor {sensorNumber}</Text>
        <View style={styles.dataItem}>
          <Text style={styles.label}>roffset (cm):</Text>
          <Text style={styles.value}>{roffset || 0}</Text>
        </View>
        <View style={styles.dataItem}>
          <Text style={styles.label}>Deflection (μm):</Text>
          <Text style={styles.value}>{maxDeflection || 0}</Text>
        </View>
        <View style={styles.dataItem}>
          <Text style={styles.label}>E-Modulus (MPa):</Text>
          <Text style={styles.value}>{eModuli || 0}</Text>
        </View>
      </>
    );
  };

  // fungsi untuk generate koordinat grafik sinyal
  valuegraph = () => {
    const {
      receivedforce,
      receivedtime,
      amplitudeData_s1,
      amplitudeData_s2,
      amplitudeData_s3,
      yAxisLabels,
      yAxisLabels2,
      xAxisLabels,
      sensortotal,
    } = this.state;

    const x_axis_actual_width = Dimensions.get('window').width - 80 - 40;
    const y_axis_actual_height = 270 - 40 - 50;
    const maxValueAtYAxis = yAxisLabels[yAxisLabels.length - 1];
    const maxValueAtXAxis = xAxisLabels[xAxisLabels.length - 1];
    const x_axis_x1_point = 80;
    const y_axis_y2_point = 270 - 50;
    const y_axis_y1_point = 40;

    // Function to calculate the DPath for force data
    let dPath = '';
    if (maxValueAtYAxis) {
      receivedforce.forEach((val, index) => {
        const x_value = receivedtime[index];
        const x_point =
          x_axis_x1_point + (x_value / maxValueAtXAxis) * x_axis_actual_width;
        const y_point =
          y_axis_y2_point - (val / maxValueAtYAxis) * y_axis_actual_height;

        if (index === 0) {
          dPath += `M${x_point} ${y_point}`;
        } else {
          dPath += `L${x_point} ${y_point}`;
        }
      });
    }

    // Function to calculate the DPath for amplitude data
    const calculateDPath = (data, maxValueAtYAxis2) => {
      let dPathG = '';
      if (maxValueAtYAxis2) {
        data.forEach((val, index) => {
          const x_value = receivedtime[index];
          const x_point =
            x_axis_x1_point + (x_value / maxValueAtXAxis) * x_axis_actual_width;
          const y_point =
            y_axis_y1_point + (val / maxValueAtYAxis2) * y_axis_actual_height;

          if (index === 0) {
            dPathG += `M${x_point} ${y_point}`;
          } else {
            dPathG += `L${x_point} ${y_point}`;
          }
        });
      }
      return dPathG;
    };

    const maxValueAtYAxis2 = yAxisLabels2[yAxisLabels2.length - 1];
    let dPath2 = '';
    let dPath3 = '';
    let dPath4 = '';

    if (sensortotal === 1) {
      dPath2 = calculateDPath(amplitudeData_s1, maxValueAtYAxis2);
    } else if (sensortotal === 3) {
      dPath2 = calculateDPath(amplitudeData_s1, maxValueAtYAxis2);
      dPath3 = calculateDPath(amplitudeData_s2, maxValueAtYAxis2);
      dPath4 = calculateDPath(amplitudeData_s3, maxValueAtYAxis2);
    }

    // Update the state with the calculated paths
    this.setState({dPath, dPath2, dPath3, dPath4});
  };

  renderGraph = currentSensorData => {
    const {saveSensorData, yAxisLabels, yAxisLabels2, xAxisLabels} = this.state;

    const window_width = Dimensions.get('window').width;
    const containerHeight = 270;
    const marginFor_x_fromLeft = 80;
    const marginFor_y_fromBottom = 50;
    const padding_from_screenBorder = 40;

    const x_axis_x1_point = marginFor_x_fromLeft;
    const x_axis_y1_point = containerHeight - marginFor_y_fromBottom;
    const x_axis_x2_point = window_width - padding_from_screenBorder;
    const x_axis_y2_point = containerHeight - marginFor_y_fromBottom;

    const y_axis_x1_point = marginFor_x_fromLeft;
    const y_axis_y1_point = padding_from_screenBorder;
    const y_axis_x2_point = marginFor_x_fromLeft;
    const y_axis_y2_point = containerHeight - marginFor_y_fromBottom;

    const x_axis_actual_width =
      window_width - marginFor_x_fromLeft - padding_from_screenBorder;
    const gap_between_x_axis_ticks =
      x_axis_actual_width / (xAxisLabels.length - 1);

    const y_axis_actual_height = y_axis_y2_point - y_axis_y1_point;
    const gap_between_y_axis_ticks =
      y_axis_actual_height / (yAxisLabels.length - 1);

    // Prepare x-axis labels and ticks using value2
    const render_x_axis_labels_and_ticks = xAxisLabels.map((item, index) => {
      const x_point = x_axis_x1_point + gap_between_x_axis_ticks * index;
      return (
        <G key={`x-axis labels and ticks${index}`}>
          <Line
            x1={x_point}
            y1={x_axis_y1_point}
            x2={x_point}
            y2={x_axis_y1_point + 5}
            strokeWidth={2}
            stroke={'black'}
          />
          <Line
            x1={x_point}
            y1={x_axis_y1_point}
            x2={x_point}
            y2={y_axis_y1_point}
            strokeWidth={2}
            stroke={'grey'}
          />
          <SvgText
            x={x_point}
            y={x_axis_y1_point + 18}
            fontWeight="400"
            fontSize={10}
            fill={'black'}
            textAnchor="middle">
            {index === 3 ? `${item} (ms)` : item}
          </SvgText>
        </G>
      );
    });

    // Prepare y-axis labels and ticks
    const render_y_axis_labels_and_ticks = yAxisLabels.map((item, index) => {
      const y_point = y_axis_y1_point + gap_between_y_axis_ticks * index; // Reversed y_point calculation
      return (
        <G key={`y-axis labels and ticks${index}`}>
          <Line
            x1={marginFor_x_fromLeft}
            y1={y_point}
            x2={marginFor_x_fromLeft - 5}
            y2={y_point}
            stroke={'black'}
            strokeWidth={2}
          />
          <Line
            x1={marginFor_x_fromLeft}
            y1={y_point}
            x2={x_axis_x2_point}
            y2={y_point}
            stroke={'grey'}
            strokeWidth={2}
          />
          {(index === 0 || index === 5 || index === 10) && (
            <SvgText
              x={marginFor_x_fromLeft - 10}
              y={y_point}
              fontWeight="400"
              fontSize={10}
              fill={'black'}
              textAnchor="end">
              {item}
            </SvgText>
          )}
          {index === 6 && (
            <SvgText
              x={marginFor_x_fromLeft - 10}
              y={y_point}
              fontWeight="400"
              fontSize={10}
              fill={'black'}
              textAnchor="end">
              {'(μm)'}
            </SvgText>
          )}
        </G>
      );
    });

    // Prepare y-axis labels and ticks 2
    const render_y_axis_labels_and_ticks2 = yAxisLabels2.map((item, index) => {
      const y_point = y_axis_y2_point - gap_between_y_axis_ticks * index; // Calculate y_point for labels
      return (
        <G key={`y-axis labels and ticks2${index}`}>
          <Line
            x1={marginFor_x_fromLeft - 40}
            y1={y_point}
            x2={marginFor_x_fromLeft - 45}
            y2={y_point}
            stroke={'black'}
            strokeWidth={2}
          />
          {(index === 0 || index === 5 || index === 10) && (
            <SvgText
              x={marginFor_x_fromLeft - 50}
              y={y_point}
              fontWeight="400"
              fontSize={10}
              fill={'black'}
              textAnchor="end">
              {item}
            </SvgText>
          )}
          {index === 4 && (
            <SvgText
              x={marginFor_x_fromLeft - 50}
              y={y_point}
              fontWeight="400"
              fontSize={10}
              fill={'black'}
              textAnchor="end">
              {'(kPa)'}
            </SvgText>
          )}
        </G>
      );
    });

    // Render x and y axes, labels, and line path in one function
    return (
      <View style={[styles.svgWrapper, {height: 270}]}>
        <Svg style={styles.svgStyle}>
          <G key="x-axis y-axis">
            <Line
              x1={x_axis_x1_point}
              y1={x_axis_y1_point}
              x2={x_axis_x2_point}
              y2={x_axis_y2_point}
              stroke={'grey'}
              strokeWidth={2}
            />
            <Line
              x1={y_axis_x1_point}
              y1={y_axis_y1_point}
              x2={y_axis_x2_point}
              y2={y_axis_y2_point}
              stroke={'grey'}
              strokeWidth={2}
            />
          </G>

          {render_y_axis_labels_and_ticks}
          {render_y_axis_labels_and_ticks2}
          {render_x_axis_labels_and_ticks}

          {Array.isArray(saveSensorData) &&
            saveSensorData.length > 0 &&
            currentSensorData.dPath && (
              <Path
                d={currentSensorData.dPath}
                strokeWidth={2}
                stroke={'red'}
                fill="none"
              />
            )}
          {Array.isArray(saveSensorData) &&
            saveSensorData.length > 0 &&
            currentSensorData.dPath2 && (
              <Path
                d={currentSensorData.dPath2}
                strokeWidth={2}
                stroke={'blue'}
                fill="none"
              />
            )}
          {Array.isArray(saveSensorData) &&
            saveSensorData.length > 0 &&
            currentSensorData.dPath3 && (
              <Path
                d={currentSensorData.dPath3}
                strokeWidth={2}
                stroke={'green'}
                fill="none"
              />
            )}
          {Array.isArray(saveSensorData) &&
            saveSensorData.length > 0 &&
            currentSensorData.dPath4 && (
              <Path
                d={currentSensorData.dPath4}
                strokeWidth={2}
                stroke={'purple'}
                fill="none"
              />
            )}
        </Svg>
        <View style={styles.labelContainer}>
          {Array.isArray(saveSensorData) &&
            saveSensorData.length > 0 &&
            currentSensorData.sensortotal >= 1 && (
              <>
                <Text
                  style={{
                    fontSize: 12,
                    color: 'white',
                    fontWeight: 'bold',
                    margin: 5,
                    backgroundColor: 'red',
                    borderWidth: 1,
                    borderRadius: 2,
                    borderColor: 'red',
                    paddingHorizontal: 5,
                  }}>
                  P
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: 'white',
                    fontWeight: 'bold',
                    margin: 5,
                    backgroundColor: 'blue',
                    borderWidth: 1,
                    borderRadius: 2,
                    borderColor: 'blue',
                    paddingHorizontal: 5,
                  }}>
                  D1
                </Text>
              </>
            )}
          {Array.isArray(saveSensorData) &&
            saveSensorData.length > 0 &&
            currentSensorData.sensortotal === 3 && (
              <>
                <Text
                  style={{
                    fontSize: 12,
                    color: 'white',
                    fontWeight: 'bold',
                    margin: 5,
                    backgroundColor: 'green',
                    borderWidth: 1,
                    borderRadius: 2,
                    borderColor: 'green',
                    paddingHorizontal: 5,
                  }}>
                  D2
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: 'white',
                    fontWeight: 'bold',
                    margin: 5,
                    backgroundColor: 'purple',
                    borderWidth: 1,
                    borderRadius: 2,
                    borderColor: 'purple',
                    paddingHorizontal: 5,
                  }}>
                  D3
                </Text>
              </>
            )}
        </View>
      </View>
    );
  };

  createExcelFile = async option => {
    const {saveSensorData, location, settingData} = this.state; // Asumsi saveSensorData dan location ada dalam state

    if (!saveSensorData || saveSensorData.length === 0) {
      Alert.alert('Error', 'No data available to save.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Geophone Data');

    // Menambahkan informasi lokasi ke Excel pada baris 1-3
    worksheet.addRow(['Location', location.L_title]);
    worksheet.addRow(['Description', location.description]);
    worksheet.addRow(['Project Start', location.projectStart]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    const titleSetting = [
      'Target E',
      'Emoduli Value',
      'Correct Emoduli Value',
      'Target E1',
      'Target E2',
      'Top Layer Thickness',
      'Target D1',
      'Deflection Value',
      'Target Pressure',
      'Delta Deflection Value',
      'Force',
      'Press',
      'Pulse',
      'Diameter',
      'Poisson Ratio',
      'R offset',
    ];
    const title = [
      'Drops',
      'Number Of Sensor',
      'Pulse',
      'Press',
      'Poisson Ratio',
      'Max Deflection Sensor 1',
      'Max Deflection Sensor 2',
      'Max Deflection Sensor 3',
      'E-Moduli Sensor 1',
      'E-Moduli Sensor 2',
      'E-Moduli Sensor 3',
      'rOffset Sensor 1',
      'rOffset Sensor 2',
      'rOffset Sensor 3',
      'Max Force',
    ];

    worksheet.addRow(titleSetting);
    const settingRow = [
      settingData.targetE || 0,
      settingData.emoduliValue || 0,
      settingData.correctEmoduliValue || 0,
      settingData.targetE1 || 0,
      settingData.targetE2 || 0,
      settingData.topLayerThickness || 0,
      settingData.targetD1 || 0,
      settingData.deflectionValue || 0,
      settingData.targetPressure || 0,
      settingData.deltaDeflectionValue || 0,
      settingData.force || 0,
      settingData.press || 0,
      settingData.pulse || 0,
      settingData.diameter || 0,
      settingData.poissonRatio || 0,
      settingData.roffset || 0,
    ];
    worksheet.addRow(settingRow);
    worksheet.addRow([]);
    worksheet.addRow([]);

    worksheet.addRow(title);
    saveSensorData.forEach(data => {
      const row = [
        data.D_id,
        data.sensortotal,
        data.pulse,
        data.press,
        data.poissonRatio,
        data.maxDeflection_s1,
        data.maxDeflection_s2,
        data.maxDeflection_s3,
        data.eModuli_s1,
        data.eModuli_s2,
        data.eModuli_s3,
        data.rOffset_1,
        data.rOffset_2,
        data.rOffset_3,
        data.maxForce,
      ];
      worksheet.addRow(row);
    });

    const filePath = `${RNFS.DownloadDirectoryPath}/Geophone_data.xlsx`;
    if (option === 1) {
      try {
        const buffer = await workbook.xlsx.writeBuffer();
        await RNFS.writeFile(filePath, buffer.toString('base64'), 'base64');
        const shareOptions = {
          title: 'Share Excel File',
          url: 'file://' + filePath,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };

        // Handle the user canceling or closing the share dialog gracefully
        await Share.open(shareOptions).catch(error => {
          if (error.message && error.message.includes('User did not share')) {
            console.log('User cancelled sharing the file');
          } else {
            console.error('Error while sharing file:', error);
            Alert.alert('Error', 'Failed to share the file.');
          }
        });
      } catch (error) {
        console.error('Error while sharing file:', error);
        Alert.alert('Error', 'Failed to share the file.');
      }
    } else if (option === 2) {
      try {
        const buffer = await workbook.xlsx.writeBuffer();
        await RNFS.writeFile(filePath, buffer.toString('base64'), 'base64');
        console.log(`File Excel berhasil disimpan di: ${filePath}`);
        Alert.alert('Success', `File saved at: ${filePath}`);
      } catch (err) {
        console.error('Error saat menyimpan file Excel:', err);
        Alert.alert('Error', 'Failed to save Excel file');
      }
    }
  };

  render() {
    const {totalData, isLoading, settingData, sensortotal, saveSensorData} =
      this.state;
    const buttonColor = this.state.connectedDevice ? '#4541E4' : 'grey';
    const buttonColor2 =
      Array.isArray(saveSensorData) && saveSensorData.length > 0
        ? '#4541E4'
        : 'grey';

    const currentSensorData = saveSensorData[totalData - 1] || {};

    return (
      <View style={{backgroundColor: 'white', flex: 1}}>
        <Text style={styles.judul}> Drops </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => this.props.navigation.goBack()}>
          <Image source={arrowback} style={styles.backIcon} />
        </TouchableOpacity>
        {this.state.connectedDevice && (
          <>
            <View style={styles.boxconnect}>
              <Text style={styles.text1}>
                Connected to {this.state.connectedDevice.name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  fontSize: 13,
                  color: 'grey',
                  marginTop: 5,
                  marginBottom: 10,
                  fontWeight: 'bold',
                }}>
                Change Device?{' '}
              </Text>
              <TouchableOpacity
                style={styles.buttontobluetooth}
                onPress={this.Masuk_Connectedscreen}>
                <Text
                  style={{fontSize: 13, color: '#4541E4', fontWeight: 'bold'}}>
                  Click Here
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {!this.state.connectedDevice && (
          <>
            <View style={styles.boxnotconnect}>
              <Text style={styles.text1}>No device connected</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  fontSize: 13,
                  color: 'grey',
                  marginTop: 5,
                  marginBottom: 10,
                  fontWeight: 'bold',
                }}>
                Make a connection?{' '}
              </Text>
              <TouchableOpacity
                style={styles.buttontobluetooth}
                onPress={this.Masuk_Connectedscreen}>
                <Text
                  style={{fontSize: 13, color: '#4541E4', fontWeight: 'bold'}}>
                  Click Here
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <ScrollView>
          <View style={styles.sensorSelectionContainer}>
            <TouchableOpacity
              style={[styles.navigationButton, {backgroundColor: buttonColor2}]}
              onPress={() => {
                if (saveSensorData.length > 0) {
                  this.setState(prevState => ({
                    totalData: Math.max(prevState.totalData - 1, 1), // Mencegah indeks negatif
                  }));
                }
              }}
              disabled={saveSensorData.length === 0}>
              <Text style={styles.navigationButtonText}>Prev</Text>
            </TouchableOpacity>

            <Text style={styles.indexText}>
              {saveSensorData.length > 0 ? `Drops ${totalData}` : `Drops ${0}`}
            </Text>

            <TouchableOpacity
              style={[styles.navigationButton, {backgroundColor: buttonColor2}]}
              onPress={() => {
                if (saveSensorData.length > 0) {
                  this.setState(prevState => ({
                    totalData: Math.min(
                      prevState.totalData + 1,
                      saveSensorData.length,
                    ), // Mencegah melebihi panjang array
                  }));
                }
              }}
              disabled={saveSensorData.length === 0}>
              <Text style={styles.navigationButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.line} />

          <View>{this.renderGraph(currentSensorData)}</View>

          <View style={styles.geophoneContainer}>
            <Text style={styles.geophoneHeader}>Geophone Sensor</Text>
            <View style={styles.dataItem}>
              <Text style={styles.label}>Force (kN):</Text>
              <Text style={styles.value}>
                {currentSensorData.maxForce || 0}
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.label}>Pulse (μs):</Text>
              <Text style={styles.value}>{currentSensorData.pulse || 0}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.label}>Press (kPa):</Text>
              <Text style={styles.value}>{currentSensorData.press || 0}</Text>
            </View>

            {Array.isArray(saveSensorData) &&
              saveSensorData.length > 0 &&
              currentSensorData.sensortotal >= 1 &&
              this.renderGeophoneSensor(
                1,
                currentSensorData.rOffset_1,
                currentSensorData.maxDeflection_s1,
                currentSensorData.eModuli_s1,
              )}
            {Array.isArray(saveSensorData) &&
              saveSensorData.length > 0 &&
              currentSensorData.sensortotal >= 2 &&
              this.renderGeophoneSensor(
                2,
                currentSensorData.rOffset_2,
                currentSensorData.maxDeflection_s2,
                currentSensorData.eModuli_s2,
              )}
            {Array.isArray(saveSensorData) &&
              saveSensorData.length > 0 &&
              currentSensorData.sensortotal >= 3 &&
              this.renderGeophoneSensor(
                3,
                currentSensorData.rOffset_3,
                currentSensorData.maxDeflection_s3,
                currentSensorData.eModuli_s3,
              )}

            {saveSensorData && saveSensorData.length !== 0 && (
              <View style={styles.sensorButtonsContainer2}>
                <TouchableOpacity
                  style={styles.excelButton}
                  onPress={() => this.createExcelFile(2)} // Mengirimkan nilai 2 untuk menyimpan file
                >
                  <Text style={styles.excelButtonText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.excelButton}
                  onPress={() => this.createExcelFile(1)} // Mengirimkan nilai 1 untuk berbagi file
                >
                  <Text style={styles.excelButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.geophoneContainer}>
            <Text style={styles.geophoneHeader}>Settings</Text>

            <View style={styles.dataItem}>
              <Text style={styles.label}>R.Offset (Cm):</Text>
              <Text style={styles.value}>{settingData?.roffset ?? '-'}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.label}>Diameter (Mm):</Text>
              <Text style={styles.value}>{settingData?.diameter ?? '-'}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.label}>Poisson Ratio:</Text>
              <Text style={styles.value}>
                {settingData?.poissonRatio ?? '-'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.box4}
              onPress={this.Masuk_Settingscreen}>
              <Text style={styles.excelButtonText}>Setting</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label2}>Number of Sensors:</Text>
          <View style={styles.sensorButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.sensorButton,
                {backgroundColor: sensortotal === 1 ? 'white' : '#4541E4'}, // Jika 1 sensor, warna hijau
              ]}
              onPress={() => this.setState({sensortotal: 1})}>
              <Text
                style={[
                  styles.sensorButtonText,
                  {color: sensortotal === 1 ? '#4541E4' : 'white'}, // Ubah warna teks sesuai kondisi
                ]}>
                1 Sensor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sensorButton,
                {backgroundColor: sensortotal === 3 ? 'white' : '#4541E4'}, // Jika 3 sensor, warna hijau
              ]}
              onPress={() => this.setState({sensortotal: 3})}>
              <Text
                style={[
                  styles.sensorButtonText,
                  {color: sensortotal === 3 ? '#4541E4' : 'white'}, // Ubah warna teks sesuai kondisi
                ]}>
                3 Sensor
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.box3, {backgroundColor: buttonColor}]}
            onPress={this.handleStartReading}>
            <Text style={styles.label6}>Retrieve data</Text>
          </TouchableOpacity>
        </ScrollView>
        {isLoading && (
          <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4541E4" />
              <Text
                style={{color: '#4541E4', marginTop: 10, alignSelf: 'center'}}>
                Loading...
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  judul: {
    marginTop: 22,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    color: '#000000',
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
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginTop: 5,
    marginBottom: 15,
    marginHorizontal: 16,
  },
  excelButton: {
    backgroundColor: '#4541E4',
    width: 160,
    padding: 7,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#4541E4',
    alignItems: 'center',
  },
  excelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  text1: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Roboto',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  labelContainer: {
    position: 'absolute',
    top: 5,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  svgWrapper: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgStyle: {
    backgroundColor: '#FFFFFF',
    width: '98%',
    height: '98%',
  },
  boxconnect: {
    marginHorizontal: 16,
    height: 45,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(39,201,63,1)',
    backgroundColor: 'rgba(39,201,63,0.2)',
    justifyContent: 'center',
  },
  boxnotconnect: {
    marginHorizontal: 16,
    height: 45,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 1)',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    justifyContent: 'center',
  },
  buttontobluetooth: {
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderColor: 'rgba(255, 255, 255, 0)',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 5,
  },
  buttontoset: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 204, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 204, 0, 0)',
    borderRadius: 5,
    right: 5,
    top: 10,
  },
  iconset: {
    width: 26,
    height: 26,
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
  box4: {
    height: 40,
    backgroundColor: '#4541E4',
    borderRadius: 5,
    marginTop: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataContainer: {
    flexDirection: 'column',
    marginBottom: 10,
    marginHorizontal: 16,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  sensorSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
  },
  indexText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    flex: 2,
  },
  navigationButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
    backgroundColor: '#4541E4',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  navigationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sensorButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginHorizontal: 16,
  },
  sensorButtonsContainer2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 12,
  },
  sensorButton: {
    padding: 7,
    width: 160,
    borderColor: '#4541E4',
    borderWidth: 2,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 6,
  },
  sensorButtonText: {
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  label2: {
    marginTop: 22,
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
  },
  label6: {
    fontSize: 18,
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  value: {
    fontSize: 14,
  },
  geophoneContainer: {
    backgroundColor: '#e0f7fa',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    marginHorizontal: 16,
  },
  geophoneHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  loadingContainer: {
    backgroundColor: '#FFCC00',
    padding: 20,
    borderRadius: 10,
  },
});

export default function (props) {
  const navigation = useNavigation();
  const route = useRoute();
  return <Projectscreen {...props} navigation={navigation} route={route} />;
}
