import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

// Import the JSON file containing the Google Cloud credentials
const googleCloudConfig = require('../assets/keys/cosmic-stacker-442207-a8-fb852e5ef9d4.json');

const GOOGLE_API_URL = 'https://speech.googleapis.com/v1p1beta1/speech:recognize';

const speechToTextService = {
  recording: null as Audio.Recording | null,

  /**
   * Starts audio recording
   */
  async startRecording() {
    try {
      console.log('Requesting permissions...');
      const permission = await Audio.requestPermissionsAsync();
      console.log('Permission granted:', permission.granted);

      console.log('Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: 1,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      console.log('Recording started:', recording);
      this.recording = recording;
      await recording.startAsync();
    } catch (err) {
      console.error('Failed to start recording:', err);
      throw err;
    }
  },

  /**
   * Stops audio recording and returns the URI of the audio file
   */
  async stopRecording(): Promise<string | undefined> {
    try {
      if (!this.recording) return undefined;
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      return uri as string;
    } catch (err) {
      console.error('Failed to stop recording:', err);
      throw err;
    }
  },

  /**
   * Transcribes audio from the given URI using Google Cloud Speech-to-Text API
   * @param audioUri - Local URI of the recorded audio file
   */
  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const payload = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
        },
        audio: {
          content: audioBase64,
        },
      };

      // Use the API key from the Google Cloud JSON file
      const apiKey = googleCloudConfig.api_key;

      const response = await axios.post(`${GOOGLE_API_URL}?key=${apiKey}`, payload);

      const transcript = response.data.results
        .map((result: any) => result.alternatives[0].transcript)
        .join(' ');
      return transcript;
    } catch (err) {
      console.error('Error transcribing audio:', err);
      throw err;
    }
  },
};

export default speechToTextService;
