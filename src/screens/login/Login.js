/* @flow */
import appleAuth, { AppleAuthError, AppleAuthRealUserStatus, AppleAuthRequestOperation, AppleAuthRequestScope } from '@invertase/react-native-apple-authentication';
import Geolocation from '@react-native-community/geolocation';
import { GoogleSignin } from '@react-native-community/google-signin';
import auth from '@react-native-firebase/auth';
import React, { Component } from 'react';
import { Animated, Dimensions, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors } from '../../common/AppColors';
import Button from '../../common/BlackButton';
import ImageButton from '../../common/ImageButton';
import UserInput from '../../common/UserInput';
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { GET_FAVOURITE, GET_USER_WAITING_LIST, LOGIN, SOCIAL_LOGIN } from '../../network/EndPoints';
import { getAllFavourite, getUserWaitingListWithHistory, login, socialLogin } from '../../network/PostDataPayloads';
import Helper from '../../utils/Helper.js';
import ProgressDialog from '../../utils/ProgressDialog';


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
        this.authCredentialListener = null;
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
            isFavouritesFetched: false,
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
            this.setState({ email: 'abc@gmail.com', password: 'pass1234' })
        }

        // Apple SignIn
        this.authCredentialListener = appleAuth.onCredentialRevoked(async () => {
          console.warn('Credential Revoked');
        })

    }

    componentWillUnmount() {
      if (this.authCredentialListener) {
        this.authCredentialListener();
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

    async onSignIn(user, social_type) {
      if (user) {
        const { email, id, name, phone, picUrl } = user
        if (!email || email.trim() == '') {
          showToastMessage("Login", "Email not found")
        } else {
          this.showLoader("Logging..")
          const PAYLOAD = await socialLogin(email, social_type, id, name, phone, picUrl)
          Helper.DEBUG_LOG(PAYLOAD)
          PostRequest(SOCIAL_LOGIN, PAYLOAD, true).then((jsonObject) => {
            this.hideLoader()
            if (jsonObject.success) {
                this.sendPermissions()
                var user = jsonObject.apiResponse.data[0]
                Helper.saveUser(user)
                this.props.navigation.navigate('Home')
            } else {
              showToastMessage("Login", "Login fail. Please try again")
            }
          })
        }
      }
    }

    async onGoogleSignIn() {
        try {
            await GoogleSignin.hasPlayServices();
            console.log("reached google sign in");
            //const info = await GoogleSignin.signIn();
            const userInfo = await this.onGoogleButtonPress();
            console.log('onGoogleSignIn UserInfo ', userInfo);
            const _user = userInfo.user

            let social_type = 2
            let user = {
              email: _user.email ? _user.email : '',
              id: _user.uid ? _user.uid : '',
              name: _user.displayName ? _user.displayName : '',
              phone: _user.phoneNumber ? _user.phoneNumber : '',
              picUrl: userInfo.additionalUserInfo.profile.picture,
            }

            this.onSignIn(user, social_type)
        } catch (error) {
            Helper.DEBUG_LOG(error)
            console.log('onGoogleSignIn Error ', error);
        }
    }

    async onFacebookLogin() {
      try {
        let fbData = await onFacebookButtonPress()
        let profile = fbData.additionalUserInfo.profile
        let userInfo = fbData.user

        let social_type = 1
        let user = {
          email: userInfo.email ? userInfo.email : '',
          id: profile.id ? profile.id : '',
          name: profile.name ? profile.name : '',
          phone: userInfo.phoneNumber ? userInfo.phoneNumber : '',
          picUrl: userInfo.photoURL ? userInfo.photoURL : "",
        }

        this.onSignIn(user, social_type)

      } catch (error) {
        let msg = 'An account already exists with the same email address but different sign-in credentials.'+
        ' Sign in using a provider associated with this email address.'
        showToastMessage("Firebase Duplicate Record.", msg)
        console.log('ERROR onFacebookLogin: ', error);
      }
    }

    async onAppleSignIn() {
      try {
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: AppleAuthRequestOperation.LOGIN,
          requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME ]
        })

        console.log('appleAuthRequestResponse', appleAuthRequestResponse);

        const {
          user,
          email,
          fullName,
          phoneNumber,
          photoURL,
        } = appleAuthRequestResponse;

        let social_type = 3
        let fullNames = []
        if (fullName.givenName != null) {
          fullNames.push(fullName.givenName)
        }
        if (fullName.middleName != null) {
          fullNames.push(fullName.middleName)
        }
        if (fullName.familyName != null) {
          fullNames.push(fullName.familyName)
        }
        const name = fullNames.join(' ')
        let userInfo = {
          email: email ? email : '',
          id: user ? user : '',
          name: name,
          phone: phoneNumber ? phoneNumber : '',
          picUrl: photoURL ? photoURL : "",
        }

        this.onSignIn(userInfo, social_type)
      } catch (error) {
        if (error.code === AppleAuthError.CANCELED) {
          console.warn('User canceled Apple Sign in.');
        } else {
          console.error(error);
        }
      }
    };

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

                            {appleAuth.isSupported && <ImageButton
                                image={imageApple}
                                imageStyle={style = { width: 22, height: 22, alignSelf: 'center', marginRight: 10 }}
                                textColor={colors.white}
                                background={colors.black}
                                topMargin={10}
                                onButtonPress={() => this.onAppleSignIn()}
                                text={'Sign in with Apple'} />}

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
