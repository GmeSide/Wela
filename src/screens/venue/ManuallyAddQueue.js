/* @flow */
import React from "react";
import {
    StyleSheet,
    Dimensions,
    TextInput,
    FlatList,
    TouchableOpacity,
    Modal,
    View,
    Text,
    Image
} from "react-native";
import ProgressDialog from '../../utils/ProgressDialog';
import { colors } from "../../common/AppColors";
import { Card } from 'react-native-shadow-cards';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';

import Helper from '../../utils/Helper.js'
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { ADD_RQUEST_TO_VENUE, MANUAL_ADD } from '../../network/EndPoints';
import { addUserToQueueManually } from '../../network/PostDataPayloads';
import LoadingView from "../../common/LoadingView";

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class ManuallyAddQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            name: '',
            phone: '',
            persons: '',
            contact: [{ name: '', phone: '' }],
            personsCount: 1
        }
    }

    async onAddManualQueueRequest() {
        const { contact } = this.state;
        var error = false
        var message = ''
        contact.map((profile, index) => {
            if (error == false) {
                if (profile.name.trim() == '') {
                    error = true
                    message = `Enter name`
                } else if (profile.phone.trim() == '') {
                    error = true
                    message = `Enter phone number`
                }
            }
        })

        if (error == true) {
            showToastMessage("", message)
        } else {
            var _persons = this.state.personsCount
            var _person_details
            contact.map((profile, index) => {
                if (index == 0) {
                    var detail = profile.name + ":" + profile.phone
                    _person_details = detail
                } else {
                    var detail = profile.name + ":" + profile.phone
                    _person_details = _person_details + "," + detail
                }
                // _persons = _persons + 1
            })
            this.setState({ isLoading: true })
            const PAYLOAD = await addUserToQueueManually(_persons, _person_details)
            PostRequest(MANUAL_ADD, PAYLOAD).then((jsonObject) => {
                this.setState({ isLoading: false })
                if (jsonObject.success) {
                    this.setState({ contact: [{ name: '', phone: '' }], personsCount: 1 })
                    showToastMessage("Create Account", jsonObject.apiResponse.message)
                    // this.props.navigation.navigate('VerifyOTP', { user: jsonObject.apiResponse })
                    this.props.onAddManualQueueRequest()
                }
            })
        }
    }

    onDeleteRow(index) {
        if (this.state.contact.length > 1) {
            const list = this.state.contact;
            list.splice(index, 1);
            this.setState({ contact: list })
        }
    }

    updateName(text, index) {
        var newArray = this.state.contact
        newArray[index]['name'] = text
        this.setState({ contact: newArray })
    }

    updatePhone(text, index) {
        var newArray = this.state.contact
        newArray[index]['phone'] = text
        this.setState({ contact: newArray })
    }

    async increaseCount() {
        let limit = await Helper.venueUserObject.limit_group
        // this.setState({ venuePersonsLimit: mMarker.limit_group })
        var enteredPersons = this.state.personsCount
        if (this.state.personsCount < limit) {
            this.setState({ personsCount: enteredPersons + 1 })
        }
    }

    decreaseCount() {
        var enteredPersons = this.state.personsCount
        if (this.state.personsCount > 1) {
            this.setState({ personsCount: enteredPersons - 1 })
        }
    }

    render() {
        return (
            <Modal
                onRequestClose={() => { this.props.onAddManualQueueRequest(); }}
                backdropOpacity={0.8}
                transparent={true}
                visible={this.props.showAddQueueView}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressOut={() => this.props.onAddManualQueueRequest()}
                  style={{
                      flex: 1,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.5)'
                  }}>
                    <Card
                        elevation={4}
                        style={{
                            width: '95%',
                            borderRadius: 5,
                            alignItems: 'center',
                            padding: 10,
                        }}>
                        <FlatList
                            scrollEnabled={false}
                            nestedScrollEnabled={false}
                            data={this.state.contact}
                            keyExtractor={(item, index) => index + ""}
                            renderItem={({ item, index }) => (
                                <View key={index} style={{
                                    flexDirection: 'column',
                                }}>
                                    <View style={{
                                        width: '100%',
                                        borderRadius: 4,
                                        backgroundColor: colors.input_box_grey,
                                        marginLeft: 5,
                                        height: 40,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignSelf: 'center',
                                        textAlignVertical: 'center',
                                    }}>
                                        <TextInput
                                            style={{
                                                width: '100%',
                                                color: colors.black,
                                                justifyContent: 'center',
                                                textAlignVertical: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                textAlign: 'left'
                                            }}
                                            placeholder={'Customer Name'}
                                            autoCorrect={false}
                                            autoCapitalize={'none'}
                                            keyboardType='default'
                                            returnKeyType={'next'}
                                            onChangeText={text => this.updateName(text, index)}
                                            value={this.state.contact[index].name}
                                            placeholderTextColor={colors.black}
                                            underlineColorAndroid="transparent"
                                        />
                                    </View>

                                    <View style={{
                                        width: '100%',
                                        borderRadius: 4,
                                        backgroundColor: colors.input_box_grey,
                                        marginLeft: 5,
                                        marginTop: 10,
                                        height: 40,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignSelf: 'center',
                                        textAlignVertical: 'center',
                                    }}>
                                        <TextInput
                                            style={{
                                                width: '100%',
                                                color: colors.black,
                                                justifyContent: 'center',
                                                textAlignVertical: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                textAlign: 'left'
                                            }}
                                            placeholder={'Customer Phone Number'}
                                            autoCorrect={false}
                                            autoCapitalize={'none'}
                                            keyboardType='phone-pad'
                                            returnKeyType={'done'}
                                            onChangeText={text => this.updatePhone(text, index)}
                                            value={this.state.contact[index].phone}
                                            placeholderTextColor={colors.black}
                                            underlineColorAndroid="transparent"
                                        />
                                    </View>
                                </View>
                            )}
                        />

                        <View style={{
                          flexWrap: 'wrap',
                          height: 50,
                          marginTop: 10,
                          flexDirection: 'row',
                          alignContent: 'center',
                          alignItems: 'center',
                          borderRadius: 4,
                          justifyContent: 'center',
                          backgroundColor: colors.input_box_grey,
                          alignSelf: 'center',
                        }}>
                            <TouchableOpacity
                            style={{
                                height: 50,
                                width:'70%',
                                marginTop: this.props.topMargin,
                                borderRadius: 4,
                                borderColor: colors.themeDark,
                                backgroundColor: colors.black,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                                onPress={() => this.onAddManualQueueRequest()}>
                                <Text style={{
                                    fontWeight: 'bold',
                                    textAlignVertical: 'center',
                                    textAlign: 'center',
                                    color: colors.white,
                                    fontSize: 16,
                                    fontFamily: 'Rubik-Light'
                                }} >{'Confirm'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => this.decreaseCount()}
                              style={{height: 50, marginHorizontal: 5, backgroundColor: 'black', borderRadius: 4, justifyContent: 'center' }}>
                                <Text style={{
                                    fontSize: 24,
                                    fontFamily: 'Rubik-Light',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    paddingHorizontal: 4
                                }}>-</Text>
                            </TouchableOpacity>
                            <Text style={{
                                fontSize: 16,
                                fontFamily: 'Rubik-Light',
                                fontWeight: 'bold',
                                color: colors.black,
                                paddingLeft: 4,
                            }}>{this.state.personsCount}</Text>
                            <Image
                                style={{
                                    marginLeft: 5,
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                    height: 22,
                                    width: 22,
                                    tintColor: colors.darkGray
                                }}
                                source={require('../images/users.png')}
                            />
                            <TouchableOpacity
                              onPress={() => this.increaseCount()}
                              style={{height: 50, marginLeft: 5, backgroundColor: 'black', borderRadius: 4, justifyContent: 'center' }}>
                                <Text style={{
                                    fontSize: 20,
                                    fontFamily: 'Rubik-Light',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    paddingHorizontal: 4
                                }}>+</Text>
                            </TouchableOpacity>
                        </View>

                        {/*<Button
                            textColor={'#000000'}
                            background={colors.input_box_grey}
                            width={(DEVICE_WIDTH / 4) * 3}
                            topMargin={20}
                            onButtonPress={() => this.props.onAddManualQueueRequest()}
                          text={'Cancel'} />*/}
                    </Card>
                </TouchableOpacity>
                {this.state.isLoading ? <LoadingView message = "Adding.." /> : undefined}
            </Modal>
        )
    }
} // end of class

const styles = StyleSheet.create({
    listItem: {
        flex: 1,
    }, modal: {
        height: 300,
        alignItems: 'center',
        backgroundColor: '#00ff00',
        padding: 100
    },
});
