/* @flow */
import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors } from '../../common/AppColors';
import Button from '../../common/BlackButton';
import UserInput from '../../common/UserInput';
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { LOGIN } from '../../network/EndPoints';
import { login } from '../../network/PostDataPayloads';
import Helper from '../../utils/Helper.js';
import ProgressDialog from '../../utils/ProgressDialog';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class VenueResetPassword extends Component {
  static navigationOptions = {
    title: 'Reset Password',
  };

  constructor(props) {
    super(props);
    this.state = {
      loaderMessage: 'Wait..',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      isLoading: false,
    }
  }

  componentDidMount() {
    if (Helper.DEBUG === true) {
    }
  }

  showLoader(message) { this.setState({ isLoading: true, loaderMessage: message }) }
  hideLoader() { this.setState({ isLoading: false }) }

  async WelaLogin() {
    var message
    var error = false
    var {currentPassword, newPassword, confirmNewPassword, } = this.state
    var type = 1

    if (currentPassword.trim() == '') {
      message = 'Please enter Current Password!'
      error = true
    } else if (newPassword.trim() == '') {
      message = 'Please enter New Password'
      error = true
    } else if (newPassword !== confirmNewPassword) {
      error = true
      message = "Confirm New Password does not match"
    }

    if (error) {
      showToastMessage("Required", message)
    } else {
      this.showLoader("Logging..")
      // const PAYLOAD = await login(email, password, 1)
      // Helper.DEBUG_LOG(PAYLOAD)
      // await Helper.saveUserType(1)
      // PostRequest(LOGIN, PAYLOAD, true).then((jsonObject) => {
      //   this.hideLoader()
      //   if (jsonObject.success) {

      //     let userObject = jsonObject.apiResponse.data[0]

      //     Helper.venueProfiles = jsonObject.apiResponse.profile
      //     Helper.venueUserObject = userObject
      //     Helper.venueQueueDataOfCustomers = userObject.venue_type.queue

      //     this.props.navigation.navigate('VenueDashboard')
      //   }
      // })
      setTimeout(() => {
        this.hideLoader()
      }, 2000);
    }
  }

  render() {
    return (
      <Animated.View style={{
        flexGrow: 1, alignItems: 'flex-end',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end'
      }}>

        <KeyboardAwareScrollView
          style={{ backgroundColor: '#ffffff' }}
          resetScrollToCoords={{ x: 0, y: 0 }}
          contentContainerStyle={styles.container}
          scrollEnabled={true}>
          {this.state.isLoading ? <ProgressDialog title='Please wait' message={this.state.loaderMessage} /> : null}
          <Animated.View style={{
            flex: 1,
            flexDirection: 'column',
            flexGrow: 1,
            paddingBottom: 50,
            paddingTop: 50
          }}>
            <View style={{
              flex: 1,
              justifyContent: "center",
              alignContent: 'center',
              alignItems: "center",
              flexDirection: 'column'
            }}>
              <Animated.Image
                style={{ height: 50, width: 200 }}
                source={require('../images/logo.png')}
              />
              <Text style={{ fontFamily: 'Rubik-Light', color: colors.black, marginTop: 4 }}>Wait Conveniently</Text>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <UserInput
                placeholderTextColor={colors.black}
                secureTextEntry={true}
                placeholder="Current Password"
                autoCapitalize={'none'}
                returnKeyType={'next'}
                keyboardType='default'
                autoCorrect={false}
                value={this.state.currentPassword}
                onChangeText={(text) => this.setState({ currentPassword: text })}
              />

              <Text style={{ fontFamily: 'Rubik-Light', fontSize: 13, marginHorizontal: 20, marginVertical: 10, }}>
                Note: If you don't remember your current password, please contact the Wela Team
              </Text>

              <UserInput
                placeholderTextColor={colors.black}
                secureTextEntry={true}
                placeholder="New Password"
                keyboardType='default'
                returnKeyType={'done'}
                autoCapitalize={'none'}
                value={this.state.newPassword}
                autoCorrect={false}
                onChangeText={(text) => this.setState({ newPassword: text })}
              />

              <UserInput
                placeholderTextColor={colors.black}
                secureTextEntry={true}
                placeholder="Confirm New Password"
                keyboardType='default'
                returnKeyType={'done'}
                autoCapitalize={'none'}
                value={this.state.confirmNewPassword}
                autoCorrect={false}
                onChangeText={(text) => this.setState({ confirmNewPassword: text })}
              />

              <Button
                topMargin={10}
                onButtonPress={() => this.WelaLogin()}
                text={'Submit'}
              />
            </View>
          </Animated.View>
        </KeyboardAwareScrollView>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end'
  }, inputWrapper: {
    width: '100%',
    height: 40,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }, button: {
    width: DEVICE_WIDTH - 40,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    backgroundColor: colors.themeDark,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.4,
    borderColor: 'white',
    zIndex: 100,
  },
  text: {
    color: 'white',
    backgroundColor: 'transparent',
  }, textSignUp: {
    textAlign: 'right',
    marginHorizontal: 22,
    marginTop: 5,
    textDecorationLine: 'underline',
    color: 'white',
    backgroundColor: 'transparent',
  },
});
