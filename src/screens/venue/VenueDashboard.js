/* @flow */
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
    BackHandler,
    ScrollView
} from 'react-native';
import VenueDetail from './VenueDetail'
import { Card } from 'react-native-shadow-cards';
import { colors } from '../../common/AppColors';
import ProgressDialog from '../../utils/ProgressDialog';
import Button from '../../common/BlackButton';
import Helper from '../../utils/Helper';
import ListQueue from './ListQueue'
import Arrows from './Arrows'
import ManuallyAddQueue from './ManuallyAddQueue'
import ToggleWaiting from './ToggleWaiting'
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { CANCEL_WAITING_LIST_BY_USER, TOGGLE_VENUE, GET_VENUE_WAITING_LIST, REGISTER_DEVICE, DELETE_QUEUE } from '../../network/EndPoints';
import { updateQueueByVenue, toggleVenue, getVenueWaitingListWithHistory, registerDeviceToken , deleteQueue} from '../../network/PostDataPayloads';
import DetailViewModal from './DetailViewModal';
import messaging from '@react-native-firebase/messaging';
// import firebase, { Notification, RemoteMessage, Analytics } from 'react-native-firebase'
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
            averageWaitTime: 0,
            currentIndexListFocus: 0,
            permissionGranted: false,
        }
        this.notif = new NotifService(
            this.onRegister.bind(this),
            // this.onNotif.bind(this),
        );
        this.props.navigation.addListener('willFocus', this.componentWillFocus)
    }

    componentWillFocus = async () => {
        console.log('VenueDashboard FOCUSED.');
        await this.fetchData()
        await this.reloadData()
        if (Platform.OS == 'ios') {
            await messaging().registerDeviceForRemoteMessages();
            this.requestUserPermission()
        }

        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            console.log('remoteMessage->', remoteMessage);
            //alert(`${remoteMessage.notification.title} \n ${remoteMessage.notification.body}`);
            this.updateOnNotify(remoteMessage)
            // alert('kuch our')

            // if (remoteMessage.notification) {
            //     if (remoteMessage.notification.data) {
            //         if (remoteMessage.notification.data.type) {
            //             if (remoteMessage.notification.data.type === 'notify') {
            //                 this.FetchDataWhenNotified()

            //             }
            //         }
            //     }
            // }
        });
    }

    componentDidMount = async () => {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));

        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log(
                'Notification caused app to open from background state:',
                remoteMessage.notification,
            );
            this.reloadData()
        });

        // Check whether an initial notification is available
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log(
                        'Notification caused app to open from quit state:',
                        remoteMessage.notification,
                    );
                    this.reloadData()
                }
            });

        //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        //     console.log('remoteMessage->',remoteMessage);
        //     alert(`${remoteMessage.notification.title} \n ${remoteMessage.notification.body}`);
        //    // alert('kuch our')

        //     // if (remoteMessage.notification) {
        //     //     if (remoteMessage.notification.data) {
        //     //         if (remoteMessage.notification.data.type) {
        //     //             if (remoteMessage.notification.data.type === 'notify') {
        //     //                 this.FetchDataWhenNotified()

        //     //             }
        //     //         }
        //     //     }
        //     // }
        // });
    }
    async requestUserPermission() {
        // await messaging.APNSConfig(
        //     headers = {
        //         ':method': 'POST',
        //         'apns-priority': '10',
        //         'apns-push-type': 'alert',
        //     },
        //     payload = messaging.APNSPayload(aps = messaging.Aps(content_available = True))
        // )
        const authStatus = await messaging().requestPermission({
            sound: false,
            announcement: true,
            alert: true,
            badge: true
        });
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            if (Platform.OS == 'ios') {
                console.log('fcmToken->')
                messaging()
                    .getToken()
                    .then(token => {
                        console.log(token)
                        this.postDeviceToken(token)
                    });

                messaging().onTokenRefresh(token => {
                    console.log('refresh->', token)
                    this.postDeviceToken(token)
                });
            }
        }
    }

    handleBackButton() {
        BackHandler.exitApp();
    }

    updateOnNotify = (notif) => {
        if (notif) {
            if (notif.data) {
                console.log('data->',notif.data)
                if (notif.data.moredata) {
                    var data = notif.data.moredata
                    try {
                        let obj = JSON.parse(data);
                        //--Add
                        if (notif.data.type === 'add') {
                            this.addQueue(obj)
                            if (notif.title && notif.message) {
                                alert(`${notif.title} \n ${notif.message}`);
                            }
                        }
                        // //     //--Cancel
                        if (notif.data.type === 'cancel') {
                            let index = this.state.usersQueueData.findIndex(item => item.id === obj.queue_id);
                            let itemsArr = this.state.usersQueueData
                            itemsArr[index]['status'] = "cancel"
                            this.updatingUsersQueueData(itemsArr)
                            if (notif.title && notif.message) {
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

    // onNotif(notif) {
    //     if (notif) {
    //         if (notif.data) {
    //             if (notif.data.moredata) {
    //                 var data = notif.data.moredata
    //                 try {
    //                     let obj = JSON.parse(data);
    //                     //--Add
    //                     if (notif.data.type === 'add') {
    //                         this.addQueue(obj)
    //                         if (notif.title && notif.message) {
    //                             alert(`${notif.title} \n ${notif.message}`);
    //                         }
    //                     }
    //                     // //     //--Cancel
    //                     if (notif.data.type === 'cancel') {
    //                         let index = this.state.usersQueueData.findIndex(item => item.id === obj.queue_id);
    //                         let itemsArr = this.state.usersQueueData
    //                         itemsArr[index]['status'] = "cancel"
    //                         this.updatingUsersQueueData(itemsArr)
    //                         if (notif.title && notif.message) {
    //                             alert(`${notif.title} \n ${notif.message}`);
    //                         }
    //                     }
    //                 } catch (ex) {
    //                     console.error(ex);
    //                 }
    //             }
    //         }
    //     }
    // }

    updatingUsersQueueData = (data) => {
      // console.log('usersQueueData: ', data);
      this.setState({usersQueueData: data})
      let outdatedCards = []
      // status "confirm"
      for (let i = 0; i < data.length; i++) {
        if (data[i].status === "confirm" || data[i].status === "Confirm") {
          let thisObj = data[i]
          const updatedAt = new Date(thisObj.updated_at)
          const now = new Date()
          // const now = new Date(noww.getFullYear(), noww.getMonth(), noww.getDate(), noww.getHours(), noww.getMinutes(), noww.getSeconds())
          // console.log('updatedAt: ', updatedAt);
          // console.log('now: ', now);
          // console.log('thisObj.time_zone: ', thisObj.time_zone);
          // console.log('now: ', now.getTime());
          // console.log('now: ', Date.now() + now.getTimezoneOffset() * 60000);
          // console.log('passedTime 11: ', (Date.now() + now.getTimezoneOffset() * 60000) - updatedAt.getTime());
          // const passedTime = now.getTime() - updatedAt.getTime();
          const passedTime = now.getTime() - thisObj.time_zone;
          console.log('passedTime: ', passedTime);
          const timeRemaining = 600000 - passedTime
          console.log('Eliminate After: ', timeRemaining);
          if (timeRemaining > 0) {
            console.log('Timer Set...');
            setTimeout(() => {
              const itemsArr = this.state.usersQueueData
              const tempIndex = itemsArr.findIndex(item => item.id === thisObj.id);
              if (tempIndex > -1 && itemsArr[tempIndex].status!=='waiting') {
                itemsArr.splice(tempIndex, 1);
                this.setState({usersQueueData: itemsArr})
              }
            }, timeRemaining)
          } else {
            console.log('data[i]: ', data[i]);
            if (data[i].status === "confirm" || data[i].status === "Confirm" || data[i].status === "Notified" || data[i].status === "notified") {
              outdatedCards.push(thisObj.id)
            }
            // here I can store index of cards that are long completed
          }
        }
      }
      if (outdatedCards.length) {
        for (let j = 0; j < outdatedCards.length; j++) {
          const cleanQueData = this.state.usersQueueData
          const tempIndex = cleanQueData.findIndex(item => item.id === outdatedCards[j]);
          if (tempIndex > -1 && cleanQueData[tempIndex].status!=='waiting') {
            cleanQueData.splice(tempIndex, 1);
          }
          this.setState({usersQueueData: cleanQueData})
        }
      }
      // here I can remove cards that are gone
    }

    async onLoadData() {
        var userVenue
        try {
            userVenue = Helper.venueUserObject
            this.setState({ loggedInVenue: userVenue })
            // CRITICAL: Removing FROM here cause now we do refresh on focus seperately
            // this.updatingUsersQueueData(Helper.venueQueueDataOfCustomers)
            var url = userVenue.url + userVenue.profile_pic
            Helper.DEBUG_LOG(url)
            this.setState({ venuePicture: url })
        } catch (error) {
            console.log('onLoadData: ', error);
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
        await this.onLoadData()
        if (userVenue.toggle == 1) {
            this.setState({ isActive: true })
        } else {
            this.setState({ isActive: false })
        }
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

    UpdateWhenNotify = async (item) => {
        try {
            const PAYLOAD = await updateQueueByVenue(item.id, 'notify', item.user_id, item.venue_id)
            PostRequest(CANCEL_WAITING_LIST_BY_USER, PAYLOAD).then((jsonObject) => {
                // if (jsonObject.success) {

                // } else {
                //     let itemsArr = this.state.usersQueueData
                //     itemsArr[index]['status'] = "waiting"
                //     this.setState({ usersQueueData: itemsArr })
                /// DEV CAUTION: Use updatingUsersQueueData to update usersQueueData
                // }
            })
        } catch (error) {
            console.log('UpdateWhenNotify error.', error);
        }
    }

    onNotifyTap = async (item, index) => {
        if (item.status == "waiting") {
            try {
                let itemsArr = this.state.usersQueueData
                itemsArr[index]['status'] = "Notified"
                this.updatingUsersQueueData(itemsArr)
                this.UpdateWhenNotify(item)
                setTimeout(() => {
                  let itemsArr = this.state.usersQueueData
                  const tempIndex = itemsArr.findIndex(tempitem => tempitem.id === item.id);
                  if (tempIndex > -1 && itemsArr[tempIndex].status!=='waiting') {
                    itemsArr.splice(tempIndex, 1);
                    this.setState({usersQueueData: itemsArr})
                  }
                }, 600000)
            } catch (error) {
                console.log('ERROR onNotifyTap: ', error);
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
              console.log('onWaitingToggle jsonObject: ', jsonObject);
            }
        })
    }

    onAddManualQueueRequestComplete = async () => {
        this.setState({ showAddQueueView: false })
        await this.reloadData()
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

    deleteNow = async (index,item) => {
        // Helper.DEBUG_LOG(index)
        const list = this.state.usersQueueData;
        list.splice(index, 1);
        this.updatingUsersQueueData(list)
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

        const PAYLOAD = await deleteQueue(item.id)
        PostRequest(DELETE_QUEUE, PAYLOAD).then((jsonObject) => {
            if (jsonObject.success) {

            }
        })
    }

    reloadData = async () => {
        this.setState({ isLoading: true })
        const PAYLOAD = await getVenueWaitingListWithHistory(this.state.loggedInVenue.id)
        PostRequest(GET_VENUE_WAITING_LIST, PAYLOAD).then((jsonObject) => {
            this.setState({ isLoading: false })
            if (jsonObject.success) {
                this.updatingUsersQueueData(jsonObject.apiResponse.data)
                Helper.venueQueueDataOfCustomers = jsonObject.apiResponse.data
                if (jsonObject.apiResponse.data.length > 3) {
                    this.setState({ currentIndexListFocus: 1 })
                } else {
                    this.setState({ currentIndexListFocus: 0 })
                }
                if (jsonObject.apiResponse.wait_time != null) {
                  this.setState({ averageWaitTime: jsonObject.apiResponse.wait_time })
                }
            } else {
              this.updatingUsersQueueData([])
            }
        })
    }

    render() {
        const { usersQueueData } = this.state
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
                        height: '25%',
                        backgroundColor: '#8cb3e5',
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        paddingVertical: 25,
                    }}
                >
                    <Text style={{
                        color: 'white',
                        fontFamily: 'Rubik-Light',
                        fontSize: 20,
                        fontWeight: 'bold',
                    }}>{this.state.loggedInVenue.business_name}</Text>
                    <Text style={{
                        color: 'white',
                        fontFamily: 'Rubik-Light',
                        fontSize: 16,
                        fontWeight: 'bold',
                    }}>{`Current Wait Time`}</Text>
                    <Text style={{
                        color: 'white',
                        fontFamily: 'Rubik-Light',
                        fontSize: 16,
                    }}>{`${this.state.averageWaitTime} Minutes`}</Text>

                    <VenueDetail
                      onVisible={() => this.venueDetailViewOpen()}
                    />
                </View>

                {/* <Image
                    style={{ width: '100%', height: Platform.OS == 'android' ? '25%' : '35%', backgroundColor: colors.lightGray }}
                    source={{
                        uri: this.state.venuePicture
                    }}
                /> */}

                <View style={{
                    height: '75%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                }}>
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 25,
                    }}>
                        <ListQueue
                            currentIndex={this.state.currentIndexListFocus}
                            deleteNow={(index,item) => this.deleteNow(index,item)}
                            notify={(item, index) => this.onNotifyTap(item, index)}
                            dataSource={usersQueueData}
                        />
                    </View>

                    <ToggleWaiting
                        isActive={this.state.isActive}
                        toggleSwitch={(value) => this.onWaitingToggle(value)}
                    />

                    <Button
                        width={(DEVICE_WIDTH / 4) * 3}
                        topMargin={10}
                        onButtonPress={() => this.onAddShow()}
                        text={'Add'}
                    />

                    <TouchableOpacity
                      style={{width:(DEVICE_WIDTH / 4) * 3, height: 50, marginTop: 10, backgroundColor: colors.black, justifyContent: 'center'}}
                      onPress={() => this.props.navigation.navigate('CustomerLog')}>
                      <Text style={{
                          fontWeight: 'bold',
                          textAlign: 'center',
                          color: colors.white,
                          fontSize: 16,
                          fontFamily: 'Rubik-Light'
                      }} >{'Customer Log'}
                      </Text>
                    </TouchableOpacity>
                </View>

                <ManuallyAddQueue
                    showAddQueueView={this.state.showAddQueueView}
                    onAddManualQueueRequest={() => this.onAddManualQueueRequestComplete()}
                />

                <DetailViewModal
                    visible={this.state.showVenueDetailView}
                    cancelVenueDetailView={() => { this.cancelVenueDetailView() }}
                    onAddManualQueueRequest={() => this.onAddManualQueueRequestComplete()}
                />

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
            </Animated.View>
        );
    }

    onRegister(token) {
        if (token) {
            this.postDeviceToken(token)
        } else {
            this.postDeviceToken(Helper.DEVICE_TOKEN)
        }
        console.log('onRegister OUT');
    }

    addQueue = (obj) => {
        try {
            var array = this.state.usersQueueData
            console.log('--before--')
            console.log(array)
            console.log('--beforeEnd--')
            array.push(obj)
            this.updatingUsersQueueData(array)
        } catch (error) {

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
        let platform = Platform.OS
        if (platform == 'android') {
            console.log('androidToken', fcmToken.token)
            Helper.saveDeviceFcmToken(fcmToken.token)
        }

        let user = await Helper.venueUserObject
        const PAYLOAD = await registerDeviceToken(user.id, platform == 'android' ? fcmToken.token : fcmToken, platform, 1)
        console.log(PAYLOAD)
        PostRequest(REGISTER_DEVICE, PAYLOAD).then((jsonObject) => {
            console.log('tokenUpload')
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
