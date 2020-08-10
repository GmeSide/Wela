/* @flow */
import React, { Component } from 'react';
import { StyleSheet, Dimensions, View, Text, ScrollView, Image, TextInput,
   TouchableOpacity, FlatList, Keyboard } from 'react-native';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';
import { colors } from '../../common/AppColors';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-community/picker';
import SwitchToggle from "react-native-switch-toggle";
import ProgressDialog from '../../utils/ProgressDialog';
import Helper from '../../utils/Helper.js'
import { PostRequest, showToastMessage, getVenueTypes } from '../../network/ApiRequest.js';
import { CREATE_VENUE_PROFILE } from '../../network/EndPoints';
import { createVenue } from '../../network/PostDataPayloads';

const DEVICE_WIDTH = Dimensions.get('window').width;
var textInputLimit = null
var textInputPeople = null

export default class VenueSetUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
          businessName: '',
          businessEmail: '',
          streetNumber: '',
          streetName: '',
          city: '',
          postalCode: '',
          totalCapacity: '',
          ppGroup: '',
          province: '',
          country: '',
          switchOn: true,
          dataSource: [
            { day: 'monday'},
            { day: 'tuesday'},
            { day: 'wednesday'},
            { day: 'thursday'},
            { day: 'friday'},
            { day: 'saturday'},
            { day: 'sunday'},
          ],
          timesToEdit: [
            { id: 1, day: 'monday', open_time: '', close_time: '' },
            { id: 1, day: 'tuesday', open_time: '', close_time: '' },
            { id: 1, day: 'wednesday', open_time: '', close_time: '' },
            { id: 1, day: 'thursday', open_time: '', close_time: '' },
            { id: 1, day: 'friday', open_time: '', close_time: '' },
            { id: 1, day: 'saturday', open_time: '', close_time: '' },
            { id: 1, day: 'sunday', open_time: '', close_time: '' },
          ],
          businessType: 0,
          allBusinessTypes: [
            'Select Category',
            'Cafes',
            'Bars & Restaurants',
            'Retail',
            'Grocery',
            'Farmers Market',
            'Ice Cream Parlours'
          ],
          isDateTimeModalVisible: false,
          isLoading: false
        }
        this.props.navigation.addListener('willFocus', this.componentWillFocus)
    }

    componentWillFocus = async () => {
      const res = await getVenueTypes()
      this.setState({allBusinessTypes: ['Select Category', ...res.data]})
    }

    getDay(day) {
        return day.length ? day.charAt(0).toUpperCase() + day.slice(1) : day
    }

    onOpenDate(index, isOpenTime) {
        this.setState({
          selectedIndex: index,
          isOpenTime: isOpenTime,
          isDateTimeModalVisible: true
        })
    }

    handleConfirm = (date) => {
        this.setState({isDateTimeModalVisible: false})
        var time = date.toLocaleTimeString('en-US')

        var spilted = time.split(':')
        var hr = spilted[0]
        var minutes = spilted[1]
        let am_pm = 'AM';
        var hours = hr

        if(hr>11){
          am_pm = 'PM';
          if(hr>12){
            hours = hours - 12;
          }
        }

        if(hours == 0){
            hours = 12;
        }

        var time = `${hours}:${minutes} ${am_pm}`

        let itemsArr = this.state.timesToEdit
        if (this.state.isOpenTime == true) {
            itemsArr[this.state.selectedIndex]['open_time'] = time
        } else {
            itemsArr[this.state.selectedIndex]['close_time'] = time
        }

        this.setState({ timesToEdit: itemsArr, isDateTimeModalVisible: false })
    };

    creatingVenue = async () => {
        const { timesToEdit } = this.state;
        var _open_time = ''
        var _close_time = ''
        var _day = ''
        await timesToEdit.map((profile, index) => {
            if (index == 0) {
                _open_time = profile.open_time
                _close_time = profile.close_time
                _day = profile.day
            } else {
                _open_time = _open_time + "," + profile.open_time
                _close_time = _close_time + "," + profile.close_time
                _day = _day + "," + profile.day
            }
        })

        var message
        var error = false

        if (this.state.businessName.trim() == '') {
            message = 'Please enter your business name.'
            error = true
        } else if (this.state.businessEmail.toString().trim() == '') {
            message = 'Please enter your business email.'
            error = true
        } else if (this.state.totalCapacity.toString().trim() == '') {
            message = 'Please enter your business capacity.'
            error = true
        } else if (this.state.ppGroup.toString().trim() == '') {
            message = 'Please enter people per group.'
            error = true
        } else if (this.state.allBusinessTypes[this.state.businessType] === 'Select Category') {
            message = 'Please enter your business category.'
            error = true
        } else {
            error = false
            message = "success"
        }

        if (error) {
            showToastMessage("Required", message)
        } else {
            this.setState({ isLoading: true })
            const PAYLOAD = await createVenue(
              this.state.businessName,
              this.state.businessEmail,
              this.state.allBusinessTypes[this.state.businessType],
              this.state.city,
              this.state.streetNumber,
              this.state.streetName,
              this.state.province,
              this.state.country,
              this.state.postalCode,
              this.state.totalCapacity,
              this.state.ppGroup,
              this.state.switchOn,
              _open_time,
              _close_time,
              _day)
            PostRequest(CREATE_VENUE_PROFILE, PAYLOAD).then((jsonObject) => {
              console.log('jsonObject: ', jsonObject);
                this.setState({ isLoading: false })
                showToastMessage("", jsonObject.apiResponse.message)
                this.props.navigation.navigate('VenueLogin')
            })
            .catch((error) => {
                console.log('ERROR: ', error);
                this.setState({ isLoading: false })
            })
        }
    }

    render() {
        return (
            <View style={{flex: 1}}>

              <View style={{margin: 10, justifyContent: 'center', alignItems: 'center'}}>
                <Image
                    style={{ height: 50, width: 200 }}
                    source={require('../images/logo.png')}
                />
                <Text style={{ fontFamily: 'Rubik-Light', color: colors.black, marginTop: 4 }}>
                    Wait Conveniently
                </Text>
              </View>

              {
                  this.state.isLoading ? <ProgressDialog title='Please wait' message='Updating...' /> : null
              }

              <ScrollView
                  style={{ flex: 1, backgroundColor: '#ffffff', marginBottom: 10 }}
                  keyboardShouldPersistTaps='handled'
              >
                <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 20, marginTop: 8}}>
                  <TextInput
                      ref="one"
                      style={[styles.inputStyle, {width: '100%'}]}
                      keyboardType={'default'}
                      placeholder={"Business Name"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ businessName: text })}
                      value={this.state.businessName}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {this.refs['two0'].focus();}}
                  />
                </View>

                <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 20, marginTop: 8}}>
                  <TextInput
                      ref="two0"
                      style={[styles.inputStyle, {width: '100%'}]}
                      keyboardType={'default'}
                      placeholder={"Business Email"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ businessEmail: text })}
                      value={this.state.businessEmail}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {this.refs['two'].focus();}}
                  />
                </View>

                <View style={{
                  height: 45,
                  borderRadius: 4,
                  backgroundColor: colors.input_box_grey,
                  marginHorizontal: 20,
                  marginTop: 8,
                  width: '90%'
                }}>
                  <Picker
                    selectedValue={this.state.businessType}
                    style={{
                      alignSelf: 'center',
                      width: DEVICE_WIDTH,
                      color: colors.black,
                      transform: [
                       { scaleX: 0.85 },
                       { scaleY: 0.85 },
                    ]}}
                    itemStyle={{}}
                    mode="dropdown"
                    onValueChange={(itemValue, itemIndex) => this.setState({businessType: itemValue})}>
                    {this.state.allBusinessTypes.map((item, index) => {
                        return (<Picker.Item label={item} value={index} key={index}/>)
                    })}
                  </Picker>
                </View>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  height: 45,
                  marginHorizontal: 20,
                  marginTop: 8,
                  width: '90%'
                }}>
                  <Text style={{fontFamily: 'Rubik-Light', textAlignVertical: 'center'}}>Patio Available?</Text>
                  <SwitchToggle
                    backTextRight={this.state.switchOn? '':'no'}
                    backTextLeft={this.state.switchOn? 'yes':''}
                    textRightStyle={{ color: 'white' }}
                    textLeftStyle={{ color: 'white' }}
                    containerStyle={{
                      width: 120,
                      height: 35,
                      borderRadius: 25,
                      backgroundColor: 'black',
                      padding: 5
                    }}
                    circleStyle={{
                      left: 5,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "white" // rgb(102,134,205)
                    }}
                    rightContainerStyle={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    leftContainerStyle={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "flex-start"
                    }}
                    buttonStyle={{
                      alignItems: "center",
                      justifyContent: "center",
                      position: "absolute"
                    }}
                    switchOn={this.state.switchOn}
                    onPress={() => this.setState({switchOn: !this.state.switchOn})}
                    circleColorOff="#fff"
                    circleColorOn="#fff"
                    backgroundColorOn="black"
                    duration={500}
                  />
                </View>

                <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 20, marginTop: 8}}>
                  <TextInput
                      ref="two"
                      style={[styles.inputStyle, {width: '100%'}]}
                      keyboardType={'default'}
                      placeholder={"Street Number"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ streetNumber: text })}
                      value={this.state.streetNumber}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {this.refs['three'].focus();}}
                  />
                </View>

                <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 20, marginTop: 8}}>
                  <TextInput
                      ref="three"
                      style={[styles.inputStyle, {width: '100%'}]}
                      keyboardType={'default'}
                      placeholder={"Street Name"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ streetName: text })}
                      value={this.state.streetName}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {this.refs['four'].focus();}}
                  />
                </View>

                <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 20, marginTop: 8}}>
                  <TextInput
                      ref="four"
                      style={[styles.inputStyle, {width: '65%'}]}
                      keyboardType={'default'}
                      placeholder={"City"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ city: text })}
                      value={this.state.city}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {this.refs['five'].focus();}}
                  />

                  <TextInput
                      ref="five"
                      style={[styles.inputStyle, {width: '32%', marginLeft: 10}]}
                      keyboardType={'default'}
                      placeholder={"Zip"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ postalCode: text })}
                      value={this.state.postalCode}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {this.refs['six'].focus();}}
                  />
                </View>

                <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 20, marginTop: 8}}>
                  <TextInput
                      ref="six"
                      style={[styles.inputStyle, {width: '50%'}]}
                      keyboardType={'default'}
                      placeholder={"Province"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ province: text })}
                      value={this.state.province}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {this.refs['seven'].focus();}}
                  />

                  <TextInput
                      ref="seven"
                      style={[styles.inputStyle, {width: '47%', marginLeft: 10}]}
                      keyboardType={'default'}
                      placeholder={"Country"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ country: text })}
                      value={this.state.country}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {this.refs['eight'].focus();}}
                  />
                </View>

                <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 20, marginTop: 8}}>
                  <TextInput
                      ref="eight"
                      style={[styles.inputStyle, {width: '50%'}]}
                      keyboardType={'number-pad'}
                      placeholder={"Total Capacity"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ totalCapacity: text })}
                      value={this.state.totalCapacity}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {this.refs['nine'].focus();}}
                  />

                  <TextInput
                      ref="nine"
                      style={[styles.inputStyle, {width: '47%', marginLeft: 10}]}
                      keyboardType={'number-pad'}
                      placeholder={"People Per Group"}
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      returnKeyType={'next'}
                      onChangeText={text => this.setState({ ppGroup: text })}
                      value={this.state.ppGroup}
                      placeholderTextColor={colors.black}
                      underlineColorAndroid="transparent"
                      onSubmitEditing={() => {Keyboard.dismiss}}
                  />
                </View>

                <FlatList
                    style={{ marginHorizontal: 20 }}
                    data={this.state.dataSource}
                    keyExtractor={item => `${item}`}
                    renderItem={({ item, index }) => (
                        <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            marginTop:8,
                            paddingHorizontal: 10,
                        }}>
                            <Text style={{ fontFamily: 'Rubik-Light', width: '50%' }}>{this.getDay(item.day)}</Text>

                            <View style={{ width: '50%', flexDirection: 'row' }}>

                                <TouchableOpacity
                                    style={{
                                        justifyContent: 'center',
                                        alignSelf: 'center',
                                        alignItems: 'center',
                                        width: '50%',
                                        borderRadius: 4,
                                        backgroundColor: colors.input_box_grey,
                                        marginRight:4,
                                        height: 45,
                                    }}
                                    onPress={() => this.onOpenDate(index, true)}>
                                    <Text style={{
                                        width: '100%',
                                        fontFamily: 'Rubik-Light',
                                        paddingLeft: 5,
                                        color: colors.black,
                                        textAlign: 'center',
                                        textAlignVertical: 'center',
                                    }}>{this.state.timesToEdit[index].open_time}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        width: '50%',
                                        borderRadius: 4,
                                        backgroundColor: colors.input_box_grey,
                                        marginLeft: 5,
                                        height: 45,
                                        justifyContent: 'center',
                                        alignSelf: 'center',
                                        alignItems: 'center'
                                    }}
                                    onPress={() => this.onOpenDate(index, false)}>
                                    <Text style={{
                                        width: '100%',
                                        fontFamily: 'Rubik-Light',
                                        paddingLeft: 5,
                                        color: colors.black,
                                        textAlign: 'center',
                                        textAlignVertical: 'center',
                                    }}>{this.state.timesToEdit[index].close_time}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />

                <DateTimePickerModal
                    is24Hour={false}
                    date={new Date()}
                    headerTextIOS={'Pick a time'}
                    isVisible={this.state.isDateTimeModalVisible}
                    mode="time"
                    onConfirm={date => this.handleConfirm(date)}
                    onCancel={() => this.setState({isDateTimeModalVisible: false})}
                />

              </ScrollView>

              <Button
                  onButtonPress={() => this.creatingVenue()}
                  text={'Register'}
              />
              <View style={{marginTop: 10}} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    inputStyle: {
        backgroundColor: colors.input_box_grey,
        maxHeight: 45,
        height: 45,
        paddingHorizontal: 10,
        color: colors.black,
        borderRadius: 4
    }
});