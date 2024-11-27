// ScrollableScreen.js
import React, { ReactNode } from 'react';
import { ScrollView, SafeAreaView, StyleSheet, View } from 'react-native';

interface ScrollableScreenProps {
  children: ReactNode;
}

const ScrollableScreen: React.FC<ScrollableScreenProps> = ({ children }) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <SafeAreaView style={styles.innerBox}>
        <View style={styles.blueContainer}>{children}</View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    // margin: 10,               // Outer margin for scroll container
    // backgroundColor: 'purple',
    flexGrow: 1,
  },
  innerBox: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    // margin: 10,               
    // backgroundColor: 'red',
  },
  blueContainer: {
    flex: 1,                  // Fill the available space in the parent container
    alignSelf: 'stretch',            // Ensure the width matches the parent's width
    // margin: 10,               // Margin of 10 inside the innerBox
    // backgroundColor: 'blue',  // Blue background color
  },
});

export default ScrollableScreen;
