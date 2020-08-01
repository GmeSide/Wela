import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Image,
    Text,
    PermissionsAndroid,
    Platform
} from 'react-native';
// import crashlytics from '@react-native-firebase/crashlytics';
import Helper from '../utils/Helper.js'
import { PostRequest, showToastMessage } from '../network/ApiRequest.js';
import { GET_FAVOURITE, GET_USER_WAITING_LIST } from '../network/EndPoints';
import { getAllFavourite, getUserWaitingListWithHistory } from '../network/PostDataPayloads';
import Geolocation from '@react-native-community/geolocation';


export default class Splash extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            permissionGranted: false,
            userAction: false
        }
        this.props.navigation.addListener('willFocus', this.componentWillFocus)
    }
    componentWillFocus = async () => {
        if (Platform.OS == 'android') {
           
        } else {
            Geolocation.requestAuthorization()
        }
    }

    async fetchFavourites(user) {
        const PAYLOAD = await getAllFavourite(user.id)
        PostRequest(GET_FAVOURITE, PAYLOAD).then((jsonObject) => {
            Helper.DEBUG_LOG(jsonObject.apiResponse)
            if (jsonObject.success) {
                Helper.updateFavoritesList(jsonObject.apiResponse.data)
            }
            this.fetchUserQues(user)
        })
    }
    async fetchUserQues(user) {
        const PAYLOAD = await getUserWaitingListWithHistory(user.id)
        PostRequest(GET_USER_WAITING_LIST, PAYLOAD).then((jsonObject) => {
            Helper.DEBUG_LOG(jsonObject.apiResponse)
            if (jsonObject.success) {
                 Helper.updateUserQueList(jsonObject.apiResponse)
            }
            this.props.navigation.navigate('Home')
        })
    }
    async componentDidMount() {
        let userLoggedIn = await Helper.isUserLoggedIn()
       // Helper.DEBUG_LOG(userLoggedIn)
        this.setState({ isLoggedIn: userLoggedIn })
        let user = await Helper.getUser()
        //Helper.DEBUG_LOG(user)
        if (this.state.isLoggedIn) {
            this.props.navigation.navigate('Home')
            //this.fetchFavourites(user)
        } else {
            //Geolocation.requestAuthorization()
            setTimeout(() => { this.props.navigation.navigate('LoginOptions') }, 4000)
        }
        // await crashlytics().setCrashlyticsCollectionEnabled(true)
        //crashlytics().recordError("Test error");
        //crashlytics().crash()

      
    }


    render() {

        console.disableYellowBox = true
        return (
            <View style={splashstyle.splash_main_view}>
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignContent: 'center',
                    alignItems: "center",
                    flexDirection: 'column'
                }}>

                    <Animated.Image
                        style={{ height: 50, width: 200 }}
                        source={require('./images/logo.png')}
                    />
                    <Text style={{ fontFamily: 'Rubik-Light', color: '#000000', marginTop: 4 }}>
                        Wait Conveniently
                        </Text>

                </View>
            </View>
        )
    }
}
const splashstyle = StyleSheet.create({
    splash_main_view: {
        width: "100%",
        height: '100%',
    },
    splash_background_image: {
        width: "100%",
        height: "100%",
        // opacity: 0.7,
        alignSelf: 'center'
    },

})
