/* @flow */
import React, { Component } from 'react';

import {
    StyleSheet,
    Dimensions,
    View,
    Text,
    Animated,
    Image,
    TouchableOpacity,
    Platform,
    PermissionsAndroid
} from 'react-native';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';
import ImageButton from '../../common/ImageButton';
import { colors } from '../../common/AppColors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import auth from '@react-native-firebase/auth';
import { GoogleSignin, GoogleSigninButton } from '@react-native-community/google-signin';
import Helper from '../../utils/Helper.js'
import Geolocation from '@react-native-community/geolocation';
import ProgressDialog from '../../utils/ProgressDialog';

import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { LOGIN, GET_FAVOURITE, GET_USER_WAITING_LIST, SOCIAL_LOGIN } from '../../network/EndPoints';
import { login, getAllFavourite, getUserWaitingListWithHistory, socialLogin } from '../../network/PostDataPayloads';

import { LoginManager, AccessToken, LoginButton } from 'react-native-fbsdk';

var imageGoogle = require('../images/ic_google.png')
var imageApple = require('../images/ic_apple.png')

const DEVICE_WIDTH = Dimensions.get('window').width;

async function onFacebookButtonPress() {
    // Attempt login with permissions
    if (AccessToken.getCurrentAccessToken() != null) {
      LoginManager.logOut();
    }
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
        throw 'User cancelled the login process';
    }

    // Once signed in, get the users AccesToken
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
        throw 'Something went wrong obtaining access token';
    }

    console.log('FB data: ', data);

    // Create a Firebase credential with the AccessToken
    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(facebookCredential);
}

export default class Login extends Component {
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

