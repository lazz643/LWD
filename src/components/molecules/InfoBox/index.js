import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const BoxInfo = ({items}) => {
  return (
    <View style={styles.box}>
      {items.map((item, index) => (
        <View key={index} style={styles.infoRow}>
          <Text style={styles.label1}>{item.label}</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.info1}>{item.value || 'N/A'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#FFCC00',
    borderRadius: 5,
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 16,
    marginHorizontal: 16,
    gap: 28,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label1: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  info1: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'justify',
  },
  infoContainer: {
    width: '60%',
    alignItems: 'flex-end',
  },
});

export default BoxInfo;
