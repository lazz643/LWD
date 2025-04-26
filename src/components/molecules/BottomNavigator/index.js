import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { HomeON, HomeOFF, HistoryON, HistoryOFF, ImageON, ImageOFF, SettingON, SettingOFF } from '../../../assets';

const Icon = ({ label, focus }) => {
  let iconSource;

  if (label === 'Home') {
    iconSource = focus ? HomeON : HomeOFF;
  } else if (label === 'History') {
    iconSource = focus ? HistoryON : HistoryOFF;
  } else if (label === 'Image') {
    iconSource = focus ? ImageON : ImageOFF;
  } else if (label === 'Settings') {
    iconSource = focus ? SettingOFF : SettingON
  } else {
    iconSource = HomeOFF; // Default icon
  }

  return <Image source={iconSource} style={styles.icon} />;
};

const BottomNavigator = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            {/* Wrapper to hold both Icon and Label */}
            <View style={styles.iconLabelContainer}>
              <Icon label={label} focus={isFocused} />
              <Text style={[styles.label, isFocused ? styles.labelFocused : null]}>{label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavigator;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  tabButton: {
    alignItems: 'center',
  },
  iconLabelContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 4, // Space between icon and label
  },
  label: {
    fontSize: 12,
    color: 'gray',
  },
  labelFocused: {
    color: 'black', // Color when focused
  },
});
