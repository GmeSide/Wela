/* @flow */
import React, { Component } from 'react';

import { StyleSheet, Dimensions, View, Text, Animated, Image, TouchableOpacity } from 'react-native';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';
import { colors } from '../../common/AppColors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import Helper from '../../utils/Helper.js'
import ProgressDialog from '../../utils/ProgressDialog';

import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { LOGIN } from '../../network/EndPoints';
import { login } from '../../network/PostDataPayloads';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class VenueLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaderMessage: 'Wait..',
            longitude: '',
            latitude: '',
            showPass: true,
            press: false,
            isLoading: false,
            email: '',
            password: '',
            selectedType: '',
            isFavouritesFetched: false
        }
    }

    componentDidMount() {
        if (Helper.DEBUG === true) {
           // this.setState({ email: 'elvyflo@gmail.com', password: 'pass1234' })
            this.setState({ email: 'maddog@gmail.com', password: 'pass1234' })
            // this.setState({ email: 'roostercoffee@gmail.com', password: 'pass1234' })
            // this.setState({ email: 'wynona@gmail.com', password: 'pass1234' })
        }
    }

    showLoader(message) { this.setState({ isLoading: true, loaderMessage: message }) }
    hideLoader() { this.setState({ isLoading: false }) }

    async WelaLogin() {
        var message
        var error = false
        var email = this.state.email
        var password = this.state.password
        // var email = "majid.khuhro@gmail.com"
        // var password = "we123"
        var type = 1

        if (email.trim() == '') {
            message = 'Please enter email!'
            error = true
        } else if (!Helper.isValidEmail(email)) {
            message = 'Please enter valid email'
            error = true
        } else if (password.trim() == '') {
            message = 'Please enter password'
            error = true
        } else {
            error = false
            message = "success"
        }

        if (error) {
            showToastMessage("Required", message)
        } else {
            this.showLoader("Logging..")
            const PAYLOAD = await login(email, password,1)
            Helper.DEBUG_LOG(PAYLOAD)
            await Helper.saveUserType(1)
            PostRequest(LOGIN, PAYLOAD, true).then((jsonObject) => {
                this.hideLoader()
                if (jsonObject.success) {

                    let userObject = jsonObject.apiResponse.data[0]

                    Helper.venueProfiles = jsonObject.apiResponse.profile
                    Helper.venueUserObject = userObject
                    Helper.venueQueueDataOfCustomers = userObject.venue_type.queue

                    this.props.navigation.navigate('VenueDashboard')
                }
            })
        }
    }

    updateUsername = (text) => {
        this.setState({ email: text })
    }

    updatePassword = (text) => {
        this.setState({ password: text })
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
                    scrollEnabled={true}
                >

                    {
                        this.state.isLoading ? <ProgressDialog title='Please wait' message={this.state.loaderMessage} /> : null
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
                        <View style={{ flexDirection: 'column' }}>

                            <UserInput
                                placeholderTextColor={colors.black}
                                placeholder="Login email"
                                autoCapitalize={'none'}
                                returnKeyType={'next'}
                                keyboardType='email-address'
                                autoCorrect={false}
                                value={this.state.email}
                                onChangeText={this.updateUsername}
                            />

                            <UserInput
                                placeholderTextColor={colors.black}
                                secureTextEntry={true}
                                placeholder="Password"
                                keyboardType='default'
                                returnKeyType={'done'}
                                autoCapitalize={'none'}
                                value={this.state.password}
                                autoCorrect={false}
                                onChangeText={this.updatePassword}
                            />

                            <Button
                                topMargin={10}
                                onButtonPress={() => this.WelaLogin()}
                                text={'Login'}
                            />

                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate('VenueSignUp')}
                                style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 }}
                            >
                                <Text style={{fontFamily: 'Rubik-Light'}}>NOT USING WELA? </Text>
                                <Text style={{ fontFamily: 'Rubik-Light', borderBottomWidth: 1 }}>REGISTER NOW</Text>
                            </TouchableOpacity>
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
