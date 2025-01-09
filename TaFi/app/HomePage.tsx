import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { ResizeMode, Video } from "expo-av";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Audio } from "expo-av";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
import RecordSpeech from "@/functions/recordSpeech";
import useWebFocus from "@/hooks/useWebFocus";

// Import the video assets
import { videos } from "@/assets/videos/videoIndex"; // Updated: Mapping of video files

const screenHeight = Dimensions.get("window").height;
const rootOrigin = process.env.EXPO_PUBLIC_LOCAL_DEV_IP;

export default function HomeScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [transcribedSpeech, setTranscribedSpeech] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [islText, setISLText] = useState(""); // Stores the ISL grammar-compatible text
  const [isLoading, setIsLoading] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // To track the current video index
  const [wordList, setWordList] = useState<string[]>([]); // List of words to play videos for
  const videoRef = useRef(null);

  const isWebFocused = useWebFocus();
  const audioRecordingRef = useRef(new Audio.Recording());
  const audioPlaybackRef = useRef<Audio.Sound | null>(null);
  const webAudioPermissionsRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const getMicAccess = async () => {
      try {
        if (isWebFocused) {
          if (!webAudioPermissionsRef.current) {
            const permissions = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            webAudioPermissionsRef.current = permissions;
          }
        } else {
          if (webAudioPermissionsRef.current) {
            webAudioPermissionsRef.current
              .getTracks()
              .forEach((track) => track.stop());
            webAudioPermissionsRef.current = null;
          }
        }

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
    setIsTranscribing(true);

    try {
      if (audioRecordingRef.current) {
        await audioRecordingRef.current.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });

        const uri = audioRecordingRef.current.getURI();
        console.log("Recording stopped and stored at", uri);

        const status = await audioRecordingRef.current.getStatusAsync();
        if (status?.durationMillis) {
          setAudioDuration(
            parseFloat((status.durationMillis / 1000).toFixed(2))
          );
        }

        const transcript = await transcribeSpeech(audioRecordingRef);
        if (transcript) {
          console.log("Transcription:", transcript);
          setTranscribedSpeech(transcript);

          await ISLGrammerConv(transcript);
        } else {
          console.warn("No transcription result found.");
          setTranscribedSpeech("");
          setIsTranscribing(false);
        }

        const { sound } =
          await audioRecordingRef.current.createNewLoadedSoundAsync();
        audioPlaybackRef.current = sound;
      }
    } catch (error) {
      console.error("Error during stopRecording or transcription:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const ISLGrammerConv = async (transcribedSpeech: any) => {
    console.log("Sending transcript for ISL grammar conversion...");
    setIsTranscribing(true);

    try {
      const response = await fetch(`${rootOrigin}/convert-to-isl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcribedSpeech }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ISL grammar-compatible text.");
      }

      const data = await response.json();
      console.log("ISL grammar-compatible text received:", data.islText);

      setISLText(data.islText.toUpperCase());

      // Split text into words and reset video index
      const words = data.islText.split(" ");
      setWordList(words);
      setCurrentWordIndex(0);
    } catch (error) {
      console.error("Error during ISL grammar conversion:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleVideoPlaybackStatus = (status: { didJustFinish: boolean }) => {
    if (status.didJustFinish) {
      const nextIndex = currentWordIndex + 1;
      if (nextIndex < wordList.length) {
        setCurrentWordIndex(nextIndex);
      } else {
        console.log("All videos played");
      }
    }
  };

  // Debug and verify the video source mapping
  useEffect(() => {
    console.log("Current word list:", wordList);
    console.log("Current word index:", currentWordIndex);
  }, [wordList, currentWordIndex]);

  // Stop and restart video playback if the word changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.stopAsync().then(() => {
        videoRef.current.playAsync();
      });
    }
  }, [currentWordIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <ScrollView>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.box_1}>
            <Text style={styles.headerText}>Ta-Fi</Text>
          </View>

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

          <View style={styles.container_2}>
            <ScrollView
              style={styles.islTextContainer}
              contentContainerStyle={{ alignItems: "center" }}
            >
              <Text style={styles.islText}>
                {islText || "ISL Grammar Text Will Appear Here"}
              </Text>
            </ScrollView>

            {wordList.length > 0 && (
              <Video
                ref={videoRef}
                key={wordList[currentWordIndex]} // Force re-render on word change
                source={videos[wordList[currentWordIndex]]}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                onPlaybackStatusUpdate={handleVideoPlaybackStatus}
              />
            )}
          </View>

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
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  box_1: {
    height: screenHeight * 0.1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderBottomColor: "black",
    borderBottomWidth: 2,
    backgroundColor: "#007BFF",
  },
  headerText: {
    fontSize: 42,
    fontFamily: "LexendExa",
    color: "white",
  },
  box_2: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    paddingHorizontal: 15,
  },
  transcriptionContainer: {
    backgroundColor: "#ececec",
    width: "100%",
    height: 150,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  transcribedText: {
    fontSize: 18,
    lineHeight: 24,
    color: "#333",
    textAlign: "left",
  },
  container_2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f1f3f4",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  islTextContainer: {
    backgroundColor: "#f8f9fa",
    width: "100%",
    maxHeight: 150,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  islText: {
    fontSize: 18,
    lineHeight: 24,
    color: "#007BFF",
    textAlign: "center",
  },
  video: {
    width: 300,
    height: 250,
    marginTop: 10,
  },
  box_3: {
    height: screenHeight * 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  microphoneButton: {
    height: 70,
    width: 70,
    backgroundColor: "#137cdd",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});

