/* @flow */
import React, { Component } from 'react';
import { BackHandler, Dimensions, FlatList, Image, ImageBackground, RefreshControl, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Card } from 'react-native-shadow-cards';
import { NavigationEvents } from "react-navigation";
import { colors } from '../../common/AppColors';
import Button from '../../common/BlackButton';
import { PostRequest } from '../../network/ApiRequest.js';
import { ADD_TO_FAVOUITE, CANCEL_WAITING_LIST_BY_USER, GET_USER_WAITING_LIST } from '../../network/EndPoints';
import { addToFavourite, getUserWaitingListWithHistory, removeFavourite, updateVenueQueListByUser } from '../../network/PostDataPayloads';
import Helper from '../../utils/Helper';
import ProgressDialog from '../../utils/ProgressDialog';

export default class WaitingList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            enableScrollViewScroll: true,
            isRefreshing: false,
            isLoading: false,
            loaderMessage: 'Wait..',
            expanded: false,
            email: '',
            password: '',
            dataCurrentlyWaiting: [],
            dataLastThirtyDays: [],
            statuses: []
        }
        // this.notif = new NotifService(
        //     this.onNotif.bind(this),
        // );
        this.updateState = this.updateState.bind(this);
        // this.props.navigation.addListener('willFocus', this.componentWillFocus)
    }

    updateState() {
        var _emptyCurrentWaiting = []
        // var _emptyHistory = []
        this.setState({ dataCurrentlyWaiting: _emptyCurrentWaiting })
        this.updateSyncedData(Helper.userQueList)
    }

    componentDidMount () {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
    }

    handleBackButton() {
        console.log('handleBackButton IN.');
        BackHandler.exitApp();
    }

    // onNotif(notif) {
    //     Helper.DEBUG_LOG('In Waiting List....')
    //     alert(`${notif.title} \n ${notif.message}`);

    // }
    //------------------------------------------------------------------
    //                      CURRENTLY WAITING LIST
    //------------------------------------------------------------------

    updateCurrentlyWaitingList = (id) => {
        let itemsArr = this.state.dataCurrentlyWaiting
        var itemIndex = itemsArr.findIndex(item => id === item.id);
        itemsArr[itemIndex]['expanded'] = !itemsArr[itemIndex]['expanded'];
        this.setState({ dataCurrentlyWaiting: itemsArr })
    }

    innerViewOfRowWaitingList(item, index) {
        var statusObject = this.state.statuses[index]
        Helper.DEBUG_LOG(statusObject)
        if (item.expanded) {
            return (
                <View style={{
                    flexDirection: 'column',
                    marginTop: 10
                }}>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.black, paddingLeft: 4, maxWidth: '70%' }}>{item.venue[0].business_address}</Text>
                        <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.lightGray, paddingLeft: 10 }}>{`${Number(statusObject.distance).toFixed(2)} km away`}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <View style={{ flex: 1, flexDirection: 'row', marginRight: 2 }}>
                            <Button
                                width={'100%'}
                                onButtonPress={() => this.onCancelRequest(item, index)}
                                text={'Cancel'} />
                        </View>


                        <View style={{

                            height: 50,
                            width: 80,
                            marginLeft: 2,
                            flexDirection: 'row',
                            alignContent: 'center',
                            alignItems: 'center',
                            borderRadius: 4,
                            justifyContent: 'center',
                            backgroundColor: colors.input_box_grey,
                            alignSelf: 'center',
                        }}>
                            <Image
                                style={{
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
                            <Text style={{
                                fontSize: 16,
                                fontFamily: 'Rubik-Light',
                                fontWeight: 'bold',
                                color: colors.black,
                                paddingLeft: 4
                            }}>{item.persons}</Text>
                        </View>
                    </View>
                </View>
            )
        }
    }
    getAverageWaitTime(average_wait_time) {
        if (average_wait_time === null || average_wait_time === undefined) {
          return 'Closed'
        } else {
          return `${average_wait_time} minutes wait`
        }
    }
    //------------------------------------------------------------------
    //                      HISTORY WAITING LIST
    //------------------------------------------------------------------

    updateList = (id) => {
        let itemsArr = this.state.dataLastThirtyDays
        var itemIndex = itemsArr.findIndex(item => id === item.id);
        itemsArr[itemIndex]['expanded'] = !itemsArr[itemIndex]['expanded'];
        this.setState({ dataLastThirtyDays: itemsArr })
    }

    innerViewOfRow(item, index) {
        if (item.expanded) {
            return (
                <View style={{
                    flexDirection: 'column',
                    marginTop: 10
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontFamily: 'Rubik-Light', flex: 1, fontSize: 12, color: colors.black, paddingLeft: 4 }}>{item.venue[0].business_address}</Text>
                        {/* <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.lightGray, paddingLeft: 4 }}>1 km away</Text> */}
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <View style={{
                            opacity: 0.5,
                            flex: 1, flexDirection: 'row', marginRight: 2
                        }}>
                            <Button
                                width={'100%'}
                                disabled={true}
                                // onButtonPress={() => this.onCancelRequest(item)}
                                text={`${item.status.toUpperCase()}ED`} />
                        </View>

                        <View style={{
                            height: 50,
                            width: 80,
                            marginLeft: 2,
                            flexDirection: 'row',
                            alignContent: 'center',
                            alignItems: 'center',
                            borderRadius: 4,
                            justifyContent: 'center',
                            backgroundColor: colors.input_box_grey,
                            alignSelf: 'center',
                        }}>
                            <Image
                                style={{
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                    height: 22,
                                    width: 22,
                                    tintColor: colors.lightGray
                                }}
                                source={require('../images/users.png')}
                            />
                            <Text style={{
                                fontSize: 16,
                                fontFamily: 'Rubik-Light',
                                fontWeight: 'bold',
                                color: colors.black,
                                paddingLeft: 4
                            }}>{item.persons}</Text>

                        </View>
                    </View>
                </View>
            )
        }
    }

    bothAreEmpty() {
        let { dataCurrentlyWaiting, dataLastThirtyDays } = this.state
        if (dataCurrentlyWaiting && Array.isArray(dataCurrentlyWaiting) && dataCurrentlyWaiting.length > 0) {
            return false
        }
        if (dataLastThirtyDays && Array.isArray(dataLastThirtyDays) && dataLastThirtyDays.length > 0) {
            return false
        }
        return true
    }

    showNoDataError() {
        if (this.bothAreEmpty()) {
            return (
                <View style={{
                    alignSelf: 'center',
                    alignContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0)'
                }}>
                    <Text style={{ fontFamily: 'Rubik-Light', color: colors.lightGray }}>No content. Pull to refresh.</Text>
                </View>
            )
        }
    }

    getColor(index) {
        // let venue = item.venue[0]
        //let isFav = await Helper.isVenueFavourited(venue.id)
        // Helper.DEBUG_LOG(this.state.statuses)
        // Helper.DEBUG_LOG(this.state.statuses[index].isFav)
        if (this.state.statuses[index]) {
          if (this.state.statuses[index].isFav) {
              return colors.red
          } else {
              return colors.lightGray
          }
        } else {
          return colors.red
        }
    }

    changeStatus(index) {
        if (this.state.statuses[index].isFav == true) {
            let itemsArr = this.state.statuses
            itemsArr[index]['isFav'] = false
            this.setState({ statuses: itemsArr })
            return false
        } else {
            let itemsArr = this.state.statuses
            itemsArr[index]['isFav'] = true
            this.setState({ statuses: itemsArr })
            return true
        }
    }

    async onFavouriteClick(item, index) {
        let nextStatus = await this.changeStatus(index)

        var PAYLOAD
        if (nextStatus == true) {
            PAYLOAD = await addToFavourite(item.venue[0].id)
        } else {
            PAYLOAD = await removeFavourite(item.venue[0].id)
        }
        PostRequest(ADD_TO_FAVOUITE, PAYLOAD).then((jsonObject) => {
            if (jsonObject.success) {
                Helper.userFavouritesVenue = jsonObject.apiResponse.data
            }
        })
    }

    onShare = async (item) => {
        try {
            var url = `https://www.google.com/maps/search/?api=1&query=${item.venue[0].latitude},${item.venue[0].longitude}`

            var name = item.venue[0].business_name
            var location = item.venue[0].location
            var mMesage = `${name}, ${location} \n ${url}`
            const result = await Share.share({
                title: name,
                url: url,
                message: mMesage,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    shareAndFavOptionsHistory(item, index) {
        if (item.expanded) {
            return (
                <View style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                }}>
                    <TouchableOpacity
                        onPress={() => this.onShare(item)}
                    >
                        <Image
                            style={{
                                alignContent: 'center',
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignSelf: 'center',
                                height: 20,
                                width: 20,
                                tintColor: colors.lightGray
                            }}
                            source={require('../images/share.png')}
                        />
                    </TouchableOpacity>
                    {/* <Image
                        style={{
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            height: 20,
                            width: 20,
                            tintColor: this.getColor(index),
                            marginLeft: 10
                        }}
                        source={require('../images/fav_heart.png')}
                    /> */}
                </View>
            )
        }
    }

    shareAndFavOptions(item, index) {
        if (item.expanded) {
            return (
                <View style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',

                }}>
                    <TouchableOpacity
                        onPress={() => this.onShare(item)}
                    >
                        <Image
                            style={{
                                alignContent: 'center',
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignSelf: 'center',
                                height: 20,
                                width: 20,
                                tintColor: colors.lightGray
                            }}
                            source={require('../images/share.png')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.onFavouriteClick(item, index)}
                    >
                        <Image
                            style={{
                                alignContent: 'center',
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignSelf: 'center',
                                height: 20,
                                width: 20,
                                tintColor: this.getColor(index),
                                marginLeft: 10
                            }}
                            source={require('../images/fav_heart.png')}
                        />
                    </TouchableOpacity>
                </View>
            )
        }
    }

    //--------------APIS CALLING [FETCH LIST, UPDATE LIST BY CANCEL]

    //-- CANCEL REQUEST
    async onCancelRequest(removedItem, index) {
        const filteredData = await this.state.dataCurrentlyWaiting.filter(item => item.id !== removedItem.id);
        try {
            var cancelItem = removedItem
            cancelItem['expanded'] = false
            cancelItem['status'] = "cancel"
            Helper.DEBUG_LOG(cancelItem)
            this.setState(prevState => ({
                dataLastThirtyDays: [cancelItem, ...prevState.dataLastThirtyDays]
            }))

            // let arrayData = this.state.dataLastThirtyDays
            // arrayData.push(removedItem)
            // this.setState({ dataLastThirtyDays: arrayData });
        } catch (error) {

        }

        this.showLoader('Waiting..')
        this.setState({ dataCurrentlyWaiting: filteredData });
        const PAYLOAD = await updateVenueQueListByUser(removedItem.id, 'cancel', removedItem.venue[0].id)
        PostRequest(CANCEL_WAITING_LIST_BY_USER, PAYLOAD, true).then((jsonObject) => {
            this.hideLoader()
            if (jsonObject.success) {
                Helper.DEBUG_LOG(jsonObject.apiResponse)
                Helper.updateUserQueList(jsonObject.apiResponse)
            }
        })
    }

    //-- SYNC PRE-LOADED DATA
    async fetchData() {
        try {
            this.loadDataFromServer()
        } catch (error) {
          console.log(error);
        }

        let statuses = await Helper.getFavSatutsesForWaitingList()
        this.setState({ statuses: statuses })
        let queuesList = Helper.userQueList
        Helper.DEBUG_LOG(statuses)
        this.updateSyncedData(queuesList)
    }

    //-- PULL TO REFRESH API
    async onRefresh() {
        this.setState({ isRefreshing: true })
        this.loadDataFromServer()
    }
    async loadDataFromServer() {
        let user = await Helper.getUser()
        this.showLoader('Fetching..')
        const PAYLOAD = await getUserWaitingListWithHistory(user.id)
        PostRequest(GET_USER_WAITING_LIST, PAYLOAD).then((jsonObject) => {
            this.hideLoader()
            var objForBothList = jsonObject.apiResponse
            if (jsonObject.success) {
                Helper.updateUserQueList(objForBothList)
            }
            this.updateSyncedData(objForBothList)
            this.setState({ isRefreshing: false })
        })
    }

    async updateSyncedData(objForBothList) {
        var _emptyCurrentWaiting = []
        var _emptyHistory = []

        if (objForBothList) {
            if (objForBothList.data && Array.isArray(objForBothList.data)) {
                if (objForBothList.data.length > 0) {
                    _emptyCurrentWaiting = objForBothList.data
                }

            }
            if (objForBothList.data_history && Array.isArray(objForBothList.data_history)) {
                _emptyHistory = objForBothList.data_history
            }
        }


        this.setState({ dataCurrentlyWaiting: _emptyCurrentWaiting, dataLastThirtyDays: _emptyHistory })


    }



    showLoader(message) { this.setState({ isLoading: true, loaderMessage: message }) }
    hideLoader() { this.setState({ isLoading: false }) }
    onEnableScroll = (value) => {
        this.setState({
            enableScrollViewScroll: value,
        });
    };
    render() {
        return (
            // <View style={{
            //     flex: 1,
            //     flexDirection: 'column',
            //     backgroundColor: colors.light_blue
            // }}>
            <ImageBackground
                source={require('../images/bg_screen.png')} style={styles.image}>

                <ScrollView
                >

                    <View style={{
                        flex: 1,
                        marginTop: 50,
                        flexDirection: 'column'
                    }}>

                        {
                            this.state.isLoading ? <ProgressDialog title='Please wait' message={this.state.loaderMessage} /> : null
                        }


                        <View
                            style={{ flexDirection: 'column' }}>
                            <Text style={{ fontFamily: 'Rubik-Light', color: colors.white, paddingLeft: 10, fontSize: 18, fontWeight: 'bold' }}>Currently Waiting</Text>
                            <FlatList
                                nestedScrollEnabled={false}
                                scrollEnabled={false}
                                style={{
                                    alignContent: 'center',
                                    backgroundColor: 'transparent'
                                }}
                                renderItem={({ item, index }) => (
                                  <Card
                                    _key={index}
                                    elevation={4}
                                    style={{ padding: 8, margin: 10, width: '90%' }}>
                                    <TouchableOpacity
                                        onPress={() => this.updateCurrentlyWaitingList(item.id)}
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

                                                <View style={{ flexDirection: 'column', flex: 1, }}>
                                                    <Text
                                                        style={{
                                                            fontSize: 16,
                                                            fontFamily: 'Rubik-Light',
                                                            color: colors.black,
                                                            fontWeight: 'bold',
                                                            paddingLeft: 4,
                                                            alignContent: 'flex-start',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'flex-start',
                                                            alignSelf: 'flex-start',
                                                        }}>
                                                        {item.venue && item.venue.length > 0 ? item.venue[0].business_name : ''}
                                                    </Text>


                                                </View>
                                                {this.shareAndFavOptions(item, index)}

                                            </View>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontFamily: 'Rubik-Light',
                                                    color: colors.darkGray,
                                                    paddingLeft: 4,
                                                    alignContent: 'flex-start',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'flex-start',
                                                    alignSelf: 'flex-start',
                                                }}>
                                                {this.getAverageWaitTime(item.wait_time)}
                                            </Text>
                                            {this.innerViewOfRowWaitingList(item, index)}
                                        </View>
                                    </TouchableOpacity>
                                </Card>)}
                                // renderItem={this.renderWaitingListItem}
                                data={this.state.dataCurrentlyWaiting}
                                keyExtractor={(item, index) => index + ""}
                            />
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ fontFamily: 'Rubik-Light', color: colors.white, paddingLeft: 10, fontSize: 18, fontWeight: 'bold', marginTop: 30 }}>Last Thirty Days</Text>
                            <FlatList
                                data={this.state.dataLastThirtyDays}
                                keyExtractor={(item, index) => index + ""}
                                refreshControl={<RefreshControl
                                  colors={["#9Bd35A", "#689F38"]}
                                  refreshing={this.state.isRefreshing}
                                  onRefresh={() => this.onRefresh()} />}
                                style={{alignContent: 'center', backgroundColor: 'transparent'}}
                                renderItem={({ item, index }) => (
                                  <Card
                                    _key={index}
                                    elevation={4}
                                    style={{ padding: 8, margin: 10, width: '90%' }}>
                                    <TouchableOpacity
                                        onPress={() => this.updateList(item.id)}
                                    >
                                        <View style={{flexDirection: 'column',}}>

                                            <View style={{
                                                flexDirection: 'row',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                alignSelf: 'center',
                                            }}>

                                                <View style={{ flexDirection: 'column', flex: 1, }}>


                                                    <Text
                                                        style={{
                                                            fontSize: 16,
                                                            fontFamily: 'Rubik-Light',
                                                            color: colors.black,
                                                            fontWeight: 'bold',
                                                            paddingLeft: 4,
                                                            alignContent: 'flex-start',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'flex-start',
                                                            alignSelf: 'flex-start',
                                                        }}>
                                                        {item.venue && item.venue.length > 0 ? item.venue[0].business_name : ''}
                                                    </Text>

                                                </View>
                                                {this.shareAndFavOptionsHistory(item, index)}

                                            </View>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontFamily: 'Rubik-Light',
                                                    color: colors.darkGray,
                                                    paddingLeft: 4,
                                                    alignContent: 'flex-start',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'flex-start',
                                                    alignSelf: 'flex-start',
                                                }}>
                                                {item.created_at}
                                            </Text>
                                            {/* <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.darkGray, paddingLeft: 4 }}>{this.getAverageWaitTime(item.venue[0].average_wait_time)}</Text> */}
                                            {this.innerViewOfRow(item, item.venue && item.venue.length > 0 ? item.venue[0] : -1)}
                                        </View>
                                    </TouchableOpacity>
                                </Card>)}
                                // renderItem={({item, index}) => (this.renderItem(item, index))}
                                // renderItem={({ item, index }) => (this.renderItem(item,index))}
                                // renderItem={this.renderItem}
                            />
                        </View>
                        <NavigationEvents onDidFocus={() => this.fetchData()} />
                    </View>
                </ScrollView>
            </ImageBackground>

        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end'
    }, image: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center"
    },
});
