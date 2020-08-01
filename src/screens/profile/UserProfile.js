import React, { Component } from 'react';

import {
    StyleSheet,
    Dimensions,
    View,
    Text,
    Animated,
    Image,
} from 'react-native';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';
import { colors } from '../../common/AppColors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { NavigationEvents } from "react-navigation";
import Helper from '../../utils/Helper.js'

import ProgressDialog from '../../utils/ProgressDialog';

import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { UPDATE_PROFILE } from '../../network/EndPoints';
import { updateProfile } from '../../network/PostDataPayloads';

const DEVICE_WIDTH = Dimensions.get('window').width;

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
            selectedType: ''
        }

    }
    async onSignout() {
        await Helper.clearAsyncStorage()
        this.props.navigation.popToTop();
        this.props.navigation.navigate('LoginOptions')
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
            const PAYLOAD = await updateProfile(name, phone)
            PostRequest(UPDATE_PROFILE, PAYLOAD).then((jsonObject) => {
                this.setState({ isLoading: false })
                if (jsonObject.success) {
                    showToastMessage("Update Account", jsonObject.apiResponse.message)
                    Helper.saveUser(jsonObject.apiResponse.data[0])
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
    updatePassword = (text) => {
        this.setState({ phone: text })
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
                <Text style={{ color: colors.black }}> OR </Text>
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
    async fetchData() {
        let user = await Helper.getUser()
        this.setState({
            user: user,
            name: user.name,
            email: user.email,
            phone: user.phone
        })

        Helper.DEBUG_LOG(user)
    }
    updateUsername = (text) => {
        this.setState({ name: text })
    }
    updatePhone = (text) => {
        this.setState({ phone: text })
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
                        {
                            this.state.isLoading ? <ProgressDialog title='Please wait' message='Updating account..' /> : null
                        }

                        <View style={{
                            flex: 1,
                            justifyContent: "center",
                            alignContent: 'center',
                            alignItems: "center",
                            flexDirection: 'column'
                        }}>
                            <View style={{
                                height: 200,
                                width: 200,
                                backgroundColor: colors.input_box_grey,
                                borderRadius: Platform.OS === 'ios' ? 200 / 2 : 200
                            }}>
                                <Image
                                    source={{ uri: this.state.user.picture }}
                                    style={{
                                        height: 200,
                                        width: 200,
                                        borderRadius: Platform.OS === 'ios' ? 200 / 2 : 200
                                    }}
                                />
                            </View>

                            <Text style={{ color: colors.black, marginTop: 10, fontSize: 22, fontWeight: 'bold' }}>
                                {this.state.name}
                            </Text>
                            <Text style={{ color: colors.darkGray, marginTop: 10 }}>
                                You are currently not in line
                        </Text>
                        </View>
                        <View style={{
                            flexDirection: 'column',
                        }}>


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
                                placeholder="my"
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
                                keyboardType='default'
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

                            {/* <Text style={{ alignSelf: 'center', marginTop: 20, marginBottom: 20 }}>NOT USING WELA? REGISTER NOW</Text> */}

                            {/* <Button
                                topMargin={10}
                                onPress={this.signIn}
                                text={'Venu Login'} /> */}
                        </View>



                    </Animated.View>
                </KeyboardAwareScrollView>

                <NavigationEvents onDidFocus={() => this.fetchData()} />
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
