import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Switch } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { StackParamList } from '../App';

const App = () => {

    const navigation = useNavigation<NavigationProp<StackParamList>>();

    const [isToggled, setIsToggled] = useState(false); // State to manage toggle status
    
    // const handleToggle = () => {
    // setIsToggled(!isToggled); // Toggle the state
    // setTimeout(() => {
    //   navigation.navigate('MainScreen'); // Navigate after 2 seconds
    //     }, 1000); // 2-second delay
    // };
    
    const handleScreen = () => {
        navigation.navigate('MainScreen');
    }

    return (
    <TouchableOpacity style={styles.mainscreen} onPress={handleScreen}>
        <View style={styles.container}>
            <Image
                source={require('../assets/App_Images/logo.jpg')} // Replace with the actual path to your image
                style={styles.image}
                resizeMode="contain" 
            />
            <Text style={styles.title}>Ta-Fi</Text>
            <Text style={styles.subtitle}>Talking Fingers</Text>
            
            {/* <Switch
                value={isToggled}
                onValueChange={handleToggle}
                thumbColor={isToggled ? '#4CAF50' : '#f4f3f4'} // Toggle thumb color
                trackColor={{ false: '#767577', true: '#81b0ff' }} // Track colors
            />
            <Text style={styles.toggleText}>
                {isToggled ? 'Toggled On' : 'Toggled Off'}
            </Text> */}
                
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainscreen: {
    flex: 1, 
    backgroundColor: 'red',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', 
  },
  image: {
    width: 150, // Adjust size as needed
    height: 150, // Adjust size as needed
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 24,
    },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 18,
    marginTop: 10,
  },
});

export default App;