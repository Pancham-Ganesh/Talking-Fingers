import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import ScrollableScreen from '../components/Scrollable';
import MicrophoneButton from '../components/MicrophoneButton';

const screenHeight = Dimensions.get('window').height;


const App = () => {

  const [transcription, setTranscription] = useState('');

  return (
    <ScrollableScreen>
        <KeyboardAvoidingView
            style={{ flex: 1, }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // Adjust this offset as needed
        >  
            <View style={styles.container}>
                <View style={[styles.box_1]}>
                    <Text style={styles.headerText}>Ta-Fi</Text>
                </View>
                <View style={[styles.box_2]}>
                    {/* <Image
                    source={require('../assets/App_Images/Render.jpg')} // Replace with your image path
                    style={styles.image}
                    resizeMode="cover" 
                    /> */}
                    <Text>{transcription || 'Your transcription will appear here'}</Text>
                </View>
                <View style={[styles.box_3]}>
                    <MicrophoneButton onTranscription={(text) => setTranscription(text)} />
                </View>
                <View style={[styles.box_4]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter a Prompt"
                    />
                    <View style={styles.box_4_1}>
                        <TouchableOpacity style={styles.button}>
                            <Image 
                                source={require('../assets/App_Images/send.png')} // Replace with your send icon
                                style={styles.buttonIcon} 
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}>
                            <Image 
                                source={require('../assets/App_Images/voice.png')} // Replace with your voice icon
                                style={styles.buttonIcon} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>


            
        </KeyboardAvoidingView>
    </ScrollableScreen>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: screenHeight,
    // backgroundColor: 'black',
    // margin: 10,
  },
  box_1: {
    height: screenHeight * 0.1,       
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    // backgroundColor: 'blue',
    // margin: 10,
  },
  headerText: {
    fontSize: 42,
    fontFamily: 'LexendExa',
  },
  box_2: {
    height: screenHeight * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'yellow',
    margin: 10,
  },
  image: {
    width: 300, 
    height: 300, 
  },
  box_3: {
    height: screenHeight * 0.23,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'green',
    // margin: 10,
    paddingTop: 30,
  },
  microphoneButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 15,
    alignSelf: 'center',
    marginBottom: 20,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  microphoneIcon: {
    width: 60,
    height: 60,
  },

  box_4: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingBottom: 25,
    padding: 10,
    // backgroundColor: 'lightblue',
    // margin: 10,
    },
  input: {
    flex: 0.9,
    height: 50,
    borderColor: 'gray',
    borderWidth: 3,
    marginRight: 0,
    paddingHorizontal: 10,
  },
  box_4_1: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
  button: {
    marginRight: 10,
  },
  buttonIcon: {
    width: 38,
    height: 38,
  },

});

export default App;