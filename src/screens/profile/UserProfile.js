/* @flow */
import React, { Component } from 'react';

import { StyleSheet, Dimensions, View, Text, Animated, Image, ScrollView,
  TouchableOpacity, Platform, BackHandler } from 'react-native';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';
import { colors } from '../../common/AppColors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Helper from '../../utils/Helper.js'
import ImagePicker from 'react-native-image-picker';
import {check, request, requestMultiple, PERMISSIONS, RESULTS} from 'react-native-permissions';
import { LoginManager, AccessToken } from 'react-native-fbsdk';

import ProgressDialog from '../../utils/ProgressDialog';

import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { UPDATE_PROFILE } from '../../network/EndPoints';
import { updateProfile } from '../../network/PostDataPayloads';

const DEVICE_WIDTH = Dimensions.get('window').width;

const options = {
  title: 'Select Your Profile Pic',
  customButtons: [],
  storageOptions: { privateDirectory: true }
};

export default class UserProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            longitude: '',
            latitude: '',
            showPass: true,
            press: false,
            isLoading: false,
            name: '',
            email: '',
            phone: '',
            password: '',
            selectedType: '',
            waitingListSize: 0,
            profile_picture: ''
        }
        this.props.navigation.addListener('willFocus', this.componentWillFocus)
    }

    componentWillFocus = async () => {
      if (Helper.userQueList.data) {
        this.setState({waitingListSize: Helper.userQueList.data.length, profile_picture: ''})
      }
      await this.fetchData()
    }

    componentDidMount = async () => {
      try {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
        if (Platform.OS === 'android') {
          requestMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]).then(
            (statuses) => {
              console.log('Camera', statuses[PERMISSIONS.ANDROID.CAMERA]);
              console.log('Storage', statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]);
            },
          );

          check(PERMISSIONS.ANDROID.CAMERA)
          .then((result) => {
            switch (result) {
              case RESULTS.UNAVAILABLE:
                console.log('This feature is not available (on this device / in this context)');
                break;
              case RESULTS.DENIED:
                console.log('The permission has not been requested / is denied but requestable');
                request(PERMISSIONS.ANDROID.CAMERA).then((result) => {
                  console.log('Camera', result);
                });
                break;
              case RESULTS.GRANTED:
                console.log('The permission is granted');
                break;
              case RESULTS.BLOCKED:
                console.log('The permission is denied and not requestable anymore');
                break;
            }
          })
          .catch((error) => {
            console.log('ERROR Camera: ', error);
          });
          check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
          .then((result) => {
            switch (result) {
              case RESULTS.UNAVAILABLE:
                console.log('This feature is not available (on this device / in this context)');
                break;
              case RESULTS.DENIED:
                console.log('The permission has not been requested / is denied but requestable');
                request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then((result) => {
                  console.log('Storage', result);
                });
                break;
              case RESULTS.GRANTED:
                console.log('The permission is granted');
                break;
              case RESULTS.BLOCKED:
                console.log('The permission is denied and not requestable anymore');
                break;
            }
          })
          .catch((error) => {
            console.log('ERROR Storage: ', error);
          });
        }
      }catch (e) {
          console.log('Error UserProfile: ', e);
      }
    }

    handleBackButton() {
      console.log('handleBackButton IN.');
        BackHandler.exitApp();
    }

    async onSignout() {
        await Helper.clearAsyncStorage()
        if (AccessToken.getCurrentAccessToken() != null) {
          LoginManager.logOut();
        }
        this.props.navigation.popToTop();
        this.props.navigation.navigate('Login')
    }

    async updateProfile() {
        var message
        var error = false
        var name = this.state.name
        var phone = this.state.phone
        if (!phone) {
            phone = ""
        }

        if (name.trim() == '') {
            message = 'Please enter name!'
            error = true
        } else if (phone.trim() == '') {
            message = 'Please enter phone'
            error = true
        } else {
            error = false
            message = "success"
        }
        if (error) {
            showToastMessage("Required", message)
        } else {
            this.setState({ isLoading: true })
            const PAYLOAD = await updateProfile(name, phone, this.state.profile_picture)
            console.log(PAYLOAD);
            PostRequest(UPDATE_PROFILE, PAYLOAD).then((jsonObject) => {
                this.setState({ isLoading: false })
                if (jsonObject.success) {
                    showToastMessage("Update Account", jsonObject.apiResponse.message)
                    Helper.saveUser(jsonObject.apiResponse.data)
                    // this.setState({profile_picture: jsonObject.apiResponse.data.url})
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
        this.setState({ name: text })
    }

    async fetchData() {
        let user = await Helper.getUser()
        console.log('user: ', user);
        this.setState({
            user: user,
            name: user.name,
            email: user.email,
            phone: user.phone
        })
        // Helper.DEBUG_LOG(user)
    }

    updateUsername = (text) => {
        this.setState({ name: text })
    }

    updatePhone = (text) => {
        this.setState({ phone: text })
    }

    getpic = () => {
      ImagePicker.showImagePicker(options, (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          const source = { uri: response.uri };

          // You can also display the image using data:
          // const source = { uri: 'data:image/jpeg;base64,' + response.data };
          this.setState({ profile_picture: response.data });
        }
      });
    }

    render() {
        return (
            <View style={{flex: 1}}>
            {
                this.state.isLoading ? <ProgressDialog title='Please wait' message='Updating account..' /> : null
            }

                <ScrollView
                    style={{ flex: 1, backgroundColor: 'white', }}
                    keyboardShouldPersistTaps='handled'
                >
                        <View style={{
                            flex: 1,
                            justifyContent: "center",
                            alignContent: 'center',
                            alignItems: "center",
                            flexDirection: 'column',
                            paddingTop: 50
                        }}>
                            <View style={{alignItems: 'center'}}>
                              <Image
                                source={this.state.profile_picture? { uri: 'data:image/jpeg;base64,' + this.state.profile_picture } : (this.state.user.url?{ uri: this.state.user.url }:require('../images/user_placeholder.png'))}
                                defaultSource={require('../../../assets/user_load.png')}
                                style={{
                                  height: 200,
                                  width: 200,
                                  borderRadius: Platform.OS === 'ios' ? 200 / 2 : 200,
                                  backgroundColor: 'white',
                                  borderColor: 'white'
                                }}
                              />
                              <TouchableOpacity onPress={() => this.getpic()} style={{position:'absolute', zIndex:10, bottom: 20, right: 20}}>
                                <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}>
                                  <Image
                                    source={require('../images/camera.png')}
                                    style={{
                                      backgroundColor: 'white',
                                      height: 20,
                                      width: 20,
                                    }}
                                  />
                                </View>
                              </TouchableOpacity>
                            </View>

                            <Text style={{ fontFamily: 'Rubik-Light', color: colors.black, marginTop: 10, fontSize: 22, fontWeight: 'bold' }}>
                                {this.state.name}
                            </Text>
                            <Text style={{ fontFamily: 'Rubik-Light', color: colors.darkGray, marginTop: 10 }}>
                                {this.state.waitingListSize?
                                  "You are currently in line in "+this.state.waitingListSize+(this.state.waitingListSize>1?" waitinglists":" waitinglist")
                                  :
                                  "You are currently not in line"
                                }
                            </Text>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'column', paddingTop: 35 }}>
                            <UserInput
                                placeholderTextColor={colors.black}
                                placeholder="Name"
                                autoCapitalize={'none'}
                                returnKeyType={'next'}
                                keyboardType='default'
                                autoCorrect={false}
                                value={this.state.name}
                                onChangeText={this.updateUsername}
                                editable={true}
                            />
                            <UserInput
                                placeholderTextColor={colors.black}
                                placeholder="Email"
                                autoCapitalize={'none'}
                                returnKeyType={'next'}
                                keyboardType='email-address'
                                autoCorrect={false}
                                value={this.state.email}
                                editable={false}
                            />
                            <UserInput
                                placeholderTextColor={colors.black}
                                onChangeText={this.updatePhone}
                                secureTextEntry={false}
                                placeholder="Phone Number"
                                keyboardType='number-pad'
                                returnKeyType={'done'}
                                autoCapitalize={'none'}
                                value={this.state.phone}
                                autoCorrect={false}
                                editable={true}
                            />

                            <Button
                                topMargin={10}
                                onButtonPress={() => this.updateProfile()}
                                text={'Update Profile'} />

                            <Button
                                topMargin={10}
                                onButtonPress={() => this.onSignout()}
                                text={'Sign Out'} />

                        </View>
                </ScrollView>
            </View >
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
