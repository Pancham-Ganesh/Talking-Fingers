import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Audio } from "expo-av";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
import RecordSpeech from "@/functions/recordSpeech";
import useWebFocus from "@/hooks/useWebFocus";

const screenHeight = Dimensions.get("window").height;

export default function HomeScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [transcribedSpeech, setTranscribedSpeech] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isWebFocused = useWebFocus();
  const audioRecordingRef = useRef(new Audio.Recording());
  const audioPlaybackRef = useRef<Audio.Sound | null>(null);
  const webAudioPermissionsRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const getMicAccess = async () => {
      try {
        if (isWebFocused) {
          // Web-specific permissions
          if (!webAudioPermissionsRef.current) {
            const permissions = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            webAudioPermissionsRef.current = permissions;
          }
        } else {
          // Release web microphone access
          if (webAudioPermissionsRef.current) {
            webAudioPermissionsRef.current
              .getTracks()
              .forEach((track) => track.stop());
            webAudioPermissionsRef.current = null;
          }
        }

        // Mobile permissions
        if (!isWebFocused) {
          const { status } = await Audio.getPermissionsAsync();
          if (status !== "granted") {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
              throw new Error("Audio recording permission not granted");
            }
          }
        }
      } catch (error) {
        console.error("Error managing microphone access:", error);
      }
    };

    getMicAccess();
  }, [isWebFocused]);


  const startRecording = async () => {
    await RecordSpeech({
      audioRecordingRef,
      setIsRecording,
      isWeb: !!webAudioPermissionsRef.current,
    });
  };

  const stopRecording = async () => {
    console.log("Stopping recording...");
    setIsRecording(false);
    setIsTranscribing(true); // Show loading state for transcription

    try {
      if (audioRecordingRef.current) {
        // Stop and unload the recording
        await audioRecordingRef.current.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });

        const uri = audioRecordingRef.current.getURI();
        console.log("Recording stopped and stored at", uri);

        // Get recording status to fetch duration
        const status = await audioRecordingRef.current.getStatusAsync();
        if (status?.durationMillis) {
          setAudioDuration(
            parseFloat((status.durationMillis / 1000).toFixed(2))
          );
        }

        // Transcribe the audio
        const transcript = await transcribeSpeech(audioRecordingRef);
        if (transcript) {
          console.log("Transcription:", transcript);
          setTranscribedSpeech(transcript); // Store the transcribed text
        } else {
          console.warn("No transcription result found.");
          setTranscribedSpeech("");
          setIsTranscribing(false);
        }

        // Prepare for playback
        const { sound } =
          await audioRecordingRef.current.createNewLoadedSoundAsync();
        audioPlaybackRef.current = sound;
      }
    } catch (error) {
      console.error("Error during stopRecording or transcription:", error);
    } finally {
      setIsTranscribing(false); // Remove loading state for transcription
    }
  };

  // const playRecording = async () => {
  //   if (audioPlaybackRef.current) {
  //     const status = await audioPlaybackRef.current.getStatusAsync();

  //     // Check if the status is successful and loaded
  //     if (status.isLoaded) {
  //       if (!status.isPlaying) {
  //         console.log("Playing the sound...");
  //         setIsPlaying(true);
  //         await audioPlaybackRef.current.playAsync();
  //         audioPlaybackRef.current.setOnPlaybackStatusUpdate(
  //           (updatedStatus) => {
  //             // Ensure updatedStatus is of the correct type
  //             if (updatedStatus.isLoaded && !updatedStatus.isPlaying) {
  //               setIsPlaying(false);
  //             }
  //           }
  //         );
  //       } else {
  //         console.log("Pausing the sound...");
  //         await audioPlaybackRef.current.pauseAsync();
  //         setIsPlaying(false);
  //       }
  //     } else {
  //       console.error("Sound is not loaded or encountered an error.");
  //     }
  //   } else {
  //     console.error("No sound instance available.");
  //   }
  // };

  // const stopPlayback = async () => {
  //   if (audioPlaybackRef.current) {
  //     console.log("Stopping playback...");
  //     await audioPlaybackRef.current.stopAsync();
  //     setIsPlaying(false);
  //   } else {
  //     console.error("No sound instance available to stop.");
  //   }
  // };

  return (
    <ScrollView>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // Adjust this offset as needed
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.box_1}>
            <Text style={styles.headerText}>Ta-Fi</Text>
          </View>

          {/* Transcription Area */}
          <View style={styles.box_2}>
            <View style={styles.transcriptionContainer}>
              {isTranscribing ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text
                  style={{
                    ...styles.transcribedText,
                    color: transcribedSpeech ? "#000" : "rgb(150,150,150)",
                  }}
                >
                  {transcribedSpeech ||
                    "Your transcribed text will be shown here"}
                </Text>
              )}
            </View>
          </View>

          {/* Microphone Button */}
          <View style={styles.box_3}>
            <TouchableOpacity
              style={{
                ...styles.microphoneButton,
                opacity: isRecording || isTranscribing ? 0.5 : 1,
              }}
              onPressIn={startRecording}
              onPressOut={stopRecording}
              disabled={isRecording || isTranscribing}
            >
              {isRecording ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome name="microphone" size={60} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Input and Actions */}
          <View style={styles.box_4}>
            <TextInput style={styles.input} placeholder="Enter a Prompt" />
            <View style={styles.box_4_1}>
              <TouchableOpacity style={styles.button}>
                <Image
                  source={require("../assets/images/send.png")} // Replace with your send icon
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Image
                  source={require("../assets/images/voice.png")} // Replace with your voice icon
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: screenHeight,
    // backgroundColor: 'black',
    // margin: 10,
  },
  box_1: {
    height: screenHeight * 0.1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderBottomColor: "black",
    borderBottomWidth: 2,
    // backgroundColor: 'blue',
    // margin: 10,
  },
  headerText: {
    fontSize: 42,
    fontFamily: "LexendExa",
  },
  box_2: {
    height: screenHeight * 0.4,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: 'yellow',
    margin: 10,
    paddingHorizontal: 15,
  },
  transcriptionContainer: {
    backgroundColor: "rgb(220,220,220)",
    width: "100%",
    height: 300,
    padding: 20,
    marginBottom: 20,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  transcribedText: {
    fontSize: 20,
    padding: 5,
    color: "#000",
    textAlign: "left",
    width: "100%",
  },

  box_3: {
    height: screenHeight * 0.23,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: 'green',
    // margin: 10,
    paddingTop: 30,
  },
  microphoneButton: {
    backgroundColor: "red",
    width: 95,
    height: 95,
    marginTop: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  box_4: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-evenly",
    paddingBottom: 25,
    padding: 10,
    // backgroundColor: 'lightblue',
    // margin: 10,
  },
  input: {
    flex: 0.9,
    height: 50,
    borderColor: "gray",
    borderWidth: 3,
    marginRight: 0,
    paddingHorizontal: 10,
  },
  box_4_1: {
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
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
