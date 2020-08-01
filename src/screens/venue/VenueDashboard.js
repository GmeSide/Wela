import React, { Component, useState, useEffect } from 'react';
import {
    StyleSheet,
    Dimensions,
    View,
    Animated,
    Image,
    TouchableOpacity,
    Text,
    Platform,
    RefreshControl,
    PermissionsAndroid,
    BackHandler
} from 'react-native';
import VenueDetail from './VenueDetail'
import { Card } from 'react-native-shadow-cards';
import { colors } from '../../common/AppColors';
import ProgressDialog from '../../utils/ProgressDialog';
import Button from '../../common/BlackButton';
import { NavigationEvents } from "react-navigation";
import Helper from '../../utils/Helper';
import ListQueue from './ListQueue'
import Arrows from './Arrows'
import ManuallyAddQueue from './ManuallyAddQueue'
import ToggleWaiting from './ToggleWaiting'
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { CANCEL_WAITING_LIST_BY_USER, TOGGLE_VENUE, GET_VENUE_WAITING_LIST, REGISTER_DEVICE } from '../../network/EndPoints';
import { updateQueueByVenue, toggleVenue, getVenueWaitingListWithHistory, registerDeviceToken } from '../../network/PostDataPayloads';
import DetailViewModal from './DetailViewModal';
// import messaging from '@react-native-firebase/messaging';
import NotifService from './NotifService';
import Geolocation from '@react-native-community/geolocation';


