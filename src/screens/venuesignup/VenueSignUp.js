/* @flow */
import React, { Component } from 'react';

import { StyleSheet, Dimensions, View, Text, Animated, Image } from 'react-native';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';
import { colors } from '../../common/AppColors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { showToastMessage } from '../../network/ApiRequest.js';
import Helper from '../../utils/Helper.js'

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class VenueSignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirm_password: '',
        }
    }

    validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    handleSignUp = () => {
      // this.props.navigation.navigate('VenueSetUp')
      let error = false
      if (!this.state.name || !this.state.email || !this.state.phone || !this.state.password || !this.state.confirm_password) {
        showToastMessage("Required", "Please fill all the fields.")
        error = true
      }
      let validEmail = this.validateEmail(this.state.email)
      if (!validEmail) {
        showToastMessage("Error", "Please enter a valid email.")
        error = true
      }
      let passMatch = (this.state.password === this.state.confirm_password)
      if (!passMatch) {
        showToastMessage("Error", "Passwords do not match.")
        error = true
      }
      if (!error) {
        Helper.VenueSignUp = this.state
        this.props.navigation.navigate('VenueSetUp')
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
                    scrollEnabled={false}
                >

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
                            <Text style={{ fontFamily: 'Rubik-Light', color: colors.black, marginTop: 4 }}>
                                Wait Conveniently
                            </Text>

                        </View>
                        <View style={{
                            flexDirection: 'column',
                        }}>


                            <UserInput
                                placeholderTextColor={colors.black}
                                placeholder="Business Name"
                                autoCapitalize={'none'}
                                returnKeyType={'next'}
                                keyboardType='email-address'
                                autoCorrect={false}
                                value={this.state.name}
                                onChangeText={text => this.setState({ name: text })}
                            />

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
                                secureTextEntry={false}
                                placeholder="Phone Number"
                                keyboardType='number-pad'
                                returnKeyType={'done'}
                                autoCapitalize={'none'}
                                value={this.state.phone}
                                autoCorrect={false}
                                onChangeText={text => this.setState({ phone: text })}
                            />
                            <UserInput
                                placeholderTextColor={colors.black}
                                secureTextEntry={true}
                                placeholder="Password"
                                keyboardType='default'
                                returnKeyType={'done'}
                                autoCapitalize={'none'}
                                value={this.state.password}
                                blurOnSubmit={false}
                                onSubmitEditing={() => Keyboard.dismiss()}
                                autoCorrect={false}
                                onChangeText={text => this.setState({ password: text })}
                            />

                            <UserInput
                                placeholderTextColor={colors.black}
                                secureTextEntry={true}
                                placeholder="Confirm Password"
                                keyboardType='default'
                                returnKeyType={'done'}
                                autoCapitalize={'none'}
                                value={this.state.confirm_password}
                                blurOnSubmit={false}
                                onSubmitEditing={() => Keyboard.dismiss()}
                                autoCorrect={false}
                                onChangeText={text => this.setState({ confirm_password: text })}
                            />

                            <Button
                                topMargin={10}
                                onButtonPress={() => this.handleSignUp()}
                                text={'Next'}
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
    }
});
