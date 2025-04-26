import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { Homescreen, Splashscreen, Historyscreen, Imagescreen, Summaryscreen, Bluetoothscreen, Projectscreen, Connectedscreen, Project1screen, Createprojectscreen, Projectinfoscreen, Sessionscreen,Sessioninfoscreen,Locationinfoscreen,Createlocationscreen } from "../pages";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigator } from '../components/molecules';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Create individual stacks for each tab to manage their navigation
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Homescreen" component={Homescreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const ImageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Imagescreen" component={Imagescreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const SummaryStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Summaryscreen" component={Summaryscreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const MainApp = () => {
  return (
    <Tab.Navigator tabBar={props => <BottomNavigator {...props} />}>
      {/* Use stacks for each tab to manage individual navigation */}
      <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Image" component={ImageStack} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={SummaryStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const Router = () => {
  return (
    <Stack.Navigator initialRouteName="Splashscreen">
      <Stack.Screen name="Splashscreen" component={Splashscreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
      {/* Keep other screens outside the tab navigator */}
      <Stack.Screen name="Connectedscreen" component={Connectedscreen} options={{ headerShown: false }} />
      <Stack.Screen name="Project1screen" component={Project1screen} options={{ headerShown: false }} />
      <Stack.Screen name="Createprojectscreen" component={Createprojectscreen} options={{ headerShown: false }} />
      <Stack.Screen name="Projectinfoscreen" component={Projectinfoscreen} options={{ headerShown: false }} />
      <Stack.Screen name="Sessionscreen" component={Sessionscreen} options={{ headerShown: false }} />
      <Stack.Screen name="Sessioninfoscreen" component={Sessioninfoscreen} options={{ headerShown: false }} />
      <Stack.Screen name="Projectscreen" component={Projectscreen} options={{ headerShown: false }} />
      <Stack.Screen name="Locationinfoscreen" component={Locationinfoscreen} options={{ headerShown: false }} />
      <Stack.Screen name="Createlocationscreen" component={Createlocationscreen} options={{ headerShown: false }} />
      <Stack.Screen name="Summaryscreen" component={Summaryscreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default Router;
