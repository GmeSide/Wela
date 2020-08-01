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

const DEVICE_WIDTH = Dimensions.get('window').width;

class ManuallyAddQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isVisible: true,
            name: '',
            email: '',
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

    AddContact() {
        let { contact } = this.state

        var error = false
        var message = ''
        contact.map((profile, index) => {

            if (error == false) {
                if (profile.name.trim() == '') {
                    error = true
                    message = `Enter name at ${index + 1} row.`
                } else if (profile.phone.trim() == '') {
                    error = true
                    message = `Enter phone at ${index + 1} row.`
                }
            }

        })

        if (error == true) {
            showToastMessage("", message)
        } else {
            var newArray = this.state.contact
            var data = { name: '', phone: '' }
            newArray.push(data)
            this.setState({ contact: newArray })
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
    showDeleteIcon(index) {
        if (this.state.contact.length > 1) {
            return (
                <View style={{
                    alignSelf: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 5,
                    backgroundColor: colors.black
                }}>
                    <TouchableOpacity
                        style={{
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 30,
                            height: 30,
                        }}
                        onPress={() => this.onDeleteRow(index)}>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontSize: 24,
                                color: '#ffffff',
                                textAlignVertical: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                justifyContent: 'center',
                                textAlignVertical: 'center'
                            }}
                        >-</Text>
                    </TouchableOpacity>

                </View>
            )
        }
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
    getPlusButtonColor() {
        if (this.state.personsCount < Helper.venueUserObject.limit_group) {
            return colors.black
        } else {
            return colors.lightGray
        }
    }
    getMinusButtonColor() {
        if (this.state.personsCount > 1) {
            return colors.black
        } else {
            return colors.lightGray
        }
     }
    render() {
        return (

            <Modal
                onRequestClose={() => { this.props.onAddManualQueueRequest(); }}
                backdropOpacity={0.8}
                transparent={true}
                visible={this.props.showAddQueueView}>
                {/* <Card> */}
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                }}>
                    {
                        this.state.isLoading ? <ProgressDialog title='Please wait' message="Adding.." /> : null
                    }
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
                            style={{ marginTop: 20 }}
                            renderItem={({ item, index }) => (

                                <View style={{
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    paddingHorizontal: 10,
                                    marginTop: 5
                                }}>



                                    <View style={{
                                        width: '45%',
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
                                            placeholder={'Name'}
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
                                        width: '45%',
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
                                            placeholder={'Phone'}
                                            autoCorrect={false}
                                            autoCapitalize={'none'}
                                            keyboardType='number-pad'
                                            returnKeyType={'done'}
                                            onChangeText={text => this.updatePhone(text, index)}
                                            value={this.state.contact[index].phone}
                                            placeholderTextColor={colors.black}
                                            underlineColorAndroid="transparent"
                                        />
                                    </View>
                                    {/* {this.showDeleteIcon(index)} */}

                                </View>
                            )}
                            data={this.state.contact}
                            keyExtractor={item => `${item}`}
                        />

                        <View style={{
                            flexWrap: 'wrap',
                            height: 50,
                            marginLeft: 2,
                            flexDirection: 'row',
                            alignContent: 'flex-end',
                            alignItems: 'center',
                            borderRadius: 4,
                            marginRight: 35,
                            marginTop: 5,
                            justifyContent: 'center',
                            backgroundColor: colors.input_box_grey,
                            alignSelf: 'flex-end',
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: colors.black,
                                fontFamily: "Verdana",
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
                            <View style={{
                                height: 50,
                                marginRight: 5,

                                flexDirection: 'column',
                                marginLeft: 10


                            }}>
                                <TouchableOpacity
                                    onPress={() => this.increaseCount()}
                                >
                                    <Text style={{
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        color: this.getPlusButtonColor(),
                                        fontFamily: "Verdana",
                                        paddingLeft: 4,
                                        height: 25,
                                        alignItems: "flex-start",
                                        justifyContent: 'flex-start',
                                        alignContent: 'flex-start',
                                        alignSelf: 'flex-start'
                                    }}>+</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => this.decreaseCount()}
                                >
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: 'bold',
                                        color: this.getMinusButtonColor(),
                                        fontFamily: "Verdana",
                                        paddingLeft: 4,
                                        height: 25,
                                        alignItems: "flex-end",
                                        justifyContent: 'flex-end',
                                        alignContent: 'flex-end',
                                        alignSelf: 'flex-end'
                                    }}>-</Text>
                                </TouchableOpacity>

                            </View>


                        </View>
                        {/* <View style={{
                            marginTop: 10,
                            alignSelf: 'flex-end',
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.black
                        }}>
                            <TouchableOpacity
                                style={{
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 30,
                                    height: 30,
                                }}
                                onPress={() => this.AddContact()}>
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: 24,
                                        color: '#ffffff',
                                        textAlignVertical: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        textAlignVertical: 'center'
                                    }}
                                >+</Text>
                            </TouchableOpacity>

                        </View> */}
                        <Button
                            width={(DEVICE_WIDTH / 4) * 3}
                            topMargin={20}
                            onButtonPress={() => this.onAddManualQueueRequest()}
                            text={'Add'} />

                        <Button
                            textColor={'#000000'}
                            background={colors.input_box_grey}
                            width={(DEVICE_WIDTH / 4) * 3}
                            topMargin={20}
                            onButtonPress={() => this.props.onAddManualQueueRequest()}
                            text={'Cancel'} />

                    </Card>
                </View>
                {/* </Card> */}
            </Modal>

        )
    }
} // end of class

export default ManuallyAddQueue;



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
