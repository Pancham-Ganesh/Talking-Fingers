import { Audio } from "expo-av";
import { MutableRefObject } from "react";

interface RecordSpeechProps {
  audioRecordingRef: MutableRefObject<Audio.Recording>;
  setIsRecording: (value: boolean) => void;
  isWeb: boolean;
}

const RecordSpeech = async ({
  audioRecordingRef,
  setIsRecording,
  isWeb,
}: RecordSpeechProps): Promise<void> => {
  try {
    setIsRecording(true);

    if (isWeb) {
      console.log("Using web recording setup.");
      // Add specific web recording logic here if needed
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    if (audioRecordingRef.current?._isDoneRecording) {
      const newRecording = new Audio.Recording();
      audioRecordingRef.current = newRecording; // Update the ref safely
    }

    await audioRecordingRef.current?.prepareToRecordAsync({
      android: {
        extension: ".amr",
        outputFormat: Audio.AndroidOutputFormat.AMR_WB,
        audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: ".wav",
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: "audio/webm;codecs=opus",
        bitsPerSecond: 128000,
      },
    });

    await audioRecordingRef.current?.startAsync();
    console.log("Recording started");
  } catch (error) {
    console.error("Failed to start recording:", error);
    setIsRecording(false);
  }
};

export default RecordSpeech;
