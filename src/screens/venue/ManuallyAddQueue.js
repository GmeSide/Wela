/* @flow */
import React from "react";
import { FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from "react-native";
import { Card } from 'react-native-shadow-cards';
import { colors } from "../../common/AppColors";
import LoadingView from "../../common/LoadingView";
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { MANUAL_ADD, MANUAL_ADD_LOG } from '../../network/EndPoints';
import { addUserToQueueManually } from '../../network/PostDataPayloads';
import Helper from '../../utils/Helper.js';

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

  async onAddManualQueueRequest(isAddLog) {
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
      PostRequest(isAddLog ? MANUAL_ADD_LOG : MANUAL_ADD, PAYLOAD, true).then((jsonObject) => {
        this.setState({ isLoading: false, contact: [{ name: '', phone: '' }], personsCount: 1 })
        if (jsonObject.success) {
          showToastMessage("Create Account", jsonObject.apiResponse.message)
          this.props.onAddManualQueueRequest()
        } else {
          this.props.onAddManualQueueRequest(true)
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

  focusInput = (refName) => {
    if (this.refs[refName]) {
      this.refs[refName].focus()
    }
  };

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
                    width: DEVICE_WIDTH - 40,
                    borderRadius: 4,
                    backgroundColor: colors.input_box_grey,
                    height: 40,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignSelf: 'center',
                    textAlignVertical: 'center',
                  }}>
                    <TextInput
                      ref={'contact' + index + 'name'}
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
                      onSubmitEditing={() => this.focusInput('contact' + index + 'phone')}
                      value={this.state.contact[index].name}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                    />
                  </View>

                  <View style={{
                    width: DEVICE_WIDTH - 40,
                    borderRadius: 4,
                    backgroundColor: colors.white,
                    marginTop: 10,
                    height: 40,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignContent: 'center',
                    textAlignVertical: 'center',
                  }}>
                    <TextInput
                      ref={'contact' + index + 'phone'}
                      style={{
                        height: 40,
                        color: colors.black,
                        justifyContent: 'center',
                        textAlignVertical: 'center',
                        alignItems: 'center',
                        textAlign: 'left',
                        flex: 0.7,
                        backgroundColor: colors.input_box_grey,
                        borderRadius: 4,
                      }}
                      placeholder={'Customer Phone Number'}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      keyboardType='phone-pad'
                      returnKeyType={this.state.contact[index + 1] ? 'next' : 'done'}
                      onChangeText={text => this.updatePhone(text, index)}
                      onSubmitEditing={() => this.focusInput('contact' + (index + 1) + 'name')}
                      value={this.state.contact[index].phone}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                    />

                    <View style={{
                      marginLeft: 8,
                      flexDirection: 'row',
                      flex: 0.3,
                      height: '100%',
                      alignItems: 'center',
                      borderRadius: 4,
                      justifyContent: 'center',
                      backgroundColor: colors.input_box_grey,
                    }}>
                      <TouchableOpacity
                        onPress={() => this.decreaseCount()}
                        style={{ height: 40, marginRight: 5, backgroundColor: 'black', borderRadius: 4, justifyContent: 'center' }}>
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
                        style={{ height: 40, marginLeft: 5, backgroundColor: 'black', borderRadius: 4, justifyContent: 'center' }}>
                        <Text style={{
                          fontSize: 20,
                          fontFamily: 'Rubik-Light',
                          fontWeight: 'bold',
                          color: 'white',
                          paddingHorizontal: 4
                        }}>+</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                </View>
              )}
            />

            <View style={{
              height: 50,
              width: DEVICE_WIDTH - 40,
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 4,
              justifyContent: 'space-between',
              backgroundColor: colors.input_box_grey,
            }}>
              <TouchableOpacity
                style={{
                  height: 50,
                  width: '40%',
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
                }} >{'Add to Waitlist'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  height: 50,
                  width: '40%',
                  marginTop: this.props.topMargin,
                  borderRadius: 4,
                  borderColor: colors.themeDark,
                  backgroundColor: colors.black,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => this.onAddManualQueueRequest(true)}>
                <Text style={{
                  fontWeight: 'bold',
                  textAlignVertical: 'center',
                  textAlign: 'center',
                  color: colors.white,
                  fontSize: 16,
                  fontFamily: 'Rubik-Light'
                }} >{'Add to Log'}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>
        {this.state.isLoading ? <LoadingView message="Adding.." /> : undefined}
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
