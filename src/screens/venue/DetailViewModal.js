/* @flow */
import React from "react";
import {
    StyleSheet,
    Dimensions,
    TextInput,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    View,
    FlatList,
    ScrollView
} from "react-native";
import ProgressDialog from '../../utils/ProgressDialog';
import { colors } from "../../common/AppColors";
import { Card } from 'react-native-shadow-cards';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';

import Helper from '../../utils/Helper.js'
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { UPDATE_VENUE_PROFILE } from '../../network/EndPoints';
import { updateVenueProfile } from '../../network/PostDataPayloads';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ifIphoneX } from 'react-native-iphone-x-helper';

const DEVICE_WIDTH = Dimensions.get('window').width;

var textInputLimit = null
var textInputPeople = null

export default class DetailViewModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isOpenTime: false,
            selectedIndex: 0,
            isDatePickerVisible: false,
            addressViewOpened: false,
            dataSource: [],
            loggedInVenue: {},
            total_capacity: '',
            limit_group: '',
            total_capacityEdit: '',
            limit_groupEdit: '',
            address: '',
            latitude: 11.000,
            longtitude: 11.000,
            addressEdit: '',
            latitudeEdit: 11.000,
            longtitudeEdit: 11.000,
            zip_code: '',
            zip_codeEdit: '',
            timesToEdit: [],
            businessEmail: '',
            streetNumber: '',
            streetAddress: '',
            city: '',
            province: '',
            country: '',
        }
    }

    async loadUpdatedData() {
        let user = await Helper.venueUserObject
        Helper.DEBUG_LOG("user lat -> " + user.latitude)
        Helper.DEBUG_LOG("user longt -> " + user.longitude)
        this.setState({ loggedInVenue: user, dataSource: Helper.venueProfiles })
        console.log('loadUpdatedData : ', user);
        //streetNumber, streetAddress, province, country
        this.setState({
            total_capacity: user.total_capacity,
            limit_group: user.limit_group,
            address: user.location,
            latitude: user.latitude,
            longtitude: user.longitude,
            addressEdit: user.location,
            latitudeEdit: user.latitude,
            longtitudeEdit: user.longitude,
            zip_code: user.zip_code,
            businessEmail: user.business_email,
            streetNumber: user.street_number,
            streetAddress: user.street_name,
            city: user.city,
            province: user.province,
            country: user.country,
        })
        this.state.dataSource.forEach(profile => {
            var data = {
                id: profile.id,
                day: profile.day,
                open_time: profile.open_time,
                close_time: profile.close_time
            }
            this.state.timesToEdit.push(data)
        })
        Helper.DEBUG_LOG(this.state.timesToEdit)
    }

    async componentDidMount() {
        await this.loadUpdatedData()
    }

    showDatePicker() {
        this.setState({ isDatePickerVisible: true });
    };

    hideDatePicker() {
        this.setState({ isDatePickerVisible: false });
    };

    handleConfirm = (date) => {
        this.hideDatePicker()
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

        this.setState({ timesToEdit: itemsArr })
        setTimeout(() => { this.hideDatePicker()}, 1000)
    };

    cancelVenueDetailView() {
        this.props.cancelVenueDetailView()
        this.setState({
            address: this.state.loggedInVenue.location,
            latitude: this.state.loggedInVenue.latitude,
            longtitude: this.state.loggedInVenue.longitude,
            zip_code: this.state.loggedInVenue.zip_code,
            limit_group: this.state.loggedInVenue.limit_group,
            total_capacity: this.state.loggedInVenue.total_capacity
        })
    }

    async onAddManualQueueRequest() {
        const { loggedInVenue, timesToEdit } = this.state;
        const { latitude, longtitude, zip_code, total_capacity, limit_group } = this.state;

        var _id = loggedInVenue.id
        var _latitude = ""
        var _longitude = ""
        var _zip_code = zip_code
        var _total_capacity = total_capacity
        var _limit_group = limit_group

        var _ids = ""
        var _open_time = ""
        var _close_time = ""
        var _day = ""

        await timesToEdit.map((profile, index) => {
            if (index == 0) {
                _ids = profile.id
                _open_time = profile.open_time
                _close_time = profile.close_time
                _day = profile.day
            } else {
                _ids = _ids + "," + profile.id
                _open_time = _open_time + "," + profile.open_time
                _close_time = _close_time + "," + profile.close_time
                _day = _day + "," + profile.day
            }
        })

        var message
        var error = false

        if (this.state.streetAddress.trim() == '') {
            message = 'Please enter street name!'
            error = true
        } else if (_zip_code.toString().trim() == '') {
            message = 'Please enter zip code!'
            error = true
        } else if (_total_capacity.toString().trim() == '') {
            message = 'Please enter total capacity!'
            error = true
        } else if (_limit_group.toString().trim() == '') {
            message = 'Please enter total group limit!'
            error = true
        } else {
            error = false
            message = "success"
        }

        if (error) {
            showToastMessage("Required", message)
        } else {
            this.setState({ isLoading: true })

            const PAYLOAD = await updateVenueProfile(
                _id,
                this.state.businessEmail,
                this.state.streetAddress,
                this.state.streetNumber,
                this.state.city,
                this.state.province,
                this.state.country,
                _latitude,
                _longitude,
                _zip_code,
                _total_capacity,
                _limit_group,
                _ids,
                _open_time,
                _close_time,
                _day)
            PostRequest(UPDATE_VENUE_PROFILE, PAYLOAD).then((jsonObject) => {

                if (jsonObject.success) {
                    Helper.venueProfiles = jsonObject.apiResponse.profile
                    Helper.venueUserObject = jsonObject.apiResponse.data
                    this.setState({ dataSource: jsonObject.apiResponse.profile })
                    this.loadUpdatedData()
                    this.cancelVenueDetailView()
                }
                this.setState({ isLoading: false })
                showToastMessage("", jsonObject.apiResponse.message)
            })
        }
    }

    cancelVenueDetailView() {
        this.props.cancelVenueDetailView()
    }

    //--------------------------
    // ONLY ADRESSES
    //--------------------------------------
    onAddAddress() {
        this.setState({ addressViewOpened: false })
        let { addressEdit} = this.state
        this.setState({address: addressEdit})
    }

    CancelAddressModification() {
        this.setState({ addressViewOpened: false })
        let { address, latitude, longtitude } = this.state
        this.setState({
            addressEdit: address,
            latitudeEdit: latitude,
            longtitudeEdit: longtitude,
        })
    }

    getDay(day) {
        return day.length ? day.charAt(0).toUpperCase() + day.slice(1) : day
    }

    ADDRESS_VIEW() {
        return (
            <Modal
                onRequestClose={() => this.setState({ addressViewOpened: false })}
                animationType={'fade'}
                backdropOpacity={0.8}
                transparent={true}
                visible={this.state.addressViewOpened}>
                {/* <Card> */}
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                }}>
                    <Card
                        elevation={4}
                        style={{
                            width: '90%',
                            borderRadius: 5,
                            alignItems: 'center',
                            padding: 10,
                        }}>
                        <ScrollView>
                            <UserInput
                                numberOfLines={6}
                                width={'90%'}
                                height={80}
                                inputTextHeight={80}
                                maxHeight={80}
                                placeholderTextColor={colors.black}
                                placeholder="Location Address"
                                autoCapitalize={'none'}
                                returnKeyType={'next'}
                                keyboardType='default'
                                autoCorrect={false}
                                value={this.state.addressEdit}
                                onChangeText={text => this.setState({ addressEdit: text })}
                                multiline={true}

                            />

                            <Button
                                width={(DEVICE_WIDTH / 4) * 3}
                                topMargin={20}
                                onButtonPress={() => this.onAddAddress()}
                                text={'Save Address'} />

                            <Button
                                textColor={'#000000'}
                                background={colors.input_box_grey}
                                width={(DEVICE_WIDTH / 4) * 3}
                                topMargin={20}
                                onButtonPress={() => this.CancelAddressModification()}
                                text={'Cancel'} />
                        </ScrollView>
                    </Card>
                </View>
                {/* </Card> */}
            </Modal>
        )
    }

    onOpenDate(index, isOpenTime) {
        this.setState({ selectedIndex: index, isOpenTime: isOpenTime })
        this.showDatePicker()
    }

    render() {
        return (
            <Modal
                animationType={'fade'}
                onRequestClose={() => { this.props.cancelVenueDetailView(); }}
                backdropOpacity={0.8}
                transparent={true}
                visible={this.props.visible}>

                {/* <Card> */}
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    ...ifIphoneX({
                      paddingTop: 30
                    }, {
                      paddingTop: 0
                    })

                }}>
                    {
                        this.state.isLoading ? <ProgressDialog title='Please wait' message="Update Details.." /> : null
                    }
                    <Card
                        elevation={4}
                        style={{
                            width: '95%',
                            borderRadius: 5,
                            alignItems: 'center',
                            padding: 10,

                        }}>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
                            {/*
                        *
                        * VENUE NAME VIEW ...............
                        */}

                            <View style={{
                                marginLeft: 10,
                                flexDirection: 'row',
                            }}>
                                <Text style={{
                                    justifyContent: 'flex-start',
                                    fontFamily: 'Rubik-Light',
                                    alignContent: 'flex-start',
                                    alignSelf: 'flex-start',
                                    color: colors.black,
                                    flex: 1
                                }}>{this.state.loggedInVenue.business_name}</Text>

                                <Image
                                    style={{
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignSelf: 'center',
                                        width: 22, height: 22, marginRight: 15
                                    }}
                                    source={require('../../screens/images/ic_profile.png')}
                                />

                            </View>

                            <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 5, marginTop: 8}}>
                              <TextInput
                                  style={[styles.inputStyle, {width: '100%'}]}
                                  keyboardType={'default'}
                                  placeholder={"Direct Business Email"}
                                  autoCorrect={false}
                                  autoCapitalize={'none'}
                                  returnKeyType={'next'}
                                  onChangeText={text => this.setState({ businessEmail: text })}
                                  value={this.state.businessEmail}
                                  placeholderTextColor={colors.black}
                                  underlineColorAndroid="transparent"
                              />
                            </View>


                            {/*
                        *
                        * CAPACITY VIEW ...............
                        */}
                            <View style={{
                                marginLeft: 10,
                                flexDirection: 'row',
                                marginTop: 20
                            }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        justifyContent: 'center',
                                        fontFamily: 'Rubik-Light',
                                        alignContent: 'center',
                                        alignSelf: 'center',
                                        textAlignVertical: 'center',
                                        color: colors.black,

                                    }}>Total Capacity</Text>

                                    <View style={{
                                        width: '100%',
                                        flex: 1,
                                        borderRadius: 4,
                                        backgroundColor: colors.input_box_grey,
                                        height: 45,
                                        marginTop:6,
                                        marginRight:10,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignSelf: 'center',
                                        textAlignVertical: 'center',
                                    }}>
                                        <TextInput
                                            ref={ref => textInputPeople = ref}
                                            style={{
                                                width: '50%',
                                                color: colors.black,
                                                justifyContent: 'center',
                                                textAlignVertical: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                textAlign: 'right'
                                            }}
                                            placeholder={''}
                                            autoCorrect={false}
                                            autoCapitalize={'none'}
                                            keyboardType='number-pad'
                                            returnKeyType={'done'}
                                            onChangeText={text => this.setState({ total_capacity: text })}
                                            value={this.state.total_capacity}
                                            placeholderTextColor={colors.black}
                                            underlineColorAndroid="transparent"
                                        />
                                        <TouchableOpacity
                                            style={{
                                                width: '50%',
                                                justifyContent: 'center',
                                                textAlignVertical: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            onPress={() => { textInputPeople.focus() }}>
                                            <Text style={{
                                                width: '100%',
                                                fontFamily: 'Rubik-Light',
                                                paddingLeft: 5,
                                                color: colors.black,
                                                textAlign: 'left',
                                                justifyContent: 'center',
                                                textAlignVertical: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center'
                                            }}>People</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        justifyContent: 'center',
                                        fontFamily: 'Rubik-Light',
                                        alignContent: 'center',
                                        alignSelf: 'center',
                                        textAlignVertical: 'center',
                                        color: colors.black,
                                    }}>People Per Group</Text>
                                    <View style={{
                                        width: '100%',
                                        borderRadius: 4,
                                        backgroundColor: colors.input_box_grey,
                                        marginLeft: 10,
                                        marginTop:6,
                                        height: 45,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignSelf: 'center',
                                        textAlignVertical: 'center',
                                    }}>
                                        <TextInput
                                            ref={ref => textInputLimit = ref}
                                            style={{
                                                flex: 1,
                                                width: '50%',
                                                color: colors.black,
                                                justifyContent: 'center',
                                                textAlignVertical: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                textAlign: 'right'
                                            }}
                                            placeholder={''}
                                            autoCorrect={false}
                                            autoCapitalize={'none'}
                                            keyboardType='number-pad'
                                            returnKeyType={'done'}
                                            onChangeText={text => this.setState({ limit_group: text })}
                                            value={this.state.limit_group}
                                            placeholderTextColor={colors.black}
                                            underlineColorAndroid="transparent"
                                        />
                                        <TouchableOpacity
                                            style={{
                                                width: '50%',
                                                flex: 1,
                                                justifyContent: 'center',
                                                textAlignVertical: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            onPress={() => { textInputLimit.focus() }}>
                                            <Text style={{
                                                width: '100%',
                                                fontFamily: 'Rubik-Light',
                                                paddingLeft: 5,
                                                color: colors.black,
                                                textAlign: 'left',
                                                justifyContent: 'center',
                                                textAlignVertical: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center'
                                            }}>Limit</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                            </View>

                            {/*
                        *
                        * ADDRESS VIEW ...............
                        */}

                            <Text style={{
                                justifyContent: 'center',
                                fontFamily: 'Rubik-Light',
                                alignContent: 'center',
                                alignSelf: 'center',
                                textAlignVertical: 'center',
                                color: colors.black,
                                marginTop: 20
                            }}>Business Address</Text>

                            <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 5, marginTop: 8}}>
                              <TextInput
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
                              />
                            </View>

                            <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 5, marginTop: 8}}>
                              <TextInput
                                  style={[styles.inputStyle, {width: '100%'}]}
                                  keyboardType={'default'}
                                  placeholder={"Street Name"}
                                  autoCorrect={false}
                                  autoCapitalize={'none'}
                                  returnKeyType={'next'}
                                  onChangeText={text => this.setState({ streetAddress: text })}
                                  value={this.state.streetAddress}
                                  placeholderTextColor={colors.black}
                                  underlineColorAndroid="transparent"
                              />
                            </View>

                            <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 5, marginTop: 8}}>
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
                                  onChangeText={text => this.setState({ zip_code: text })}
                                  value={this.state.zip_code}
                                  placeholderTextColor={colors.black}
                                  underlineColorAndroid="transparent"
                                  onSubmitEditing={() => {this.refs['six'].focus();}}
                              />
                            </View>

                            <View style={{flexDirection: 'row', alignSelf: 'flex-start', marginHorizontal: 5, marginTop: 8}}>
                              <TextInput
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
                              />

                              <TextInput
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
                              />
                            </View>

                            <Text style={{
                                justifyContent: 'center',
                                fontFamily: 'Rubik-Light',
                                alignContent: 'center',
                                alignSelf: 'center',
                                textAlignVertical: 'center',
                                color: colors.black,
                                marginTop: 20
                            }}>Business Hours</Text>
                            <FlatList
                                scrollEnabled={false}
                                nestedScrollEnabled={false}
                                style={{ marginTop: 5 }}
                                renderItem={({ item, index }) => (
                                    <View
                                      key={index}
                                      style={{
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

                                            <View style={{
                                                width: '50%',
                                                borderRadius: 4,
                                                backgroundColor: colors.input_box_grey,
                                                marginRight:4,
                                                height: 45,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignSelf: 'center',
                                                textAlignVertical: 'center',
                                            }}>
                                                <TouchableOpacity
                                                    style={{
                                                        justifyContent: 'center',
                                                        textAlignVertical: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                    onPress={() => this.onOpenDate(index, true)}>
                                                    <Text style={{
                                                        width: '100%',
                                                        fontFamily: 'Rubik-Light',
                                                        paddingLeft: 5,
                                                        color: colors.black,
                                                        textAlign: 'center',
                                                        justifyContent: 'center',
                                                        textAlignVertical: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center'
                                                    }}>{this.state.timesToEdit[index].open_time}</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <View style={{
                                                width: '50%',
                                                borderRadius: 4,
                                                backgroundColor: colors.input_box_grey,
                                                marginLeft: 5,
                                                height: 45,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignSelf: 'center',
                                                textAlignVertical: 'center',
                                            }}>
                                                <TouchableOpacity
                                                    style={{
                                                        justifyContent: 'center',
                                                        textAlignVertical: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                    onPress={() => this.onOpenDate(index, false)}>
                                                    <Text style={{
                                                        width: '100%',
                                                        fontFamily: 'Rubik-Light',
                                                        paddingLeft: 5,
                                                        color: colors.black,
                                                        textAlign: 'center',
                                                        justifyContent: 'center',
                                                        textAlignVertical: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center'
                                                    }}>{this.state.timesToEdit[index].close_time}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                )}
                                data={this.state.dataSource}
                                keyExtractor={(item, index) => index + ""}
                            />

                            <DateTimePickerModal
                                is24Hour={false}
                                date={new Date()}
                                headerTextIOS={'Pick a time'}
                                isVisible={this.state.isDatePickerVisible}
                                mode="time"
                                onConfirm={date => this.handleConfirm(date)}
                                onCancel={() => this.hideDatePicker()}
                            />

                            <Button
                                width={(DEVICE_WIDTH / 4) * 3}
                                topMargin={25}
                                onButtonPress={() => this.onAddManualQueueRequest()}
                                text={'Save changes'} />

                            <Button
                                textColor={'#000000'}
                                background={colors.input_box_grey}
                                width={(DEVICE_WIDTH / 4) * 3}
                                topMargin={10}
                                onButtonPress={() => this.cancelVenueDetailView()}
                                text={'Cancel'} />
                        </ScrollView>
                    </Card>

                    {this.ADDRESS_VIEW()}
                </View>
                {/* </Card> */}

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
    inputStyle: {
        backgroundColor: colors.input_box_grey,
        maxHeight: 45,
        height: 45,
        color: colors.black,
        borderRadius: 4
    }
});
