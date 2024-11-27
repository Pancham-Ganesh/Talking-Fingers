import React, { useState } from 'react';
import { TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import speechToTextService from '../services/speechToTextService';

interface MicrophoneButtonProps {
  onTranscription: (transcription: string) => void;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleMicrophonePress = async () => {
    try {
      if (isRecording) {
        setIsRecording(false);
        const audioUri = await speechToTextService.stopRecording();
        
        if (!audioUri) {
          Alert.alert('Error', 'No audio file was recorded.');
          return;
        }  
          
        const transcription = await speechToTextService.transcribeAudio(audioUri);
        onTranscription(transcription);
      } else {
        setIsRecording(true);
        await speechToTextService.startRecording();
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsRecording(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleMicrophonePress}>
      <Image
        source={require('../assets/App_Images/microphone.png')} // Replace with your microphone icon
        style={styles.microphoneIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  microphoneIcon: {
    width: 50,
    height: 50,
  },
});

export default MicrophoneButton;