    async componentDidMount() {
        GoogleSignin.configure(
            {
                offlineAccess: true,
                webClientId: '112823672001-hteml445dba7e3b1us6n3ljg0m5sc526.apps.googleusercontent.com',
                // androidClientId: '112823672001-eoe92h5p85ukl896fi557f0e471tkr82.apps.googleusercontent.com',
                // iosClientId: '112823672001-tg0ock0hqhl599ev3140u07abo9k33v6.apps.googleusercontent.com',
                scopes: ['profile', 'email']
            });
        if (Helper.DEBUG === true) {
            this.setState({ email: 'm@gnt.com', password: 'we123' })
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

    async onGoogleSignIn() {
        try {
            await GoogleSignin.hasPlayServices();
            console.log("reached google sign in");
            //const info = await GoogleSignin.signIn();
            const userInfo = await this.onGoogleButtonPress();
            console.log('userInfo.additionalUserInfo: ', userInfo.additionalUserInfo.profile.picture);
            let user = userInfo.user
            let picUrl = userInfo.additionalUserInfo.profile.picture
            var email = ""
            var social_type = 2
            var id = ""
            var name = ""
            var phone = ""

            if (user) {
                if (user.displayName) {
                    name = user.displayName
                }
                if (user.email) {
                    email = user.email
                }
                if (user.phoneNumber) {
                    phone = user.phoneNumber
                }
                if (user.uid) {
                    id = user.uid
                }

                if (email.trim() == '') {
                    showToastMessage("Login", "Email not found")
                } else {
                    this.showLoader("Logging..")
                    const PAYLOAD = await socialLogin(email, social_type, id, name, phone, picUrl)
                    Helper.DEBUG_LOG(PAYLOAD)
                    PostRequest(SOCIAL_LOGIN, PAYLOAD,true).then((jsonObject) => {
                        this.hideLoader()
                        if (jsonObject.success) {
                            this.sendPermissions()
                            var user = jsonObject.apiResponse.data[0]
                            Helper.saveUser(user)
                            this.props.navigation.navigate('Home')
                            //this.fetchFavourites(jsonObject.apiResponse.data[0])
                        }
                    })
                }
            }
            // Helper.DEBUG_LOG(userInfo)
        } catch (error) {
            Helper.DEBUG_LOG(error)
            console.log('onGoogleSignIn: ', error);
            // if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            //     console.log("error occured SIGN_IN_CANCELLED");
            //     // user cancelled the login flow
            // } else if (error.code === statusCodes.IN_PROGRESS) {
            //     console.log("error occured IN_PROGRESS");
            //     // operation (f.e. sign in) is in progress already
            // } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            //     console.log("error occured PLAY_SERVICES_NOT_AVAILABLE");
            // } else {
            //     console.log(error)
            //     console.log("error occured unknow error");
            // }
        }
    }

    async onFacebookLogin() {
      try {
        let fbData = await onFacebookButtonPress()
        let profile = fbData.additionalUserInfo.profile
        let user = fbData.user

        let email = user.email? user.email : ""
        let social_type = 2
        let id = profile.id? profile.id : ""
        let name = profile.name? profile.name : ""
        let phone = user.phoneNumber? user.phoneNumber : ""
        let picUrl = user.photoURL? user.photoURL : ""

        if (user) {
          this.showLoader("Logging..")
          const PAYLOAD = await socialLogin(email, social_type, id, name, phone, picUrl)
          PostRequest(SOCIAL_LOGIN, PAYLOAD,true).then((jsonObject) => {
              this.hideLoader()
              if (jsonObject.success) {
                  this.sendPermissions()
                  var user = jsonObject.apiResponse.data[0]
                  Helper.saveUser(user)
                  this.props.navigation.navigate('Home')
              }
          })
        }
      } catch (error) {
        let msg = 'An account already exists with the same email address but different sign-in credentials.'+
        ' Sign in using a provider associated with this email address.'
        showToastMessage("Firebase Duplicate Record.", msg)
        console.log('ERROR onFacebookLogin: ', error);
      }
    }

    async onGoogleButtonPress() {
        // Get the users ID token
        const { idToken } = await GoogleSignin.signIn();
        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        // Sign-in the user with the credential
        return auth().signInWithCredential(googleCredential);
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
        var type = 2

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
            const PAYLOAD = await login(email, password, 2)
            Helper.DEBUG_LOG(PAYLOAD)
            PostRequest(LOGIN, PAYLOAD, true).then((jsonObject) => {
                this.hideLoader()
                if (jsonObject.success) {
                    this.fetchFavourites(jsonObject.apiResponse.data[0])
                }
            })
        }
    }

    async fetchFavourites(user) {
        await Helper.saveUserType(2)
        this.showLoader("Fetching..")
        const PAYLOAD = await getAllFavourite(user.id)
        PostRequest(GET_FAVOURITE, PAYLOAD).then((jsonObject) => {
            // this.hideLoader()
            if (jsonObject.success) {
                Helper.updateFavoritesList(jsonObject.apiResponse.data)
            }
            this.fetchUserQues(user)
            // Helper.saveUser(user)
            // this.props.navigation.navigate('Home')
            // this.setState({ isFavouritesFetched: true })
        })
    }

    async fetchUserQues(user) {
        //this.showLoader("Fetching..")
        const PAYLOAD = await getUserWaitingListWithHistory(user.id)
        PostRequest(GET_USER_WAITING_LIST, PAYLOAD).then((jsonObject) => {
            this.hideLoader()
            if (jsonObject.success) {
                Helper.DEBUG_LOG(jsonObject.apiResponse)
                Helper.updateUserQueList(jsonObject.apiResponse)
            }

            Helper.saveUser(user)
            this.props.navigation.navigate('Home')
            this.setState({ isFavouritesFetched: true })
        })
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
                        <View style={{
                            flexDirection: 'column',
                        }}>

                            <Button
                                background={'#4267B2'}
                                topMargin={10}
                                onButtonPress={() => this.onFacebookLogin()}
                                text={'Sign in with Facebook'}
                            />

                            <ImageButton
                                image={imageGoogle}
                                imageStyle={style = { width: 22, height: 22, alignSelf: 'center', marginRight: 10 }}
                                textColor={colors.black}
                                background={colors.input_box_grey}
                                topMargin={10}
                                onButtonPress={() => this.onGoogleSignIn()}
                                text={'Sign in with Google'} />

                            {/* <ImageButton
                                image={imageApple}
                                imageStyle={style = { width: 22, height: 22, alignSelf: 'center', marginRight: 10 }}
                                textColor={colors.white}
                                background={colors.black}
                                topMargin={10}
                                onButtonPress={this.signIn}
                                text={'Sign in with Apple'} /> */}

                            {this.showHorizontalLine()}

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
                                text={'Login'} />

                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate('SignUp')}
                            >

                                <Text style={{ fontFamily: 'Rubik-Light', alignSelf: 'center', marginTop: 20, marginBottom: 20 }}>NOT USING WELA? REGISTER NOW</Text>
                            </TouchableOpacity>
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
