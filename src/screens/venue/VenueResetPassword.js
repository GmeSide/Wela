/* @flow */
import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors } from '../../common/AppColors';
import Button from '../../common/BlackButton';
import LoadingView from '../../common/LoadingView';
import UserInput from '../../common/UserInput';
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { CHANGE_PASSWORD } from '../../network/EndPoints';
import { changePassword } from '../../network/PostDataPayloads';
import Helper from '../../utils/Helper.js';
const DEVICE_WIDTH = Dimensions.get('window').width;

export default class VenueResetPassword extends Component {
  static navigationOptions = {
    title: 'Reset Password',
  };

  constructor(props) {
    super(props);
    this.state = {
      loaderMessage: 'Wait..',
      email: 'tony@nustechnology.com',
      currentPassword: '11111111',
      newPassword: '12345678',
      confirmNewPassword: '12345678',
      isLoading: false,
    }
  }

  componentDidMount() {
    if (Helper.DEBUG === true) {
    }
  }

  showLoader(message) { this.setState({ isLoading: true, loaderMessage: message }) }
  hideLoader() { this.setState({ isLoading: false }) }

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  async WelaLogin() {
    var error = false
    var { email, currentPassword, newPassword, confirmNewPassword, } = this.state

    if (!email || !currentPassword || !newPassword || !confirmNewPassword) {
      showToastMessage("Required", "Please fill all the fields.")
      error = true
      return
    }
    let validEmail = this.validateEmail(email)
    if (!validEmail) {
      showToastMessage("Error", "Please enter a valid email.")
      error = true
      return
    }
    let passMatch = (newPassword === confirmNewPassword)
    if (!passMatch) {
      showToastMessage("Error", "Passwords do not match.")
      error = true
      return
    }
    if (!error) {
      this.showLoader("Logging..")
      const PAYLOAD = await changePassword(email, currentPassword, newPassword, confirmNewPassword)
      PostRequest(CHANGE_PASSWORD, PAYLOAD, true).then((jsonObject) => {
        this.hideLoader()
        if (jsonObject.success) {
          showToastMessage('', jsonObject?.apiResponse?.message)
          this.props.navigation.navigate('VenueLogin')
        }
      })
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
                placeholder="Your Email"
                autoCapitalize={'none'}
                returnKeyType={'next'}
                keyboardType='email-address'
                autoCorrect={false}
                value={this.state.email}
                onChangeText={text => this.setState({ email: text })}
              />

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
        {this.state.isLoading ? <LoadingView message={this.state.loaderMessage} /> : null}
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
