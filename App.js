import React, { Component } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { Card } from 'react-native-shadow-cards';

export default class App extends Component {

  render() {
    return (

      <Card
        elevation={4}
        style={{ padding: 8, marginTop: 100,alignItems: 'center', alignSelf:'center'}}>

        <View style={styles.container}>

          <Image
            style={styles.tinyLogo}
            source={{
              uri: 'https://ae01.alicdn.com/kf/H68b7f3e40a294eaa804c17df4080146fl/1-32-high-simulation-Q8-Diecasts-Toy-Vehicles-Car-Model-With-Sound-Light-Collection-Car-Toys.jpg',
            }} />

          <Text style={styles.textTitle}>China Kids Car Electric Car Toy Car</Text>

          <Text style={styles.textDescription}>Audi Q5 Licensed Ride On Car With 2.4G Remote Control2.4G one to one remote control.
          Music, USB, SD card socket, MP3 port.Front with foldable pull handle, back with auxiliary wheels.Front with foldable pull handle, back with auxiliary wheels.
        </Text>

        </View>

      </Card>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
    flexDirection: 'column'
  }, textTitle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: 'Rubik-Light'
  }, textDescription: {
    color: '#000000',
    margin: 10,
    fontFamily: 'Rubik-Light'
  }, tinyLogo: {
    width:250,
    height: 200
  }

})
