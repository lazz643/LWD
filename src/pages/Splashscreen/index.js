import {Image, StyleSheet, Text, View } from 'react-native'
import React,{useEffect} from 'react'
import {tampilanutama} from '../../assets/image'

const Splashscreen = ({navigation}) => {
  useEffect (() =>{
    setTimeout(() => {
       navigation.replace('MainApp')
    },3000)
  },[])
    return (
      <View style={styles.container}>
        <Image source={tampilanutama} style={styles.image} />
      </View>

      )
}

export default Splashscreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: 490, // Adjust the width as needed
    height: 490, // Adjust the height as needed
  },
});
