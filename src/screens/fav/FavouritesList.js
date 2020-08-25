import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Platform,
    Dimensions,
    Image,
    ImageBackground,
    RefreshControl,
    BackHandler
} from 'react-native';
import { Card } from 'react-native-shadow-cards';
import { colors } from '../../common/AppColors';
import ProgressDialog from '../../utils/ProgressDialog';

import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { GET_FAVOURITE, ADD_TO_FAVOUITE } from '../../network/EndPoints';
import { getAllFavourite, removeFavourite } from '../../network/PostDataPayloads';
import Helper from '../../utils/Helper';

const WIDTH_HALF_SCREEN = (Dimensions.get('window').width / 4) * 3;
const HIGHT_HALF_SCREEN = (Dimensions.get('window').height / 4) * 2;

export default class FavouritesList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingMessage: 'Fetching',
            isLoading: false,
            isRefreshing: false,
            email: '',
            password: '',
            dataSource: []
        }
        this.props.navigation.addListener('willFocus', this.componentWillFocus)
    }

    componentWillFocus = async() => {
      console.log('FavouritesList FOCUSED');
      await this.fetchData()
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
    }
    handleBackButton() {
        console.log('handleBackButton IN.');
          BackHandler.exitApp();
      }
    showLoader(message) { this.setState({ isLoading: true, loaderMessage: message }) }
    hideLoader() { this.setState({ isLoading: false }) }

    async onRemoveFavourite(venue_id) {
        const filteredData = await this.state.dataSource.filter(item => item.venue_id !== venue_id);
        Helper.DEBUG_LOG('----')
        Helper.DEBUG_LOG(filteredData)
        Helper.DEBUG_LOG('-----')
        this.setState({ dataSource: filteredData });
        //this.showLoader("Unfav..")
        const PAYLOAD = await removeFavourite(venue_id)
        PostRequest(ADD_TO_FAVOUITE, PAYLOAD).then((jsonObject) => {
            // this.hideLoader()
            if (jsonObject.success) {
                Helper.userFavouritesVenue = jsonObject.apiResponse.data
                //this.setState({ dataSource: jsonObject.apiResponse.data })
                //showToastMessage(jsonObject.apiResponse.message)
            }
        })
    }

    async onRefresh() {
        this.setState({ isRefreshing: true })
        this.loadDataFromServer()
    }
    async loadDataFromServer() {

        const PAYLOAD = await getAllFavourite()
        PostRequest(GET_FAVOURITE, PAYLOAD).then((jsonObject) => {
            this.hideLoader()
            if (jsonObject.success) {
                Helper.userFavouritesVenue = jsonObject.apiResponse.data
                this.setState({ dataSource: Helper.userFavouritesVenue })

            } else {
                Helper.userFavouritesVenue = []
                this.setState({ dataSource: Helper.userFavouritesVenue })
            }
            this.setState({ isRefreshing: false })
        })
    }
    async fetchData() {
        this.setState({ dataSource: Helper.userFavouritesVenue })

    }

    renderItem = ({ item, index }) => {
        return (

            <Card
                key={index}
                elevation={4}
                style={{ padding: 20, margin: 10, }}>
                <TouchableOpacity >
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
                                    color: colors.black,
                                    fontWeight: 'bold',
                                    paddingLeft: 4,
                                    flex: 1,
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                    fontFamily: 'Rubik-Light'
                                }}>
                                {item.business_name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => this.onRemoveFavourite(item.venue_id)}
                            >
                                <Image
                                    style={{
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        alignSelf: 'center',
                                        height: 20,
                                        width: 20,
                                        tintColor: colors.black
                                    }}
                                    source={require('../images/fav_heart.png')}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.darkGray, paddingLeft: 4 }}>{item.average_wait_time} minute wait</Text>

                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.black, paddingLeft: 4, maxWidth:'70%' }}>{item.business_address}</Text>
                            <Text style={{ fontFamily: 'Rubik-Light', fontSize: 12, color: colors.lightGray, paddingLeft: 4 }}>1 k away</Text>
                        </View>

                    </View>
                </TouchableOpacity>
            </Card>
        );
    };

    showNoDataError() {
        if (!this.state.dataSource || this.state.dataSource.length < 1) {
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

    render() {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'column',
                backgroundColor: colors.light_blue
            }}>

                {
                    this.state.isLoading ? <ProgressDialog title='Please wait' message={this.state.loadingMessage} /> : null
                }

                <ImageBackground source={require('../images/bg_screen.png')} style={styles.image}>

                    <View style={{
                        flex: 1,
                        flexDirection: 'column', position: 'absolute',
                        top: Platform.OS == 'ios' ? 70 : 30,
                        backgroundColor: 'transparent'
                    }}>
                        <Text style={{
                            fontFamily: 'Rubik-Light',
                            alignSelf: 'flex-start',
                            alignContent: 'flex-start', color: colors.white, paddingLeft: 10, fontSize: 22, fontWeight: 'bold'
                        }}>Favourites</Text>
                        <FlatList
                            scrollEnabled={true}
                            style={{
                                height: Dimensions.get('window').height,
                                alignContent: 'center',
                                backgroundColor: 'transparent'
                            }}
                            renderItem={this.renderItem}
                            data={this.state.dataSource}
                            refreshControl={<RefreshControl
                            colors={["#9Bd35A", "#689F38"]}
                            refreshing={this.state.isRefreshing}
                            onRefresh={() => this.onRefresh()} />}
                            keyExtractor={(item, index) => index + ""}
                        />


                    </View>
                    {this.showNoDataError()}
                </ImageBackground>
            </View>

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
    }
});
