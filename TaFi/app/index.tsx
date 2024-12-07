import { Text, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {

  const router = useRouter();

  const handleScreen = () => {
    router.push("/HomePage");
  };


  return (
    <TouchableOpacity style={styles.mainscreen} onPress={handleScreen}>
      <View style={styles.container}>
        <Image
          source={require("../assets/images/icon.png")} // Replace with the actual path to your image
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
}

const styles = StyleSheet.create({
  mainscreen: {
    flex: 1,
    backgroundColor: "red",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 150, // Adjust size as needed
    height: 150, // Adjust size as needed
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 24,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 18,
    marginTop: 10,
  },
});