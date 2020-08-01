/* @flow */
import React, { Component } from 'react';

import { StyleSheet, Dimensions, View, Text, Animated, Image } from 'react-native';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';
import { colors } from '../../common/AppColors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Helper from '../../utils/Helper.js'
import ProgressDialog from '../../utils/ProgressDialog';
import Geolocation from '@react-native-community/geolocation';
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { REGISTER } from '../../network/EndPoints';
import { register } from '../../network/PostDataPayloads';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            longitude: '',
            latitude: '',
            showPass: true,
            press: false,
            isLoading: false,
            name: '',
            email: '',
            phone: '',
            password: '',
            confirm_password: '',
            selectedType: '',
            userData: {}
        }
    }

    sendPermissions() {
        var config = {
            skipPermissionRequests: false,
            authorizationLevel: 'always'
        };
        Geolocation.setRNConfiguration(config);

        if (Platform.OS == 'android') {
            if (this.state.permissionGranted) {

            } else {
                this.requestCameraPermission()
            }
        } else {
            Geolocation.requestAuthorization()
        }
    }

    requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "WELA App Location Permission",
                    message:
                        "Wela app needs to get your location to find nearest venues for you.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                this.setState({ permissionGranted: true })
            } else {
                this.setState({ permissionGranted: false })
                this.requestCameraPermission()
            }
        } catch (err) {
            console.warn(err);
        }
    };

    WelaSignup() {
        var message
        var error = false

        const { name, email, password, confirm_password, phone } = this.state;

        if (name.trim() == '') {
            message = 'Please enter name!'
            error = true
        } else if (email.trim() == '') {
            message = 'Please enter email!'
            error = true
        } else if (!Helper.isValidEmail(email)) {
            message = 'Please enter valid email'
            error = true
        } else if (phone.trim() == '') {
            message = 'Please enter phone'
            error = true
        } else if (password.trim() == '') {
            message = 'Please enter password'
            error = true
        } else if (confirm_password.trim() == '') {
            message = 'Please enter confirm password'
            error = true
        } else if (password.trim() != confirm_password.trim()) {
            message = 'Confirm password does not matched.'
            error = true
        } else {
            error = false
            message = "success"
        }

        if (error) {
            showToastMessage("Required", message)
        } else {
            this.setState({ isLoading: true })
            const PAYLOAD = register(name, email, password, phone)
            PostRequest(REGISTER, PAYLOAD, true).then((jsonObject) => {
                this.setState({ isLoading: false })
                if (jsonObject.success) {
                    this.sendPermissions()
                    showToastMessage("Create Account", jsonObject.apiResponse.message)
                    this.props.navigation.navigate('VerifyOTP', { user: jsonObject.apiResponse })

                }
            })
        }
    }

    objToQueryString(obj) {
        const keyValuePairs = [];
        for (const key in obj) {
            keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
        return keyValuePairs.join('&');
    }

    updateUsername = (text) => {
        this.setState({ email: text })
    }

    updatePassword = (text) => {
        this.setState({ password: text })
    }

    showHorizontalLine() {
        return (
            <View style={{ flexDirection: 'row', width: '90%', alignSelf: 'center', marginTop: 10 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        height: 1,
                        backgroundColor: colors.midGray,
                        flex: 1,
                        alignSelf: 'center',
                    }}
                />
                <Text style={{ fontFamily: 'Rubik-Light', color: colors.black }}> OR </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        height: 1,
                        backgroundColor: colors.midGray,
                        flex: 1,
                        alignSelf: 'center'
                    }}
                />
            </View>
        )
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
                    {
                        this.state.isLoading ? <ProgressDialog title='Please wait' message='Creating account..' /> : null
                    }

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
                                placeholder="Your Name"
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
                                keyboardType='default'
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
                                onButtonPress={() => this.WelaSignup()}
                                text={'Sign Up'} />

                            {/* <Text style={{ fontFamily: 'Rubik-Light', alignSelf: 'center', marginTop: 20, marginBottom: 20 }}>NOT USING WELA? REGISTER NOW</Text> */}

                            {/* <Button
                                topMargin={10}
                                onPress={this.signIn}
                                text={'Venu Login'} /> */}
                        </View>



                    </Animated.View>
                </KeyboardAwareScrollView>


            </Animated.View >

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
