import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import DatePicker from 'react-native-date-picker'; // pastikan ini sudah diinstal

const DynamicForm = ({
  title,
  description,
  soil,
  air,
  surface,
  material,
  layer,
  projectStart,
  imageUris,
  latitude,
  longitude,
  setTitle,
  setDescription,
  setSoil,
  setAir,
  setSurface,
  setMaterial,
  setLayer,
  setProjectStart,
  setImageUris,
  openStartDatePicker,
  setOpenStartDatePicker,
  selectedStartDate,
  onSubmit,
  handleCameraPress,
  handleOpenMap,
}) => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.text1}>Title</Text>
      <TextInput
        style={styles.inputBox}
        placeholder="Enter title"
        value={title}
        onChangeText={setTitle}
        maxLength={40}
      />

      {/* Description */}
      <Text style={styles.text1}>Description</Text>
      <TextInput
        style={styles.inputBox2}
        placeholder="Enter description"
        value={description}
        onChangeText={setDescription}
        maxLength={200}
        multiline
      />

      {/* Soil Moisture Content (only for CreateLocation) */}
      {soil !== undefined && (
        <>
          <Text style={styles.text1}>Soil Moisture Content</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Enter Soil"
            value={soil}
            onChangeText={setSoil}
            maxLength={25}
          />
        </>
      )}

      {/* Air Temperature (only for CreateLocation) */}
      {air !== undefined && (
        <>
          <Text style={styles.text1}>Air Temperature</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Enter air temperature"
            value={air}
            onChangeText={setAir}
            maxLength={25}
          />
        </>
      )}

      {/* Surface Temperature (only for CreateLocation) */}
      {surface !== undefined && (
        <>
          <Text style={styles.text1}>Surface Temperature</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Enter surface temperature"
            value={surface}
            onChangeText={setSurface}
            maxLength={25}
          />
        </>
      )}

      {/* Material Temperature (only for CreateLocation) */}
      {material !== undefined && (
        <>
          <Text style={styles.text1}>Material Temperature</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Enter material"
            value={material}
            onChangeText={setMaterial}
            maxLength={25}
          />
        </>
      )}

      {/* Layer (only for CreateSession) */}
      {layer !== undefined && (
        <>
          <Text style={styles.text1}>Layer</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Enter layer"
            value={layer}
            onChangeText={setLayer}
            maxLength={25}
          />
        </>
      )}

      {/* Session Start Date */}
      <Text style={styles.text1}>Start Date</Text>
      <TouchableOpacity
        style={styles.inputBox}
        onPress={() => setOpenStartDatePicker(true)}>
        <Text style={styles.dateText}>
          {projectStart ? projectStart : 'Select start date'}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={openStartDatePicker}
        date={selectedStartDate}
        mode="date"
        onConfirm={date => {
          setOpenStartDatePicker(false);
          setSelectedStartDate(date);
          setProjectStart(date.toLocaleDateString('id-ID')); // Mengubah format sesuai kebutuhan
        }}
        onCancel={() => setOpenStartDatePicker(false)}
      />

      {/* Image Upload */}
      <Text style={styles.text3}>Picture</Text>
      <TouchableOpacity style={styles.cambutton} onPress={handleCameraPress}>
        <Image source={{uri: 'camera-icon-url'}} style={styles.camIcon} />
        <Text style={styles.text4}>Tap to take a picture</Text>
      </TouchableOpacity>

      {imageUris.length > 0 ? (
        <View style={styles.imageContainer}>
          {imageUris.map((image, index) => (
            <Image key={index} source={{uri: image.uri}} style={styles.image} />
          ))}
        </View>
      ) : (
        <View style={styles.imageContainer}>
          <Text style={styles.text5}>No images taken yet</Text>
        </View>
      )}

      {/* Location */}
      {latitude && longitude && (
        <Text style={styles.locationText}>
          Latitude: {latitude}, Longitude: {longitude}
        </Text>
      )}
      <TouchableOpacity style={styles.boxloc} onPress={handleOpenMap}>
        <Image source={{uri: 'location-icon-url'}} style={styles.locIcon} />
        <Text style={styles.text4}>Open Maps</Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity style={styles.createButton} onPress={onSubmit}>
        <Text style={styles.text4}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 16,
  },
  inputBox: {
    height: 45,
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    marginBottom: 10,
    marginTop: 5,
    marginHorizontal: 16,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  text1: {
    fontSize: 16,
    color: '#000000',
    marginTop: 5,
    marginLeft: 16,
  },
  text2: {
    fontSize: 16,
    color: '#000000',
    marginTop: 15,
    marginLeft: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'left',
  },
  text4: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 55,
  },
  inputBox2: {
    height: 90,
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 16,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
  },
  createButton: {
    marginHorizontal: 16,
    height: 45,
    backgroundColor: '#4541E4',
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 5,
    justifyContent: 'center',
  },
  cambutton: {
    marginHorizontal: 16,
    height: 90,
    backgroundColor: '#4541E4',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  boxloc: {
    marginHorizontal: 16,
    height: 90,
    backgroundColor: '#4541E4',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
  },
  camIcon: {
    width: 40,
    height: 35,
    alignSelf: 'center',
    top: 14,
  },
  locIcon: {
    width: 30,
    height: 37,
    alignSelf: 'center',
    top: 14,
  },
  text3: {
    fontSize: 16,
    color: '#000000',
    marginTop: 5,
    marginLeft: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 20,
    marginHorizontal: 16,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 5,
    margin: 2,
  },
  text5: {
    fontSize: 16,
    color: 'red',
    marginTop: 5,
    marginBottom: 10,
    marginLeft: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 16,
    marginTop: 5,
  },
});

export default DynamicForm;
