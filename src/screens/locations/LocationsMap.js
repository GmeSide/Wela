import React, { Component } from 'react';
// import MapView from 'react-native-maps';
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
// import messaging from '@react-native-firebase/messaging';
import Geolocation from '@react-native-community/geolocation';
import Helper from '../../utils/Helper.js'
import PushNotification from 'react-native-push-notification';
import ContactsList from './ContactsList'
import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { GET_FAVOURITE, ADD_RQUEST_TO_VENUE, ADD_TO_FAVOUITE, REGISTER_DEVICE, GET_USER_WAITING_LIST } from '../../network/EndPoints';
import { getAllFavourite, addVenueToQueueList, addToFavourite, removeFavourite, registerDeviceToken, getUserWaitingListWithHistory } from '../../network/PostDataPayloads';
import Contacts from 'react-native-contacts';
import Geocoder from 'react-native-geocoder';
import NotifService from '../venue/NotifService';
import { NavigationEvents } from "react-navigation";
import WaitingList from '../waiting/WaitingList.js';
import IHAKPicker from "./ihakpicker";
import PushNotificationIOS from "@react-native-community/push-notification-ios";

var refWaitList = null
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

export default class LocationsMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            currentLat: Helper.HARDCODED_LATS,
            currentLongt: Helper.HARDCODED_LONGTS,
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

        this.notif = new NotifService(
            this.onRegister.bind(this),
            this.onNotif.bind(this),
        );
        this.props.navigation.addListener('willFocus', this.componentWillFocus)
    }

    componentWillFocus = async () => {
      console.log('LocationsMap FOCUSED');
      await this.fetchData()
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
        if (Platform.OS == 'ios') {
            PushNotification.configure({

                // // (optional) Called when Token is generated (iOS and Android)
                // onRegister: function(token) {
                //     console.log( 'TOKEN:', token );
                // },

                // // (required) Called when a remote or local notification is opened or received
                // onNotification: function(notification) {
                //     console.log( 'NOTIFICATION:', notification );
                // },

                // // ANDROID ONLY: (optional) GCM Sender ID.
                // senderID: "YOUR GCM SENDER ID",

                // IOS ONLY (optional): default: all - Permissions to register.
                permissions: {
                    alert: true,
                    badge: true,
                    sound: true
                },

                // Should the initial notification be popped automatically
                // default: true
                popInitialNotification: true,

                /**
                  * IOS ONLY: (optional) default: true
                  * - Specified if permissions will requested or not,
                  * - if not, you must call PushNotificationsHandler.requestPermissions() later
                  */
                requestPermissions: true,
            });
            PushNotificationIOS.requestPermissions()
            PushNotificationIOS.getInitialNotification()
        }



    }
    handleBackButton() {
        console.log('handleBackButton IN.');
          BackHandler.exitApp();
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

    async reloadCurrentLocation() {
        let location = await Helper.getUserCurrentLocation()
        try {
            this.setState({ userCurrentLocationText: '' })
            this.getTextAddress(location.latitude, location.longitude)
        } catch (error) {

        }
        if (location && location != null) {
            this.setState({
                currentLat: location.latitude,
                currentLongt: location.longitude
            });
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
            Helper.DEBUG_LOG(this.state.venuePersonsLimit)
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
                // this.findNeares()
            } else {
                this.requestCameraPermission()
            }

        } else {
            Geolocation.requestAuthorization()

        }
        Geocoder.fallbackToGoogle('AIzaSyCb3txixm6dLD7YTal0QsPEUV64XbxtXo0');
        this.onRegister()
        // this.requestUserPermission()
        if (this.state.detailView == true) {
            const currentMarker = this.state.markers[parseInt(this.state.selectedMarkerIndex)]
            let isFav = await Helper.isVenueFavourited(currentMarker.id)
            this.setState({ isFavouriteOpendMarker: isFav })
            this.setIconColor(isFav)

            let isQueued = await Helper.isAlreadyInQueue(currentMarker.id)
            this.setState({ isSelectedAlreadyQueued: isQueued })
        }


        //Helper.DEBUG_LOG(categories)

        this.findNeares()



    }

    async getTextAddress(latitude, longitude) {
        try {
            if (latitude && longitude) {


                var NY = {
                    lat: latitude,
                    lng: longitude
                };
                const res = await Geocoder.geocodePosition(NY);
                Helper.DEBUG_LOG('--Geocoder--')
                Helper.DEBUG_LOG(res)
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

    async findNeares() {
        let location = await Helper.getUserCurrentLocation()
        try {
            this.getTextAddress(location.latitude, location.longitude)
        } catch (error) {

        }

        let categories = await Helper.getVenueCategories()
        this.setState({ categoriesList: categories, allCategories: categories })
        if (location && location != null) {
            if (Helper.HARDCODED_LOCATION_SHOW == false) {
                this.setState({
                    currentLat: location.latitude,
                    currentLongt: location.longitude
                });
            }


            let nearestVenues = await Helper.getNearestVenues(location)
            Helper.DEBUG_LOG(nearestVenues)
            if (nearestVenues && nearestVenues.length > 0) {
                this.setState({
                    markers: nearestVenues
                });
                let venuesNames = await Helper.getVenueCategoriesByLocation(nearestVenues)
                this.setState({ filteredVenuesNames: venuesNames, allVenuesNames: venuesNames })
            }
        }
    }

    async onConfirmAction(marker) {
        // var detail = this.state.persons_detail

        // if (this.state.personsCount == 1) {
        //     let user = await Helper.getUser()
        //     detail = user.name + ":" + user.phone
        // } else {
        //     let user = await Helper.getUser()
        //     var loggedInUser = user.name + ":" + user.phone
        //     detail = loggedInUser + "," + detail
        // }
        //this.setState({ isLoading: true })
        this.setState({ isLoading: false, detailView: false, gpsRequestSent: false })
        const PAYLOAD = await addVenueToQueueList(marker.id, this.state.personsCount)
        PostRequest(ADD_RQUEST_TO_VENUE, PAYLOAD).then((jsonObject) => {
            //this.setState({ isLoading: false })
            if (jsonObject.success) {
                showToastMessage("", jsonObject.apiResponse.message)
                Helper.updateUserQueList(jsonObject.apiResponse)
                // Helper.DEBUG_LOG(jsonObject.apiResponse)
                //Helper.updateUserQueList(jsonObject.apiResponse)
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
                                    {marker.name}
                                </Text>
                                {/* {this.shareAndFavOptions(item)} */}

                            </View>
                            <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.darkGray, paddingLeft: 4 }}>{this.getAverageWaitTimeByMarker(marker)}</Text>
                            {/* {this.innerViewOfRow(item)} */}
                        </View>
                    </TouchableOpacity>
                </Card>
            );
        }

    };


    setIconColor(isFav) {
        Helper.DEBUG_LOG(isFav)
        if (isFav == true) {
            this.setState({ faveIconColorCode: colors.black })
        } else {
            this.setState({ faveIconColorCode: colors.lightGray })
        }
    }
    async handleMarkerPress(event) {
        if (this.state.searchesListOpened === true) {
            this.setState({ searchesListOpened: false })
        }

        // this.setState({ searchesListOpened: false })
        if (
            event.nativeEvent.action === 'marker-press'
        ) {
            console.log('onMarker->')
            const markerID = event.nativeEvent.id
            console.log(markerID)
            const currentMarker = this.state.markers[parseInt(markerID)]
            this.setState({
                openedVenueMarkerName: currentMarker.name,
                detailView: true,
                selectedMarkerIndex: markerID,
                confirm_view: false
            })
            let isFav = await Helper.isVenueFavourited(currentMarker.id)

            this.setState({ isFavouriteOpendMarker: isFav })
            this.setIconColor(isFav)

            let isQueued = await Helper.isAlreadyInQueue(currentMarker.id)
            this.setState({ isSelectedAlreadyQueued: isQueued })

            Helper.DEBUG_LOG(isFav)
        } else {
            console.log('onMap->')
            // this.setState({ gpsRequestSent: false })
            if (this.state.detailView) {
                this.setState({
                    detailView: false,
                    confirm_view: false,
                    searchesListOpened: false,
                    personsCount: 1,
                    persons_detail: ''
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
        Helper.DEBUG_LOG(status)
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
        Helper.DEBUG_LOG(status)
        this.setState({ faveIconColorCode: colors.black })
    }
    async fetchUserDistance(mMarker) {
        try {
            let distance = await Helper.calculateSingleVenueDistance(mMarker.latitude, mMarker.longitude)
            Helper.DEBUG_LOG(mMarker)
            Helper.DEBUG_LOG(distance)
            this.setState({ currentMarkerDistance: `${Number(distance).toFixed(2)} km away` })
        } catch (error) {

        }
    }
    showDetailMarker() {
        if (this.state.detailView) {
            if (this.state.markers && this.state.markers.length > 0) {
                const mMarker = this.state.markers[parseInt(this.state.selectedMarkerIndex)]
                // this.setState({ venuePersonsLimit: mMarker.limit_group })
                //this.favIconColor(mMarker.favourite)
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
                                        {mMarker.name}
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
        if (!this.state.gpsRequestSent) {
            this.setState({ gpsRequestSent: true })
            this.fetchUserDistance(mMarker)
        }
        if (this.state.lineUped) {
            return (
                <View style={{
                    flexDirection: 'column',
                    marginTop: 10

                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontFamily: 'Rubik-Light', flex: 1, fontSize: 12, color: colors.black, paddingLeft: 4 }}>{this.state.markers[parseInt(this.state.selectedMarkerIndex)].location}</Text>
                        <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.lightGray, paddingLeft: 4 }}>{this.state.currentMarkerDistance}</Text>
                    </View>
                    {this.lineUpView()}
                    {this.confirmView()}

                </View>
            )
        }
    }

    requestToLineUp() {
        if (this.state.isSelectedAlreadyQueued === false) {
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

    lineUpView() {
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
                        onButtonPress={() => this.requestToLineUp()}
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
                            text={'Confirm'} />
                    </View>


                    {/* <TouchableOpacity onPress={() => { this.onContactListRequest() }}> */}

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
                        <View style={{
                            height: 50,
                            marginRight: 5,
                            flexDirection: 'column',


                        }}>
                            <TouchableOpacity
                                onPress={() => this.increaseCount()}
                            >
                                <Text style={{
                                    fontSize: 20,
                                    fontFamily: 'Rubik-Light',
                                    fontWeight: 'bold',
                                    color: this.getPlusButtonColor(),
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
                                    fontFamily: 'Rubik-Light',
                                    fontWeight: 'bold',
                                    color: this.getMinusButtonColor(),
                                    paddingLeft: 4,
                                    height: 25,
                                    alignItems: "flex-end",
                                    justifyContent: 'flex-end',
                                    alignContent: 'flex-end',
                                    alignSelf: 'flex-end'
                                }}>-</Text>
                            </TouchableOpacity>

                        </View>
                        {/* <Text style={{
                                fontSize: 16,
                                fontFamily: 'Rubik-Light',
                                fontWeight: 'bold',
                                color: colors.black,
                                paddingLeft: 4
                            }}>{this.state.personsCount}</Text> */}

                    </View>
                    {/* </TouchableOpacity> */}
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
        Helper.DEBUG_LOG(filtered)
        this.setState({ categoriesList: [] })
        this.setState({ categoriesList: filtered })
    }
    updateSearchText(text) {
        this.setState({
            searchText: text,
            detailView: false
        })
        Helper.DEBUG_LOG(`searchText -> ${text}`)
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
        Helper.DEBUG_LOG(newData)
        this.updateFilteredList(newData)

    }
    async onSelectCategory(item) {

        if (item.isVenue === true) {
            this.setState({ searchesListOpened: false })
            this.setState({ categoriesList: this.state.allCategories })
            let index = this.state.markers.findIndex(marker => marker.id === item.id);
            const currentMarker = this.state.markers[parseInt(index)]
            this.setState({
                openedVenueMarkerName: currentMarker.name,
                detailView: true,
                selectedMarkerIndex: index,
                confirm_view: false
            })
            let isFav = await Helper.isVenueFavourited(currentMarker.id)

            this.setState({ isFavouriteOpendMarker: isFav })
            this.setIconColor(isFav)

            let isQueued = await Helper.isAlreadyInQueue(currentMarker.id)
            this.setState({ isSelectedAlreadyQueued: isQueued })
        } else {
            Helper.DEBUG_LOG(`Selection -> ${item.name}`)
            this.setState({ searchesListOpened: false, markers: [] })
            let filtered = await Helper.getFilteredVenues(item.name)
            Helper.DEBUG_LOG(filtered)
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
                    keyExtractor={(item) => item}
                />
            )
        }
    }

    renderSearchListItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.onSelectCategory(item)}>
                <View style={{
                    flex: 1,
                    height: 70,
                    backgroundColor: colors.white,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                    borderBottomWidth: item.id != this.state.categoriesList.length - 1? 1 : 0,
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
                        fontFamily: 'Rubik-Light',
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
                    placeholder="Type here to search or brows the category"
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
        Helper.DEBUG_LOG(_pesons)
        Helper.DEBUG_LOG(_pesons_detail)
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
        console.log('open->-onUserLocationUpdate---')
        if (event.nativeEvent.coordinate) {
            let coordinate = event.nativeEvent.coordinate
            if (coordinate) {
                if (coordinate.latitude && coordinate.longitude) {
                    console.log(coordinate)
                    try {
                        this.getTextAddress(coordinate.latitude, coordinate.longitude)
                    } catch (error) {

                    }
                }

            }

        }



        console.log('-onUserLocationUpdate-close->')
    }

    getPlusButtonColor() {
        const mMarker = this.state.markers[parseInt(this.state.selectedMarkerIndex)]
        if (this.state.personsCount < mMarker.limit_group) {
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
    onRegionChange(region) {
        this.setState({ region: region });
    }
    render() {
        return (

            <View style={styles.container}>

                <WaitingList ref={ref => (refWaitList = ref)} />
                <MapView
                    onMapReady={this.setMargin}
                    style={{ ...StyleSheet.absoluteFillObject, marginBottom: this.state.mapMargin, backgroundColor: '#F8F9F9' }}
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
                        latitude: this.state.currentLat,
                        longitude: this.state.currentLongt,
                        latitudeDelta: 0.010,
                        longitudeDelta: 0.010
                    }}
                    region={{
                        latitude: this.state.currentLat,
                        longitude: this.state.currentLongt,
                        latitudeDelta: 0.010,
                        longitudeDelta: 0.010
                    }}
                    customMapStyle={customStyle}
                    onUserLocationChange={event => this.onUserLocationUpdate(event)}
                >

                    {this.state.markers.map((marker, index) => (

                        <Marker
                            onPress={(event) => this.handleMarkerPress(event)}
                            identifier={index.toString()}
                            moveOnMarkerPress={false}
                            coordinate={this.getLatLong(marker)}
                        //title={marker.title}
                        //description={marker.description}
                        >
                            {this.customMarkerView(marker)}
                        </Marker>
                    ))}

                </MapView>
                {/* <ContactsList
                    visibleContacts={this.state.visibleContacts}
                    contacts={this.state.contactList}
                /> */}
                {/* {this.showContactsList()} */}
                <Card style={{
                    position: 'absolute',
                    top: Platform.OS == 'ios' ? 80 : 50,
                    width: '90%',
                    backgroundColor: '#ffffff',
                    alignSelf: 'center'
                }}>
                    <View style={{
                        justifyContent: 'center',
                        alignContent: 'center'
                    }}>
                        <TouchableOpacity
                            onPress={() => this.onSearchClickHandle()}
                        >

                            <View style={{
                                flexDirection: 'row',
                                height: 40,
                                flex: 1,
                            }}>
                                <Image
                                    style={{ tintColor: colors.lightGray, width: 30, height: 30, alignSelf: 'center', alignContent: 'center', marginLeft: 10 }}
                                    source={require('../images/arrow_location.png')}
                                />
                                {this.showCurrentLocationText()}
                                {this.showEditText()}

                            </View>
                        </TouchableOpacity>

                        <View style={{
                            position: 'absolute',
                            right: 8,
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignContent: 'center'
                        }}>
                            <TouchableOpacity onPress={() => this.reloadCurrentLocation()}>

                                <Image
                                    style={{
                                        width: 20,
                                        height: 20,
                                    }}
                                    source={require('../images/my_location.png')}
                                />
                            </TouchableOpacity>
                        </View>
                        {this.showSearchesList()}
                    </View>
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
            console.log(token)
            this.postDeviceToken(token)
        } else {
            this.postDeviceToken(Helper.DEVICE_TOKEN)
        }
        /// this.setState({registerToken: token.token, fcmRegistered: true});
    }

    async onNotif(notif) {
        if (notif) {
            if (notif.data) {
                if (notif.data.type) {
                    if (notif.data.type === 'notify') {

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
                        alert(`${notif.title} \n ${notif.message}`);



                    }

                }
            }
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
        Helper.saveDeviceFcmToken(fcmToken.token)
        //let userType = await Helper.getUserType()
        let platform = Platform.OS
        let user = await Helper.getUser()

        const PAYLOAD = await registerDeviceToken(user.id, fcmToken.token, platform, 2)
        PostRequest(REGISTER_DEVICE, PAYLOAD).then((jsonObject) => {
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
});
