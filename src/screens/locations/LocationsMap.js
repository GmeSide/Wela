/* @flow */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions,
    TextInput,
    Alert,
    Platform,
    PermissionsAndroid,
    Animated,
    Picker,
    BackHandler
} from 'react-native';
import { colors } from '../../common/AppColors';
import { Card } from 'react-native-shadow-cards';
import Button from '../../common/BlackButton';
import MapView, { PROVIDER_GOOGLE, Marker, LatLng, MAP_TYPES, PROVIDER_DEFAULT, LocalTile } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Helper from '../../utils/Helper.js'
import PushNotification from 'react-native-push-notification';
import ContactsList from './ContactsList'
import { PostRequest, showToastMessage, getVenues } from '../../network/ApiRequest.js';
import { GET_FAVOURITE, ADD_RQUEST_TO_VENUE, ADD_TO_FAVOUITE, REGISTER_DEVICE, GET_USER_WAITING_LIST } from '../../network/EndPoints';
import { getAllFavourite, addVenueToQueueList, addToFavourite, removeFavourite, registerDeviceToken, getUserWaitingListWithHistory } from '../../network/PostDataPayloads';
import Contacts from 'react-native-contacts';
import Geocoder from 'react-native-geocoder';
import NotifService from '../venue/NotifService';
import { NavigationEvents } from "react-navigation";
import WaitingList from '../waiting/WaitingList.js';
import IHAKPicker from "./ihakpicker";
import ProgressDialog from '../../utils/ProgressDialog';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import ClusteredMapView from 'react-native-maps-super-cluster'

const HIGHT_SCREEN = (Dimensions.get('window').height);

const customStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#f5f5f5"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#bdbdbd"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#eeeeee"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e5e5e5"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dadada"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e5e5e5"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#eeeeee"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c9c9c9"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    }
]

// const onRemoteNotification = (notification) => {
//     const result = `
//       Title:  ${notification.getTitle()};\n
//       Message: ${notification.getMessage()};\n
//       badge: ${notification.getBadgeCount()};\n
//       sound: ${notification.getSound()};\n
//       category: ${notification.getCategory()};\n
//       content-available: ${notification.getContentAvailable()}.`;

//     Alert.alert('Push Notification Received', result, [
//         {
//             text: 'Dismiss',
//             onPress: null,
//         },
//     ]);
// };
const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    // console.log('remoteMessage->',remoteMessage);
    if (remoteMessage.notification.title) {
      alert(`${remoteMessage.notification.title} \n ${remoteMessage.notification.body}`);
    } else {
      alert(`${remoteMessage.notification.body}`);
    }
   // alert('kuch our')

    if (remoteMessage.notification) {
        if (remoteMessage.notification.data) {
            if (remoteMessage.notification.data.type) {
                if (remoteMessage.notification.data.type === 'notify') {
                    this.FetchDataWhenNotified()
                }
            }
        }
    }
});

