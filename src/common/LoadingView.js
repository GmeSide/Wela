import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const LoadingView = (props) => {
  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={require('../../assets/wela2.gif')} />
        </View>
        <View style={styles.loadingContent}>
          <Text style={styles.message}>{props.message}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 99,
  },
  content: {
    padding: 25,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 10,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  image: {
    width: 50,
    height: 50
  },
  message: {
    fontSize: 12,
    fontFamily: 'Rubik-Light',
    color: 'black'
  },
  loadingContent: {
    fontSize: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  }
});

export default LoadingView;