export default class VenueDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isActive: false,
            showAddQueueView: false,
            showVenueDetailView: false,
            usersQueueData: [],
            loggedInVenue: {},
            currentIndexListFocus: 0,
            permissionGranted: false
        }
        this.notif = new NotifService(
            this.onRegister.bind(this),
            this.onNotif.bind(this),
        );
    }

    async onLoadData() {
        var userVenue

        try {
            userVenue = Helper.venueUserObject
            this.setState({ loggedInVenue: userVenue, usersQueueData: Helper.venueQueueDataOfCustomers })
            var url = userVenue.url + userVenue.profile_pic
            Helper.DEBUG_LOG(url)
            this.setState({ venuePicture: url })

           


        } catch (error) {

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
    async fetchData() {
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

        this.onRegister()
        var userVenue
        userVenue = Helper.venueUserObject
        var url = userVenue.url + userVenue.profile_pic
        Helper.DEBUG_LOG(url)
        this.setState({ venuePicture: url })
        this.onLoadData()
        if (userVenue.toggle == 1) {
            this.setState({ isActive: true })
        } else {
            this.setState({ isActive: false })
        }
    }
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
    }
    handleBackButton() {
        BackHandler.exitApp();
    }
    slideBack() {
        if (this.state.currentIndexListFocus != 0) {
            this.setState({ currentIndexListFocus: this.state.currentIndexListFocus - 1 })
        }
    }
    slideNext() {
        if (this.state.currentIndexListFocus < usersQueueData.length) {
            this.setState({ currentIndexListFocus: this.state.currentIndexListFocus + 1 })
        }
    }

    async UpdateWhenNotify(item) {
        try {
            const PAYLOAD = await updateQueueByVenue(item.id, 'notify', item.user_id, item.venue_id)
            PostRequest(CANCEL_WAITING_LIST_BY_USER, PAYLOAD).then((jsonObject) => {
                // if (jsonObject.success) {

                // } else {
                //     let itemsArr = this.state.usersQueueData
                //     itemsArr[index]['status'] = "waiting"
                //     this.setState({ usersQueueData: itemsArr })
                // }
            })
        } catch (error) {

        }
    }
    async onNotifyTap(item, index) {
        if (item.status == "waiting") {
            try {
                let itemsArr = this.state.usersQueueData
                itemsArr[index]['status'] = "Notified"
                this.setState({ usersQueueData: itemsArr })
            } catch (error) {

            }

            try {
                setTimeout(() => this.UpdateWhenNotify(item), 1000)

            } catch (error) {

            }

        }

    }
    async onWaitingToggle(value) {
        this.setState({ isActive: value })
        Helper.DEBUG_LOG(value)
        var toggle = 0
        if (value == true) {
            toggle = 1
        }

        const PAYLOAD = await toggleVenue(this.state.loggedInVenue.id, toggle)
        PostRequest(TOGGLE_VENUE, PAYLOAD).then((jsonObject) => {
            if (jsonObject.success) {

            }
        })
    }
    onAddManualQueueRequestComplete() {
        this.setState({ showAddQueueView: false })
    }
    cancelVenueDetailView() {
        this.onLoadData()
        this.setState({ showVenueDetailView: false })
    }
    venueDetailViewOpen() {
        this.setState({ showVenueDetailView: true })
    }

    onAddShow() {
        this.setState({ showAddQueueView: true })
    }

    deleteNow = (index) => {

        // Helper.DEBUG_LOG(index)
        const list = this.state.usersQueueData;
        list.splice(index, 1);
        this.setState({ usersQueueData: list })
        //  const filteredData =  this.state.usersQueueData.filter(item => item.id !== id);
        // if (filteredData) {
        //     this.setState({ dataSource: filteredData })
        // } else {
        //     this.setState({ dataSource: [] })
        // }
        if (list.length > 3) {
            this.setState({ currentIndexListFocus: 1 })
        } else {
            this.setState({ currentIndexListFocus: 0 })
        }

    }
    async reloadData() {
        this.setState({ isLoading: true })
        const PAYLOAD = await getVenueWaitingListWithHistory(this.state.loggedInVenue.id)
        PostRequest(GET_VENUE_WAITING_LIST, PAYLOAD).then((jsonObject) => {
            this.setState({ isLoading: false })
            if (jsonObject.success) {
                this.setState({ usersQueueData: jsonObject.apiResponse.data })
                Helper.venueQueueDataOfCustomers = jsonObject.apiResponse.data
                if (jsonObject.apiResponse.data.length > 3) {
                    this.setState({ currentIndexListFocus: 1 })
                } else {
                    this.setState({ currentIndexListFocus: 0 })
                }
            }
        })

    }


    render() {
        return (
            <Animated.View
                // refreshControl={<RefreshControl
                // colors={["#9Bd35A", "#689F38"]}
                // refreshing={this.state.isRefreshing}
                // onRefresh={() => this.onRefresh()} />}
                style={{
                    flex: 1,
                    flexDirection: 'column',

                }}>
                {
                    this.state.isLoading ? <ProgressDialog title='Please wait' message="Fetching.." /> : null
                }
                <View
                    style={{
                        width: '100%',
                        height: Platform.OS == 'android' ? '25%' : '35%',
                        backgroundColor: '#8cb3e5',
                        alignContent: 'center',
                        justifyContent: 'center'

                    }}

                >
                    <Text style={{
                        color: 'white',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        fontSize: 16,
                        fontFamily: "Verdana",
                        fontWeight: 'bold',

                    }}>{`Current Average Wait Time ${this.state.loggedInVenue.average_wait_time} Minutes`}</Text>
                </View>

                {/* <Image
                    style={{ width: '100%', height: Platform.OS == 'android' ? '25%' : '35%', backgroundColor: colors.lightGray }}
                    source={{
                        uri: this.state.venuePicture
                    }}
                /> */}

                <View style={{
                    flex: 2,
                    marginTop: 80,
                    width: '100%',
                    flexDirection: 'column',
                    alignContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    marginBottom: Platform.OS == 'ios' ? 40 : 10
                }}>
                    <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        justifyContent: 'center'
                    }}>
                        <ListQueue
                            currentIndex={this.state.currentIndexListFocus}
                            deleteNow={index => this.deleteNow(index)}
                            notify={(item, index) => this.onNotifyTap(item, index)}
                            dataSource={this.state.usersQueueData}
                        />


                        <Text style={{
                            marginTop: 20,
                            color: colors.black,
                            fontFamily: "Verdana",
                            fontWeight: 'bold',
                            fontSize: 18
                        }}>
                            {`${this.state.usersQueueData.length} Groups Waiting`}
                        </Text>

                        <ToggleWaiting
                            isActive={this.state.isActive}
                            toggleSwitch={(value) => this.onWaitingToggle(value)}
                        />
                    </View>
                    <Button
                        width={(DEVICE_WIDTH / 4) * 3}
                        topMargin={10}
                        onButtonPress={() => this.onAddShow()}
                        text={'Add'} />

                </View>
                <VenueDetail
                    vanue={this.state.loggedInVenue}
                    onVisible={() => this.venueDetailViewOpen()}
                />
                <ManuallyAddQueue
                    showAddQueueView={this.state.showAddQueueView}
                    onAddManualQueueRequest={() => this.onAddManualQueueRequestComplete()}
                />
                <DetailViewModal
                    visible={this.state.showVenueDetailView}
                    cancelVenueDetailView={() => { this.cancelVenueDetailView() }}
                    onAddManualQueueRequest={() => this.onAddManualQueueRequestComplete()}
                />
                <NavigationEvents onDidFocus={() => this.fetchData()} />



                <View style={{
                    position: 'absolute',
                    top: Platform.OS == 'ios' ? 60 : 30,
                    right: 20
                }}>
                    <TouchableOpacity onPress={() => this.reloadData()}>

                        <Image
                            style={{
                                width: 30,
                                height: 30,
                            }}
                            source={require('../images/ic_sync.png')}
                        />
                    </TouchableOpacity>

                </View>


            </Animated.View >

        );
    }


    ////////FCM/////////////////////////////////////
    //
    //
    //       
    /////////////////////////////////////////

    onRegister(token) {
        if (token) {
            this.postDeviceToken(token)
        } else {
            this.postDeviceToken(Helper.DEVICE_TOKEN)
        }


        /// this.setState({registerToken: token.token, fcmRegistered: true});
    }

    addQueue(obj) {
        try {
            var array = this.state.usersQueueData
            console.log('--before--')
            console.log(array)
            console.log('--beforeEnd--')
            array.push(obj)

            console.log('--before--')
            console.log(array)
            console.log('--beforeEnd--')
           this.setState({ usersQueueData: array })
        } catch (error) {

        }

    }

    onNotif(notif) {
        if(notif){
            if(notif.data){
                if(notif.data.moredata){
                    var data = notif.data.moredata
                    try {
                        let obj = JSON.parse(data);
            
                        //--Add
                        if (notif.data.type === 'add') {
                            setTimeout(() => { this.addQueue(obj) }, 1000)

                            if(notif.title && notif.message){
                                alert(`${notif.title} \n ${notif.message}`);
                            }
                        }
            
            
                        // //     //--Cancel
                        if (notif.data.type === 'cancel') {
                            let index = this.state.usersQueueData.findIndex(item => item.id === obj.queue_id);
                            let itemsArr = this.state.usersQueueData
                            itemsArr[index]['status'] = "cancel"
                            this.setState({ usersQueueData: itemsArr })

                            if(notif.title && notif.message){
                                alert(`${notif.title} \n ${notif.message}`);
                            }
                        }
            
            
                    } catch (ex) {
                        console.error(ex);
                    }
                    
                    
                }

            }
           
        }
        

    }

    handlePerm(perms) {
        //alert('Permissions', JSON.stringify(perms));
    }

    // async requestUserPermission() {
    //     const authStatus = await messaging().requestPermission();
    //     const enabled =
    //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //         authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    //     if (enabled) {
    //         let fcmToken = await this.getNewToken();
    //         let cachedToken = await Helper.getDeviceFCMToken()

    //         this.postDeviceToken(fcmToken)

    //     }
    // }

    // async getNewToken() {
    //     var fcmToken = await messaging().getToken();
    //     console.log('fcmToken -> ' + fcmToken);
    //     return fcmToken
    // }

    async postDeviceToken(fcmToken) {
        Helper.saveDeviceFcmToken(fcmToken.token)
        //let userType = await Helper.getUserType()
        let platform = Platform.OS
        let user = await Helper.venueUserObject

        const PAYLOAD = await registerDeviceToken(user.id, fcmToken.token, platform, 1)
        PostRequest(REGISTER_DEVICE, PAYLOAD).then((jsonObject) => {
            // if (jsonObject.success) {

            // }
        })
    }
    // messageHandling() {
    //     messaging().onNotificationOpenedApp(remoteMessage => {
    //         console.log(
    //             'Notification caused app to open from background state:',
    //             remoteMessage.notification,
    //         );
    //        // navigation.navigate(remoteMessage.data.type);
    //     });

    //     // Check whether an initial notification is available
    //     messaging()
    //         .getInitialNotification()
    //         .then(remoteMessage => {
    //             if (remoteMessage) {
    //                 console.log(
    //                     'Notification caused app to open from quit state:',
    //                     remoteMessage.notification,
    //                 );
    //                // setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
    //             }
    //             //setLoading(false);
    //         });
    // }


}

const DEVICE_WIDTH = Dimensions.get('window').width;
const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
