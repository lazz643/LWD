import React from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {arrowback} from '../../../assets';

const HeaderModel = (navigation, headerTitle) => {
  return {
    headerTitle: headerTitle,
    headerTitleAlign: 'center',
    headerStyle: {backgroundColor: 'rgb(255, 255, 255)'},
    headerLeft: () => (
      <TouchableOpacity
        style={{marginLeft: 16}}
        onPress={() => navigation.goBack()}>
        <Image source={arrowback} style={{width: 27, height: 20}} />
      </TouchableOpacity>
    ),
  };
};

export default HeaderModel;