export default class LocationsMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshh: true,
            isLoading: false,
            currentLat: '',
            currentLongt: '',
            confirm_view: false,
            selectedMarkerIndex: 0,
            detailView: false,
            lineUped: true,
            searchesListOpened: false,
            searchText: '',
            markers: [],
            categoriesList: [],
            filteredList: [],
            allCategories: [],
            filteredVenuesNames: [],
            allVenuesNames: [],
            faveIconColorCode: colors.lightGray,
            isFavouriteOpendMarker: false,
            isSelectedAlreadyQueued: false,
            currentMarkerDistance: '... km away',
            gpsRequestSent: false,
            personsCount: 1,
            visibleContacts: false,
            contactList: [],
            venuePersonsLimit: 1,
            persons_detail: '',
            mapMargin: 1,
            permissionGranted: false,
            userCurrentLocationText: '',
            openedVenueMarkerName: '',
            people_selected_count: '1',
            region: {
                latitude: 43.6559534,
                longitude: -79.3660584,
                latitudeDelta: 0.010,
                longitudeDelta: 0.010
            },
            peopleData: [{
                label: '1',
                value: '1',
            }, {
                label: '2',
                value: '2',
            }, {
                label: '3',
                value: '3',
            }, {
                label: '4',
                value: '4',
            }, {
                label: '5',
                value: '5',
            }, {
                label: '6',
                value: '6',
            }
          ]
        }
        this.zIndex = 1
        this.notif = new NotifService(
            this.onRegister.bind(this),
            // this.onNotif.bind(this),
        );
        this.props.navigation.addListener('willFocus', this.componentWillFocus)
        Helper.locationAlert = false
    }

    componentDidMount = async () => {
      this.messageListener = firebase.messaging().onMessage(async(message) => {
          // Process your message as required
          console.log('Notification onMessage: ', message)
          if (message.data.type === 'toggle') {
            let user = await Helper.getUser()
            let stateVenues = this.state.markers
            let msgVenue = JSON.parse(message.data.moredata)
            let index = stateVenues.findIndex(marker => marker.id === msgVenue.id);
            console.log('index: ', index);
            console.log('message.data.moredata.id: ', msgVenue.id);
            console.log('stateVenues: ', stateVenues);
            if (index > -1) {
              stateVenues[index].toggle = msgVenue.toggle
              console.log('Marker State Updated.');
            }

            let allVenues = user.venue_type.venues
            let aindex = allVenues.findIndex(marker => marker.id === msgVenue.id);
            console.log('aindex: ', aindex);
            if (aindex > -1) {
              allVenues[aindex].toggle = msgVenue.toggle
              user.venue_type.venues = allVenues
              Helper.saveUser(user)
              console.log('Marker State Updated.');
            }
            this.setState({refreshh: !this.state.refreshh})
          }
      })

      await this.reloadCurrentLocation()

      await this.fetchData()

      let user = await Helper.getUser()
      const updatedVenues = await this.gettingVenues(user.id)
      if (updatedVenues.data.success) {
        user.venue_type.venues = updatedVenues.data.data.venues
        Helper.saveUser(user)
      }


      // Add listener for push notifications
      //PushNotificationIOS.addEventListener('notification', onRemoteNotification);
      // onMessage(async remoteMessage => {
      //     console.log('notificaiton', remoteMessage)
      //     alert('A new FCM ');
      // });
      // messaging().setBackgroundMessageHandler(async remoteMessage => {
      //     alert('A new remoteMessage ');
      // });
    }

    gettingVenues = async (userId) => {
      try {
        console.log('gettingVenues');
        const data = await getVenues(userId)
        console.log('data: ', data);
        return data
      } catch (e) {
        console.log('ERROR gettingVenues: ', e);
        return null
      }
    }

    componentWillFocus = async () => {
        console.log('LocationsMap FOCUSED.');

        if (Platform.OS == 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
        }

        if (Platform.OS == 'ios') {
            //PushNotificationIOS.getInitialNotification();
            await messaging().registerDeviceForRemoteMessages();
            //alert('han bhai aayaa?')
            this.requestUserPermission()
            //alert('han bhai nahi aya?')
            // console.log('fcmToken->')
            // const enabled =
            //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            // if (enabled) {
            //     onMessage(async remoteMessage => {
            //         console.log('notificaiton', remoteMessage)
            //         alert('A new FCM ');
            //     });
            //     messaging().setBackgroundMessageHandler(async remoteMessage => {
            //         alert('remoteMessage ');
            //         console.log('Message handled in the background!', remoteMessage);
            //     });
            //     // firebase.notifications().onNotification((notification) => {
            //     //     console.log('Message handled!', notification);
            //     // })
            // }
        }

        // onRemoteNotification (notification => {
        //     const result = `
        //       Title:  ${notification.getTitle()};\n
        //       Message: ${notification.getMessage()};\n
        //       badge: ${notification.getBadgeCount()};\n
        //       sound: ${notification.getSound()};\n
        //       category: ${notification.getCategory()};\n
        //       content-available: ${notification.getContentAvailable()}.`;

        //     Alert.alert('Push Notification Received', result, [
        //       {
        //         text: 'Dismiss',
        //         onPress: null,
        //       },
        //     ]);
        //   });
    }

    handleBackButton() {
        BackHandler.exitApp();
    }
    // _onNotification(notification) {
    //     AlertIOS.alert(
    //         'Push Notification Received',
    //         'Alert message: ' + notification.getMessage(),
    //         [{
    //             text: 'Dismiss',
    //             onPress: null,
    //         }]
    //     );
    // }
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
                        //alert(token)
                        this.postDeviceToken(token)
                    });
                //     // messaging().getAPNSToken().then(token => {
                //     //     this.postDeviceToken(token.token)
                //     // });
                messaging().onTokenRefresh(token => {
                    console.log('refresh->', token)
                    //alert(token)
                    this.postDeviceToken(token)
                });
                //    // alert('test')
                //     onMessage(async remoteMessage => {
                //         console.log('notificaiton', remoteMessage)
                //         //alert('A new FCM ');
                //     });
                //     messaging().setBackgroundMessageHandler(async remoteMessage => {
                //        // alert('A new remoteMessage ');
                //     });
            }
        }
    }

    async getFavListIfEmpty() {
        try {
            let empty = await Helper.favouritesAvailable()
            if (empty === false) {
                let user = await Helper.getUser()
                const PAYLOAD = await getAllFavourite(user.id)
                PostRequest(GET_FAVOURITE, PAYLOAD).then((jsonObject) => {
                    if (jsonObject.success) {
                        Helper.updateFavoritesList(jsonObject.apiResponse.data)
                    }
                })
            }
        } catch (error) {

        }
    }

    async getWaitingListIfEmpty() {
        try {
            let empty = await Helper.waitingListEmpty()
            if (empty === true) {
                let user = await Helper.getUser()
                const PAYLOAD = await getUserWaitingListWithHistory(user.id)
                PostRequest(GET_USER_WAITING_LIST, PAYLOAD).then((jsonObject) => {

                    if (jsonObject.success) {
                        Helper.updateUserQueList(jsonObject.apiResponse)
                    }
                })
            }
        } catch (error) {

        }
    }

    reloadCurrentLocation = async () => {
      console.log('reloadCurrentLocation IN.');
      let location = await Helper.getUserCurrentLocation()
      console.log('location: ', location);
      if (location && location != null) {
        this.setState({ userCurrentLocationText: '' })
        await this.getTextAddress(location.latitude, location.longitude)
        this.setState({
            currentLat: location.latitude,
            currentLongt: location.longitude
        });
        this.map.getMapRef().animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0100,
          longitudeDelta: 0.0100
        })
      }
    }

    fetchContats() {
        try {
            Contacts.getAll((err, contacts) => {
                if (!err) {
                    try {
                        const mMarker = this.state.markers[parseInt(this.state.selectedMarkerIndex)]
                        this.setState({ venuePersonsLimit: mMarker.limit_group })
                        if (mMarker.limit_group > 1) {
                            this.setState({ visibleContacts: true, contactList: contacts })
                        } else {
                            showToastMessage('limit', "This venue has total limit of persons " + this.state.venuePersonsLimit)
                        }
                    } catch (error) {

                    }
                }
            })
        } catch (error) {

        }
    }

    onContactListRequest() {
        try {
            const mMarker = this.state.markers[parseInt(this.state.selectedMarkerIndex)]
            this.setState({ venuePersonsLimit: mMarker.limit_group })
            //Helper.DEBUG_LOG(this.state.venuePersonsLimit)
            var peoplelimit = []
            for (let i = 1; i <= this.state.venuePersonsLimit; i++) {
                var data = {
                    label: `${i}`,
                    value: `${i}`
                }
                peoplelimit.push(data)
            }
            this.setState({ peopleData: peoplelimit })

            // Contacts.checkPermission((err, permission) => {
            //     // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
            //     if (permission === 'undefined') {
            //         Helper.DEBUG_LOG('undefined')
            //         this.requestPermission()
            //     }
            //     if (permission === 'authorized') {
            //         Helper.DEBUG_LOG('authorized')
            //         this.fetchContats()
            //     }
            //     if (permission === 'denied') {
            //         this.requestPermission()
            //         Helper.DEBUG_LOG('denied')
            //     }
            // })
        } catch (error) {

        }
    }

    requestPermission() {
        try {
            Contacts.requestPermission((err, permission) => {
                if (permission === 'undefined') {
                    this.requestPermission()
                }
                if (permission === 'authorized') {
                    this.onContactListRequest()
                }
                if (permission === 'denied') {

                }
            })
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
        this.getFavListIfEmpty()
        this.getWaitingListIfEmpty()
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
        if (Platform.OS == 'android') {
            Geocoder.fallbackToGoogle('AIzaSyCb3txixm6dLD7YTal0QsPEUV64XbxtXo0');
        } else {
            Geocoder.fallbackToGoogle('AIzaSyBqUL0roNWsCTLBaH5H3CGItExoT9J5vhQ');
        }

        this.onRegister()
        console.log('fetchData progress 1.');
        if (this.state.detailView == true) {
            const currentMarker = this.state.markers[parseInt(this.state.selectedMarkerIndex)]
            let isFav = await Helper.isVenueFavourited(currentMarker.id)
            this.setState({ isFavouriteOpendMarker: isFav })
            this.setIconColor(isFav)

            let isQueued = await Helper.isAlreadyInQueue(currentMarker.id)
            this.setState({ isSelectedAlreadyQueued: isQueued })
        }
        await this.findNeares()
    }

    async getTextAddress(latitude, longitude) {
        try {
            if (latitude && longitude) {
                var NY = {
                    lat: latitude,
                    lng: longitude
                };
                const res = await Geocoder.geocodePosition(NY);
                //Helper.DEBUG_LOG('--Geocoder--')
                //Helper.DEBUG_LOG(res)
                if (res) {
                    if (Array.isArray(res)) {
                        if (res.length > 0) {
                            var feature = ''
                            var subAdminArea = ''
                            if (res[0].feature) {
                                feature = res[0].feature
                            }
                            if (res[0].subAdminArea) {
                                subAdminArea = res[0].subAdminArea
                            }
                            var formattedAddress = `${feature}, ${subAdminArea}`
                            this.setState({ userCurrentLocationText: formattedAddress })
                        }
                    }
                }
            }
        } catch (error) {

        }
    }

    findNeares = async () => {
        console.log('findNeares IN.');
        let location = null
        if (this.state.currentLat && this.state.currentLongt) {
          location = {
            latitude: this.state.currentLat,
            longitude: this.state.currentLongt
          }
          console.log('findNeares location already get: ', location);
        } else {
          location = await Helper.getUserCurrentLocation()
        }

        console.log('findNeares location: ', location);
        if (location == null) {
            console.log('findNeares stuck');
            return
        }

        if (!this.state.currentLat && !this.state.currentLongt) {
          this.setState({
              currentLat: location.latitude,
              currentLongt: location.longitude
          })
        }

        // await this.getTextAddress(location.latitude, location.longitude)
        if (this.state.userCurrentLocationText == '') {
            console.log('findNeares getTextAddress again: ', location);
            this.getTextAddress(location.latitude, location.longitude)
        }

        let categories = await Helper.getVenueCategories()
        this.setState({ categoriesList: categories, allCategories: categories })
        console.log('findNeares categories: ', categories.length);

        let nearestVenues = await Helper.getNearestVenues(location)
        nearestVenues = nearestVenues.filter(venue => venue.locDistance <= Helper.DISTANCE)
        console.log('findNeares nearestVenues: ', nearestVenues.length);
        if (nearestVenues && nearestVenues.length > 0) {
            this.setState({
                markers: nearestVenues
            });
            let venuesNames = await Helper.getVenueCategoriesByLocation(nearestVenues)
            this.setState({ filteredVenuesNames: venuesNames, allVenuesNames: venuesNames })
        }
    }

    onConfirmAction = async (marker) => {
        this.setState({ isLoading: true, detailView: false, gpsRequestSent: false })
        const PAYLOAD = await addVenueToQueueList(marker.id, this.state.personsCount)
        PostRequest(ADD_RQUEST_TO_VENUE, PAYLOAD).then(async (jsonObject) => {
            if (jsonObject.success) {
                showToastMessage("", jsonObject.apiResponse.message)
                Helper.updateUserQueList(jsonObject.apiResponse)
                this.setState({ isLoading: false, searchText: '', openedVenueMarkerName: '' })
                await this.findNeares()
            }
        })
    }

    changeStatus() {
        if (this.state.isFavouriteOpendMarker == true) {
            this.setState({ isFavouriteOpendMarker: false })
            return false
        } else {
            this.setState({ isFavouriteOpendMarker: true })
            return true
        }
    }

    async addToFavourite(venue_id) {
        let nextStatus = await this.changeStatus()
        this.setIconColor(nextStatus)
        var PAYLOAD
        if (nextStatus == true) {
            PAYLOAD = await addToFavourite(venue_id)
        } else {
            PAYLOAD = await removeFavourite(venue_id)
        }
        PostRequest(ADD_TO_FAVOUITE, PAYLOAD).then((jsonObject) => {
            if (jsonObject.success) {
                Helper.userFavouritesVenue = jsonObject.apiResponse.data
            }
        })
    }

    getLatLong(marker) {
        if (marker) {
            if (marker.latitude) {
                if (marker.longitude) {
                    return {
                        latitude: marker.latitude,
                        longitude: marker.longitude
                    }
                }
            }
        }
    }

    customMarkerView = (marker) => {
      if (!this.state.detailView) {
        if (marker.toggle) {
          return (
              <Card
                  elevation={24}
                  style={{ padding: 8, width: 200 }}>
                  <TouchableOpacity
                  // onPress={() => this.setState({ detailView: true })}
                  >
                      <View style={{
                          flexDirection: 'column',
                      }}>
                          <View style={{
                              flexDirection: 'row',
                              alignContent: 'center',
                              alignItems: 'center',
                              justifyContent: 'center',
                              alignSelf: 'center',
                          }}>
                              <Text
                                  style={{
                                      fontSize: 16,
                                      fontFamily: 'Rubik-Light',
                                      color: colors.black,
                                      fontWeight: 'bold',
                                      paddingLeft: 4,
                                      flex: 1,
                                      alignContent: 'center',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      alignSelf: 'center',
                                  }}>
                                  {marker.business_name}
                              </Text>
                          </View>
                          <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.darkGray, paddingLeft: 4 }}>{this.getAverageWaitTimeByMarker(marker)}</Text>
                      </View>
                  </TouchableOpacity>
              </Card>
          );
        } else {
          return (
              <Card
                  elevation={24}
                  style={{ padding: 8, width: 200 }}>
                  <TouchableOpacity>
                      <View style={{flexDirection: 'column'}}>
                          <View style={{
                              flexDirection: 'row',
                              alignContent: 'center',
                              alignItems: 'center',
                              justifyContent: 'center',
                              alignSelf: 'center',
                          }}>
                              <Text
                                  style={{
                                      fontSize: 16,
                                      fontFamily: 'Rubik-Light',
                                      color: colors.lightGray,
                                      fontWeight: 'bold',
                                      paddingLeft: 4,
                                      flex: 1,
                                      alignSelf: 'center',
                                  }}>
                                  {marker.business_name}
                              </Text>
                          </View>
                          <Text style={{ fontFamily: 'Rubik-Light', fontSize: 11, color: colors.lightGray, paddingLeft: 4 }}>{'Not Available'}</Text>
                      </View>
                  </TouchableOpacity>
              </Card>
          );
        }
      }
    };

    setIconColor(isFav) {
        //Helper.DEBUG_LOG(isFav)
        if (isFav == true) {
            this.setState({ faveIconColorCode: colors.black })
        } else {
            this.setState({ faveIconColorCode: colors.lightGray })
        }
    }

    async handleMarkerPress(event) {
        if (this.state.searchesListOpened) {
            this.setState({ searchesListOpened: false })
        }
        if (event.nativeEvent.action === 'marker-press') {
            console.log('onMarker->')
            const markerID = event.nativeEvent.id
            let index
            let currentMarker
            for (i = 0; i < this.state.markers.length; i++) {
              const marker = this.state.markers[i]
              if (marker.id === parseInt(markerID)) {
                index = i
                currentMarker = marker
              }
            }
            // console.log('currentMarker: ', currentMarker);
            if (currentMarker && currentMarker.toggle) {
              this.fetchUserDistance(currentMarker)
              this.setState({
                  openedVenueMarkerName: currentMarker.name,
                  detailView: true,
                  selectedMarkerIndex: index,
                  confirm_view: false,
                  currentLat: currentMarker.latitude,
                  currentLongt: currentMarker.longitude
              })
              let isFav = await Helper.isVenueFavourited(currentMarker.id)
              this.setState({ isFavouriteOpendMarker: isFav })
              this.setIconColor(isFav)
              let isQueued = await Helper.isAlreadyInQueue(currentMarker.id)
              this.setState({ isSelectedAlreadyQueued: isQueued })
            }
        } else {
            console.log('onMap-> ')
            // this.setState({ gpsRequestSent: false })
            if (this.state.detailView) {
                this.setState({
                    detailView: false,
                    confirm_view: false,
                    searchesListOpened: false,
                    personsCount: 1,
                    persons_detail: '',
                    searchText: '',
                    openedVenueMarkerName: ''
                })
            }
        }
    }

    getAverageWaitTime() {
        let time = this.state.markers[parseInt(this.state.selectedMarkerIndex)].average_wait_time
        return `${time} minute wait`
    }

    getAverageWaitTimeByMarker(marker) {
        let time = marker.average_wait_time
        return `${time} minute wait`
    }

    async getFavStatus() {
        let status = await Helper.isVenueFavourited()
        return status
    }

    async favStyle() {
        const _id = this.state.markers[parseInt(this.state.selectedMarkerIndex)].id
        let status = await Helper.isVenueFavourited(_id)
        //Helper.DEBUG_LOG(status)
        if (status == true) {
            return {
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                height: 20,
                width: 20,
                tintColor: colors.black,
                marginLeft: 10
            }
        } else {
            return {
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                height: 20,
                width: 20,
                tintColor: colors.input_box_grey,
                marginLeft: 10
            }
        }
    }

    favIconColor = async (favourite) => {
        let status = await Helper.isVenueFavourited(id)
        //Helper.DEBUG_LOG(status)
        this.setState({ faveIconColorCode: colors.black })
    }

    fetchUserDistance = async (mMarker) => {
        try {
            this.setState({ currentMarkerDistance: '... km away'})
            let distance = await Helper.calculateSingleVenueDistance(mMarker.latitude, mMarker.longitude)
            this.setState({ currentMarkerDistance: `${Number(distance).toFixed(2)} km away` })
        } catch (error) {
          console.log('ERROR fetchUserDistance: ', error);
        }
    }

    showDetailMarker = (obj) => {
        if (this.state.detailView) {
            if (this.state.markers && this.state.markers.length > 0) {
                const mMarker = this.state.markers[parseInt(this.state.selectedMarkerIndex)]
                return (
                    <Card
                        elevation={4}
                        style={{ padding: 8 }}>
                        <TouchableOpacity
                        // onPress={() => this.updateList(marker.id)}
                        >
                            <View style={{
                                flexDirection: 'column',
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                }}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontFamily: 'Rubik-Light',
                                            color: colors.black,
                                            fontWeight: 'bold',
                                            paddingLeft: 4,
                                            flex: 1,
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            alignSelf: 'center',
                                        }}>
                                        {mMarker.business_name}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => { this.addToFavourite(mMarker.id) }}
                                    >
                                        <Image
                                            style={{
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                alignSelf: 'center',
                                                height: 20,
                                                width: 20,
                                                tintColor: this.state.faveIconColorCode,
                                                marginLeft: 10
                                            }}
                                            source={require('../images/fav_heart.png')}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.darkGray, paddingLeft: 4 }}>{this.getAverageWaitTime()}</Text>
                                {this.innerViewOfRow(mMarker)}
                            </View>
                        </TouchableOpacity>
                    </Card>
                );
            }
        }
    };

    innerViewOfRow(mMarker) {
        if (this.state.lineUped) {
          const address = `${mMarker.street_number} ${mMarker.street_name}`
            return (
                <View style={{
                    flexDirection: 'column',
                    marginTop: 10
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontFamily: 'Rubik-Light', flex: 1, fontSize: 12, color: colors.black, paddingLeft: 4 }}>{address}</Text>
                        <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.lightGray, paddingLeft: 4 }}>{this.state.currentMarkerDistance}</Text>
                    </View>
                    {this.lineUpView(mMarker)}
                    {this.confirmView()}
                </View>
            )
        }
    }

    requestToLineUp(mMarker) {
      console.log('requestToLineUp mMarker: ', mMarker);
        if (this.state.isSelectedAlreadyQueued === false && mMarker.toggle) {
            if (Helper.totalInCurrentWaitingList() < 2) {
                this.setState({ confirm_view: true })
            }
        }
    }

    getOpacity() {
        if (this.state.isSelectedAlreadyQueued === true) {
            return 0.5
        } else if (Helper.totalInCurrentWaitingList() > 1) {
            return 0.5
        } else {
            return 1
        }
    }

    lineUpView(mMarker) {
        if (!this.state.confirm_view) {
            return (
                <View style={{
                    opacity: this.getOpacity(),
                    flex: 1,
                    flexDirection: 'row',
                    marginTop: 20,
                    marginRight: 2
                }}>
                    <Button
                        width={'100%'}
                        onButtonPress={() => this.requestToLineUp(mMarker)}
                        text={'Line Up'} />
                </View>
            )
        }
    }

    setPeopleSelectedValue(itemValue, itemIndex) {
        this.setState({ people_selected_count: itemValue })
    }

    increaseCount() {
        const mMarker = this.state.markers[parseInt(this.state.selectedMarkerIndex)]
        // this.setState({ venuePersonsLimit: mMarker.limit_group })
        var enteredPersons = this.state.personsCount
        if (this.state.personsCount < mMarker.limit_group) {
            this.setState({ personsCount: enteredPersons + 1 })
        }
    }

    decreaseCount() {
        var enteredPersons = this.state.personsCount
        if (this.state.personsCount > 1) {
            this.setState({ personsCount: enteredPersons - 1 })
        }
    }

    confirmView() {
        const mMarker = this.state.markers[parseInt(this.state.selectedMarkerIndex)]
        if (this.state.confirm_view) {
            return (
                <View style={{ flexDirection: 'row', marginTop: 20 }}>

                    <View style={{ flex: 1, flexDirection: 'row', marginRight: 2 }}>
                        <Button
                            width={'100%'}
                            onButtonPress={() => this.onConfirmAction(mMarker)}
                            text={'Confirm'}
                        />
                    </View>
                    <View style={{
                        flexWrap: 'wrap',
                        height: 50,
                        marginLeft: 2,
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        borderRadius: 4,
                        justifyContent: 'center',
                        backgroundColor: colors.input_box_grey,
                        alignSelf: 'center',
                    }}>
                        <TouchableOpacity
                            onPress={() => this.decreaseCount()}
                            style={{ height: 50, marginRight: 5, backgroundColor: 'black', borderRadius: 4, justifyContent: 'center' }}>
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
                            style={{ height: 50, marginLeft: 5, backgroundColor: 'black', borderRadius: 4, justifyContent: 'center' }}>
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
            )
        }
    }

    onSearchClickHandle() {
        if (!this.state.searchesListOpened) {
            this.setState({ searchesListOpened: true, detailView: false })
        }
    }

    updateFilteredList(filtered) {
        // Helper.DEBUG_LOG(filtered)
        this.setState({ categoriesList: [] })
        this.setState({ categoriesList: filtered })
    }

    updateSearchText(text) {
        this.setState({
            searchText: text,
            detailView: false
        })
        //Helper.DEBUG_LOG(`searchText -> ${text}`)
        if (text === '') {
            this.setState({ categoriesList: [] })
            this.setState({ categoriesList: this.state.allCategories })
            return
        }
        const newData = this.state.allVenuesNames.filter(item => {
            const itemData = item.name.toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1
        });
        //Helper.DEBUG_LOG(newData)
        this.updateFilteredList(newData)
    }

    async onSelectCategory(item) {
        if (item.isVenue === true) {
            this.setState({ searchesListOpened: false })
            this.setState({ categoriesList: this.state.allCategories })
            let index = this.state.markers.findIndex(marker => marker.id === item.id);
            const currentMarker = this.state.markers[parseInt(index)]
            this.fetchUserDistance(currentMarker)
            this.setState({
                openedVenueMarkerName: currentMarker.name,
                detailView: true,
                selectedMarkerIndex: index,
                confirm_view: false,
            })
            if (item.latitude && item.longitude) {
              this.setState({currentLat: item.latitude, currentLongt: item.longitude})
              this.map.getMapRef().animateToRegion({
                latitude: item.latitude,
                longitude: item.longitude,
                latitudeDelta: 0.0100,
                longitudeDelta: 0.0100
              })
            }
            let isFav = await Helper.isVenueFavourited(currentMarker.id)

            this.setState({ isFavouriteOpendMarker: isFav })
            this.setIconColor(isFav)

            let isQueued = await Helper.isAlreadyInQueue(currentMarker.id)
            this.setState({ isSelectedAlreadyQueued: isQueued })
        } else {
            // Helper.DEBUG_LOG(`Selection -> ${item.name}`)
            this.setState({ searchesListOpened: false, markers: [] })
            let filtered = await Helper.getFilteredVenues(item.name)
            //Helper.DEBUG_LOG(filtered)
            this.setState({ markers: filtered })
        }
        this.setState({ openedVenueMarkerName: item.name })
    }

    showSearchesList() {
        if (this.state.searchesListOpened) {
            let listHeight = (HIGHT_SCREEN / 2) + 100
            return (
                <FlatList
                    scrollEnabled={true}
                    style={{
                        flex: 1,
                        alignContent: 'center',
                        backgroundColor: colors.white,
                        paddingBottom: 20
                    }}
                    renderItem={this.renderSearchListItem}
                    data={this.state.categoriesList}
                    keyExtractor={(item, index) => index + ""}
                />
            )
        }
    }

    renderSearchListItem = ({ item, index }) => {
        return (
            <TouchableOpacity key={index} onPress={() => this.onSelectCategory(item)}>
                <View style={{
                    flex: 1,
                    height: 70,
                    backgroundColor: colors.white,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                    borderBottomWidth: item.id != this.state.categoriesList.length - 1 ? 1 : 0,
                    borderColor: colors.lightGray,
                    width: '80%'
                }}>
                    <Image
                        source={{ uri: item.url }}
                        style={{
                            resizeMode: 'contain',
                            width: 50, height: 50,
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />
                    <Text style={{
                        flex: 1,
                        fontFamily: 'Rubik-Light',
                        fontWeight: 'bold',
                        color: colors.black,
                        fontSize: 18,
                        paddingLeft: 30,
                        textAlignVertical: 'center',
                        alignSelf: 'center'
                    }}>
                        {item.name}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    showCurrentLocationText() {
        if (!this.state.searchesListOpened) {
            return (
                <View style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                }}>
                    <Text style={{ fontFamily: 'Rubik-Light', color: colors.midGray, fontSize: 10 }}>
                        {`${this.state.userCurrentLocationText} | `}
                    </Text>

                    <Text style={{
                        color: colors.black,
                        fontFamily: 'Rubik-Medium',
                        fontSize: 10,
                        alignContent: 'flex-start',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start'
                    }}>
                        {this.state.openedVenueMarkerName}
                    </Text>
                </View>
            )
        }
    }

    showEditText() {
        if (this.state.searchesListOpened) {
            return (
                <TextInput
                    style={{
                        width: '90%',
                        height: 40,
                        paddingHorizontal: 20,
                        alignSelf: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    value={this.state.searchText}
                    placeholder="Search or browse the category"
                    onChangeText={(text) => this.updateSearchText(text)}
                // defaultValue={this.state.searchText}
                // value={this.state.searchText}
                />
            )
        }
    }

    onSelectionComplete(_pesons, _pesons_detail) {
        this.setState({
            visibleContacts: false,
            personsCount: _pesons,
            persons_detail: _pesons_detail
        })
        //Helper.DEBUG_LOG(_pesons)
        //Helper.DEBUG_LOG(_pesons_detail)
    }

    showContactsList() {
        if (this.state.visibleContacts) {
            return (
                <ContactsList
                    hideContacts={() => this.setState({ visibleContacts: false })}
                    limit={this.state.venuePersonsLimit}
                    visible={this.state.visibleContacts}
                    cotactlist={this.state.contactList}
                    onSelectionComplete={(_pesons, _pesons_detail) => this.onSelectionComplete(_pesons, _pesons_detail)}
                />
            )
        }
    }

    setMargin = () => {
        this.setState({ mapMargin: 0 })
    }

    onUserLocationUpdate(event) {
        //console.log('open->-onUserLocationUpdate---')
        if (event.nativeEvent.coordinate) {
            let coordinate = event.nativeEvent.coordinate
            if (coordinate) {
                if (coordinate.latitude && coordinate.longitude) {
                    // console.log(coordinate)
                    try {
                        this.getTextAddress(coordinate.latitude, coordinate.longitude)
                    } catch (error) {
                        console.log('ERROR onUserLocationUpdate: ', error);
                    }
                }
            }
        }
        // console.log('-onUserLocationUpdate-close->')
    }

    onRegionChange(region) {
        this.setState({ region: region });
    }

    clearSearch = async () => {
        this.setState({ openedVenueMarkerName: '', searchText: '' })
        await this.findNeares()
    }

    renderCluster = (cluster, onPress) => {
      const pointCount = cluster.pointCount,
        coordinate = cluster.coordinate,
        clusterId = cluster.clusterId

      return (
        <Marker coordinate={coordinate} onPress={onPress} key={clusterId} zIndex={this.zIndex++}>
          <View style={styles.clusterContainer}>
            <View style={styles.clusterStyle}>
              <Text style={styles.clusterTextStyle}>
                {pointCount}
              </Text>
            </View>
          </View>
        </Marker>
      )
    }

    renderMarker = (item)  => {
      return (
        this.state.refreshh?
          <Marker
            key={item.id}
            onPress={(event) => this.handleMarkerPress(event)}
            identifier={item.id.toString()}
            moveOnMarkerPress={false}
            coordinate={this.getLatLong(item)}>
            {this.customMarkerView(item)}
          </Marker> :
          <Marker
            key={item.id}
            onPress={(event) => this.handleMarkerPress(event)}
            identifier={item.id.toString()}
            moveOnMarkerPress={false}
            coordinate={this.getLatLong(item)}>
            {this.customMarkerView(item)}
          </Marker>
      )
    }

    render() {
      const {markers} = this.state
        return (
            <View style={styles.container}>

                {
                    this.state.isLoading ? <ProgressDialog title='Please wait' message={this.state.loaderMessage} /> : null
                }
                {/* <MapView
                    ref={(map) => { this.map = map; }}
                    onMapReady={this.setMargin}
                    // style={{ ...StyleSheet.absoluteFillObject, marginBottom: this.state.mapMargin, backgroundColor: '#F8F9F9' }}
                    onPress={(event) => this.handleMarkerPress(event)}
                    moveOnMarkerPress={false}
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={styles.map}
                    // onRegionChange={(region) => this.setState({ region })}
                    // followsUserLocation={true}
                    // loadingEnabled={true}
                    // followUserLocation={true}
                    // onRegionChangeComplete={region => this.setState({region:region})}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    userLocationPriority={"high"}
                    showsBuildings={false}
                    showsTraffic={false}
                    userLocationFastestInterval={600000}
                    // region={this.state.region}
                    // pitchEnabled={true}
                    initialRegion={{
                        latitude: this.state.currentLat?this.state.currentLat:Helper.HARDCODED_LATS,
                        longitude: this.state.currentLongt?this.state.currentLongt:Helper.HARDCODED_LONGTS,
                        latitudeDelta: 0.0100,
                        longitudeDelta: 0.0100
                    }}
                    customMapStyle={customStyle}
                    onUserLocationChange={event => this.onUserLocationUpdate(event)}
                >
                    {this.state.refreshh?
                      markers.map((marker, index) => (
                        <Marker
                            key={index}
                            onPress={(event) => this.handleMarkerPress(event)}
                            identifier={index.toString()}
                            moveOnMarkerPress={false}
                            coordinate={this.getLatLong(marker)}
                            //title={marker.title}
                            //description={marker.description}
                        >
                            {this.customMarkerView(marker)}
                        </Marker>
                    )):
                    markers.map((marker, index) => (
                      <Marker
                          key={index}
                          onPress={(event) => this.handleMarkerPress(event)}
                          identifier={index.toString()}
                          moveOnMarkerPress={false}
                          coordinate={this.getLatLong(marker)}
                          //title={marker.title}
                          //description={marker.description}
                      >
                          {this.customMarkerView(marker)}
                      </Marker>
                  ))
                  }
                </MapView> */}
                <ClusteredMapView
                  data={markers}
                  ref={(r) => { this.map = r }}
                  onMapReady={this.setMargin}
                  onPress={(event) => this.handleMarkerPress(event)}
                  moveOnMarkerPress={false}
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                  userLocationPriority={"high"}
                  showsBuildings={false}
                  showsTraffic={false}
                  userLocationFastestInterval={600000}
                  initialRegion={{
                      latitude: this.state.currentLat ? this.state.currentLat : Helper.HARDCODED_LATS,
                      longitude: this.state.currentLongt ? this.state.currentLongt : Helper.HARDCODED_LONGTS,
                      latitudeDelta: 0.0100,
                      longitudeDelta: 0.0100
                  }}
                  zoomEnabled={true}
                  minZoom={1}
                  maxZoom={20}
                  customMapStyle={customStyle}
                  onUserLocationChange={event => this.onUserLocationUpdate(event)}
                  renderMarker={this.renderMarker}
                  renderCluster={this.renderCluster} />
                {/* <ContactsList
                    visibleContacts={this.state.visibleContacts}
                    contacts={this.state.contactList}
                /> */}
                {/* {this.showContactsList()} */}
                <Card style={{
                    position: 'absolute',
                    top: Platform.OS == 'ios' ? 80 : 50,
                    width: '80%',
                    backgroundColor: '#ffffff',
                    alignSelf: 'center',
                    left: 15
                }}>
                    <View style={{justifyContent: 'center', alignContent: 'center'}}>
                        <TouchableOpacity onPress={() => this.onSearchClickHandle()}>
                            <View style={{flexDirection: 'row', height: 40, flex: 1,}}>
                                <Image
                                    style={{ tintColor: colors.lightGray, width: 30, height: 30, alignSelf: 'center', alignContent: 'center', marginLeft: 10 }}
                                    source={require('../images/arrow_location.png')}
                                />
                                {this.showCurrentLocationText()}
                                {this.showEditText()}
                            </View>
                        </TouchableOpacity>

                        {this.state.openedVenueMarkerName ?
                            <TouchableOpacity
                                onPress={() => this.clearSearch()}
                                style={{ position: 'absolute', right: 8, alignSelf: 'center' }}>
                                <Image
                                    style={{ width: 15, height: 15 }}
                                    source={require('../images/cross.jpg')}
                                />
                            </TouchableOpacity>
                            :
                            <View style={{ position: 'absolute', right: 8, alignSelf: 'center' }}>
                                <Image
                                    style={{ width: 20, height: 20 }}
                                    source={require('../images/search.png')}
                                />
                            </View>
                        }

                        {this.showSearchesList()}
                    </View>
                </Card>

                <Card style={{ height: 40, width: 40, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: Platform.OS == 'ios' ? 80 : 50, right: 12 }}>
                    <TouchableOpacity onPress={() => this.reloadCurrentLocation()}>
                        <Image
                            style={{ width: 20, height: 20 }}
                            source={require('../images/my_location.png')}
                        />
                    </TouchableOpacity>
                </Card>

                <View style={{
                    position: 'absolute',
                    top: 140,
                    width: '90%',
                    alignSelf: 'center'
                }}>
                    {this.showDetailMarker(this.state.markers[0])}
                </View>
            </View>
        );
    }

    ////////FCM/////////////////////////////////////
    //
    //
    //
    /////////////////////////////////////////

    // const [permissions, setPermissions] = useState({});


    onRegister(token) {
        if (token) {
            console.log('onRegister--')
            this.postDeviceToken(token)
        } else {
            this.postDeviceToken(Helper.DEVICE_TOKEN)
        }
        /// this.setState({registerToken: token.token, fcmRegistered: true});
    }

    // async onNotif(notif) {
    //     //alert('onNotif')
    //     if (notif) {
    //         if (notif.data) {
    //             if (notif.data.type) {
    //                 if (notif.data.type === 'notify') {

    //                     try {
    //                         let user = await Helper.getUser()
    //                         const PAYLOAD = await getUserWaitingListWithHistory(user.id)
    //                         PostRequest(GET_USER_WAITING_LIST, PAYLOAD).then((jsonObject) => {

    //                             if (jsonObject.success) {
    //                                 Helper.updateUserQueList(jsonObject.apiResponse)
    //                                 //this.updateWaitingListState()
    //                             }
    //                         })
    //                     } catch (error) {

    //                     }
    //                     alert(`${notif.title} \n ${notif.message}`);
    //                 }
    //             }
    //         }
    //     }
    // }
    async FetchDataWhenNotified() {
        try {
            let user = await Helper.getUser()
            const PAYLOAD = await getUserWaitingListWithHistory(user.id)
            PostRequest(GET_USER_WAITING_LIST, PAYLOAD).then((jsonObject) => {

                if (jsonObject.success) {
                    Helper.updateUserQueList(jsonObject.apiResponse)
                    setTimeout(() => refWaitList.updateState(), 2000)

                    //this.updateWaitingListState()
                }
            })
        } catch (error) {

        }
    }
    handlePerm(perms) {
        alert('Permissions', JSON.stringify(perms));
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

        let user = await Helper.getUser()

        const PAYLOAD = await registerDeviceToken(user.id, platform == 'android' ? fcmToken.token : fcmToken, platform, 2)
        PostRequest(REGISTER_DEVICE, PAYLOAD).then((jsonObject) => {
            console.log('success posted -> ')
            // if (jsonObject.success) {
            // }
        })
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        height: '100%',
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#F8F9F9'
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#F8F9F9'
    },
    clusterContainer: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    clusterStyle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    clusterTextStyle: {
      fontSize: 13,
      color: 'white',
      fontWeight: '600',
      textAlign: 'center',
    },
});
