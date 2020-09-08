import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Helper from '../utils/Helper.js';

export default class Splash extends Component {

  async componentDidMount() {
    let userLoggedIn = await Helper.isUserLoggedIn()
    let user = await Helper.getUser()
    let profile = await Helper.getProfile()
    if (userLoggedIn && user?.user_type === 1 && profile) {
      Helper.venueProfiles = profile
      Helper.venueUserObject = user
      Helper.venueQueueDataOfCustomers = user.venue_type.queue
      setTimeout(() => { this.props.navigation.navigate('VenueDashboard') }, 1000)
    } else if (userLoggedIn && user?.user_type === 2) {
      setTimeout(() => { this.props.navigation.navigate('Home') }, 1000)
    } else {
      setTimeout(() => { this.props.navigation.navigate('LoginOptions') }, 3000)
    }
  }


  render() {

    console.disableYellowBox = true
    return (
      <View style={splashstyle.splash_main_view}>
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignContent: 'center',
          alignItems: "center",
          flexDirection: 'column'
        }}>
          <Animated.Image
            style={{ height: 50, width: 200 }}
            source={require('./images/logo.png')}
          />
          <Text style={{ fontFamily: 'Rubik-Light', color: '#000000', marginTop: 4 }}>Wait Conveniently</Text>
        </View>
      </View>
    )
  }
}
const splashstyle = StyleSheet.create({
  splash_main_view: {
    width: "100%",
    height: '100%',
  },
  splash_background_image: {
    width: "100%",
    height: "100%",
    // opacity: 0.7,
    alignSelf: 'center'
  },

})
