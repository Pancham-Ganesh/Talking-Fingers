import { Audio } from "expo-av";
import { MutableRefObject } from "react";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as Device from "expo-device";
import { readBlobAsBase64 } from "./readBlobAsBase64";

export const transcribeSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording>
) => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });

    const recordingUri = audioRecordingRef?.current?.getURI() || "";
    // console.log(recordingUri);
    if (!recordingUri) {
      console.error("No recording URI found.");
      return undefined;
    }

    let base64Uri = "";
    if (Platform.OS === "web") {
      const blob = await fetch(recordingUri).then((res) => res.blob());
      const foundBase64 = (await readBlobAsBase64(blob)) as string;
      const removedPrefixBase64 = foundBase64.split("base64,")[1];
      base64Uri = removedPrefixBase64;
    } else {
      base64Uri = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    const audioConfig = {
      encoding:
        Platform.OS === "android"
          ? "AMR_WB"
          : Platform.OS === "web"
          ? "WEBM_OPUS"
          : "LINEAR16",
      sampleRateHertz:
        Platform.OS === "android"
          ? 16000
          : Platform.OS === "web"
          ? 48000
          : 41000,
      languageCode: "en-US",
    };

    const rootOrigin =
      Platform.OS === "android" || Platform.OS === "ios"
        ? process.env.EXPO_PUBLIC_LOCAL_DEV_IP
        : Platform.OS === "web"
        ? "localhost" // or use a different value if necessary for the web
        : "localhost"; // fallback for other platforms
    const serverUrl = `http://${rootOrigin}:4000`;

    const serverResponse = await fetch(`${serverUrl}/speech-to-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audioUrl: base64Uri, config: audioConfig }),
    })
      .then((res) => res.json())
      .catch((e: Error) => console.error(e));

    //  const responseJson = await serverResponse;
    //  const message = responseJson?.message;
    //  const receivedData = responseJson?.receivedData;
    //  // Log or use the response data
    //  console.log("Message:", message);
    //  console.log("Received Data:");

    console.log(serverResponse);

    const results = serverResponse?.results;

    if (results) {
      const transcript = results?.[0].alternatives?.[0].transcript;
      return transcript || undefined;
    } else {
      console.error("No transcript found");
      return undefined;
    }
  } catch (e) {
    console.error("Failed to transcribe speech!", e);
    return undefined;
  }
};
