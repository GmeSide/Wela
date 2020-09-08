/* @flow */
import React, { Component } from 'react';
import { StyleSheet, Dimensions, View, Text, Animated, Image, BackHandler } from 'react-native';
import Button from '../../common/BlackButton';
import { colors } from '../../common/AppColors';

export default class LoginOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        }
        this.props.navigation.addListener('willFocus', this.componentWillFocus)
        this.props.navigation.addListener('willBlur', this.componentwillBlur)
    }

    componentWillFocus = () => {
      console.log('LoginOptions FOCUSED');
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentwillBlur = () => {
      console.log('LoginOptions BLURRED');
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton)
    }

    componentDidMount() {}

    handleBackButton = () => {
        console.log('handleBackButton IN.');
        BackHandler.exitApp();
    }

    resendCodePayload() {
        return resendCode("majid.khuhro@gmail.com")
    }

    onLogin() {
        //alert('Test')
        this.props.navigation.navigate('Login')
    }

    onLoginBusiness() {
        this.props.navigation.navigate('VenueLogin')
    }

    render() {
        return (
            <Animated.View style={{
                flexGrow: 1, alignContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
            }}>
                <Animated.View style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center',
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
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        justifyContent: 'center'
                    }}>
                        <Button
                            topMargin={10}
                            onButtonPress={() => this.onLogin()}
                            text={'Login'} />
                        <View style={{
                            alignSelf: 'center',
                            flexDirection: 'row',
                            marginTop: 10,
                            width: '85%'
                        }}>
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
                        <Button
                            topMargin={10}
                            onButtonPress={() => this.onLoginBusiness()}
                            text={'Business Login'} />
                    </View>



                </Animated.View>


            </Animated.View >

        );
    }
}

const DEVICE_WIDTH = Dimensions.get('window').width;
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
