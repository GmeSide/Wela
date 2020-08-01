import React, { Component } from 'react';

import {
    StyleSheet,
    Dimensions,
    View,
    Text,
    Animated,
    Image,
    Keyboard,
    TouchableOpacity,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import OTPTextView from '../../utils/OTPTextView';
import Button from '../../common/BlackButton';
import Helper from '../../utils/Helper.js'

import { colors } from '../../common/AppColors';
import ProgressDialog from '../../utils/ProgressDialog';
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { VERIFY_CODE, RESEND_CODE } from '../../network/EndPoints';
import { verifyCode, resendCode } from '../../network/PostDataPayloads';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class VerifyOTP extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userData: this.props.navigation.getParam('user', ''),
            isLoading: false,
            code: '',
            email: '',
            loaderMessage:'Verification'
        }

    }

    showLoader(message) { this.setState({ isLoading: true ,loaderMessage:message }) }
    hideLoader() { this.setState({ isLoading: false }) }


    onResenCode() {
        this.showLoader('Resending..')
        var email = this.state.userData.data.email
        const PAYLOAD = resendCode(email)
        PostRequest(RESEND_CODE, PAYLOAD).then((jsonObject) => {
            this.hideLoader()
            if (jsonObject.success) {
                showToastMessage("Resend Code", jsonObject.apiResponse.message)
            }
        })
    }

    onComplete() {
        Keyboard.dismiss()
        var message
        var error = false

        const { code } = this.state;
        var email = this.state.userData.data.email
        var codeDigits = code.length 
        
        console.log(codeDigits)
        if (codeDigits<6) {
            message = 'Verification code must be 6 digits.'
            error = true
        } else if (email.trim() == '') {
            message = 'Email is missing.'
            error = true
        } else {
            error = false
            message = "success"
        }

        if (error) {
            showToastMessage("Verification Code", message)
        } else {
            this.showLoader('Verification..')
            const PAYLOAD = verifyCode(email, code)
            PostRequest(VERIFY_CODE, PAYLOAD).then((jsonObject) => {
                this.hideLoader()
                if (jsonObject.success) {
                    Helper.saveUser(jsonObject.apiResponse.data[0])
                    showToastMessage("Verification Code", jsonObject.apiResponse.message)
                    this.props.navigation.navigate('Home')
                }
            })

        }


    }




    render() {
        return (
            <Animated.View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                alignContent: 'center'
            }}>
                <KeyboardAwareScrollView
                    style={{ backgroundColor: '#ffffff', }}
                    resetScrollToCoords={{ x: 0, y: 0 }}
                    contentContainerStyle={styles.container}
                    scrollEnabled={false}
                >
                    {
                        this.state.isLoading ? <ProgressDialog title='Please wait' message={this.state.loaderMessage}/> : null
                    }

                    <Animated.View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        paddingBottom: 40,
                        alignContent: 'center'
                    }}>

                        <View style={{
                            flex: 1, flexDirection: 'column', justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            alignContent: 'center'
                        }}>
                            <OTPTextView
                                containerStyle={styles.textInputContainer}
                                handleTextChange={picCode => this.setState({ code: picCode })}
                                onComplete={userEnteredPinCode => console.log('complete')}
                                textInputStyle={styles.roundedTextInput}
                                inputCount={6}
                                keyboardType='default'
                            />

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    alignContent: 'center',
                                    marginTop: 40
                                }}>
                                <Text style={{ color: colors.black }}>Enter your verification code</Text>
                                <TouchableOpacity
                                    style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        alignContent: 'center',
                                    }}
                                    onPress={() => this.onResenCode()}
                                >


                                    <Text style={{
                                        color: colors.black,
                                        fontWeight: 'bold',
                                        marginLeft: 5,
                                        textDecorationLine: 'underline',
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end',
                                        alignSelf: 'flex-end',
                                        alignContent: 'flex-end',

                                    }}>Resend</Text>

                                </TouchableOpacity>

                            </View>
                        </View>

                        <Button
                            background={colors.black}
                            onButtonPress={() => this.onComplete()}
                            text={'Register'} />

                    </Animated.View>


                </KeyboardAwareScrollView>


            </Animated.View >

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        alignContent: 'center'
    }, textInputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        alignContent: 'center'
    },
    roundedTextInput: {
        borderBottomColor: colors.black,
        borderBottomWidth: 4,
        width: 40,
        color: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        alignContent: 'center'
    }
});
