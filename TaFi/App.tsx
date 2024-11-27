import React, { useState, useEffect } from "react";
import * as Font from 'expo-font';
import { View, StyleSheet, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import "react-native-gesture-handler";
import { AuthProvider } from './store/auth';
import Home_Page from './screens/HomePage'
import MainScreen from "./screens/MainScreen";

export type StackParamList = {
  HomePage: undefined;
  MainScreen: undefined;
  // OrderScreenPanel: { 
  //   screen: keyof OrderScreenPanelParamList; 
  //   params?: OrderScreenPanelParamList[keyof OrderScreenPanelParamList]; 
  // };
};

const Stack = createNativeStackNavigator<StackParamList>();



const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'ProtestStrike-Regular': require('./assets/fonts/ProtestStrike-Regular.ttf'),
        'LexendExa': require('./assets/fonts/LexendExa-VariableFont_wght.ttf')
      });
      setFontLoaded(true);
    }
    loadFont();
  }, []);

  // Set a delay for splash screen
  // useEffect(() => {
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2000);
  // }, []);

  // if (isLoading || !fontLoaded) {
  //   return <Splash />;
  // }

  return (
  <NavigationContainer>
    <AuthProvider>
        <SafeAreaView style={styles.container}>
            <Stack.Navigator 
              screenOptions={{
                  headerShown: false,
              }}
            >
            <Stack.Screen name="HomePage" component={Home_Page} />
            <Stack.Screen name="MainScreen" component={MainScreen} />
            </Stack.Navigator>
      </SafeAreaView>
    </AuthProvider>
  </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 10, // Offset for devices without SafeAreaView
  },
});

export default App;