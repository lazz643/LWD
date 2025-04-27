import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {trash} from '../../../assets';

const ListInfo = ({title, data, onItemPress, onDeletePress, emptyText}) => {
  return (
    <View style={styles.boxx}>
      <Text style={styles.label5}>{title}</Text>
      {data.length > 0 ? (
        data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.box4}
            onPress={() => onItemPress(item)}>
            <View style={styles.projectInfo}>
              <View
                style={
                  title === 'Sessions'
                    ? styles.nameSessContainer
                    : styles.nameSessContainer
                }>
                <Text style={styles.sessionText}>
                  {item.S_title || item.L_title || 'Untitled'}
                </Text>
              </View>

              <TouchableOpacity onPress={() => onDeletePress(index)}>
                <Image source={trash} style={styles.trashIcon} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text
          style={
            title === 'Sessions' ? styles.noSessionText : styles.noSessionText
          }>
          {emptyText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  boxx: {
    marginHorizontal: 16,
    backgroundColor: '#FFCC00',
    borderRadius: 5,
    marginTop: 25,
    marginBottom: 90,
    padding: 15,
  },
  label5: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    width: '35%',
    marginBottom: 10,
  },
  box4: {
    height: 55,
    backgroundColor: '#4541E4',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 5,
    justifyContent: 'center',
  },
  projectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameSessContainer: {
    width: '60%',
  },
  sessionText: {
    left: 15,
    fontSize: 14,
    color: '#E0E0E0',
  },
  trashIcon: {
    width: 25,
    height: 25,
    tintColor: '#F6F6F6',
    right: 15,
  },
  noSessionText: {
    marginTop: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
});

export default ListInfo;
