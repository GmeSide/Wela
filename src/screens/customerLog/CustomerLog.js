/* @flow */
import React, { Component } from 'react';

import {StyleSheet, Text, View, FlatList, TouchableOpacity, Platform, Dimensions,
  Image, ImageBackground, RefreshControl, Share, BackHandler, ScrollView} from 'react-native';
import { Card } from 'react-native-shadow-cards';
import { colors } from '../../common/AppColors';
import Button from '../../common/BlackButton';
import Helper from '../../utils/Helper';
import { getCustomerLog } from '../../network/ApiRequest.js';

import ProgressDialog from '../../utils/ProgressDialog';

import { PostRequest, showToastMessage } from '../../network/ApiRequest.js';
import { CANCEL_WAITING_LIST_BY_USER, GET_USER_WAITING_LIST, ADD_TO_FAVOUITE } from '../../network/EndPoints';
import { updateVenueQueListByUser, getUserWaitingListWithHistory, addToFavourite, removeFavourite } from '../../network/PostDataPayloads';

export default class CustomerLog extends Component {
    constructor(props) {
      super(props);
      this.state = {
        isRefreshing: false,
        isLoading: false,
        loaderMessage: 'Wait..',
        upcoming: [],
        earlierToday: [],
      }
      this.props.navigation.addListener('willFocus', this.componentWillFocus)
    }

    componentWillFocus = async () => {
      console.log('CustomerLog FOCUSED.');
      const res = await getCustomerLog()
      console.log('res: ', res);
      if (res.data.success) {
        this.setState({upcoming :res.data.data})
        this.setState({earlierToday :res.data.data_history})
      }
    }

    componentDidMount = async () => {}

    async onRefresh() {
      this.setState({ isRefreshing: true })
      console.log('onRefresh');
      this.setState({ isRefreshing: false })
    }

    render() {
      return (
        <ImageBackground source={require('../images/bg_screen.png')} style={styles.image}>
          <ScrollView>

              {
                this.state.isLoading ? <ProgressDialog title='Please wait' message={this.state.loaderMessage} /> : null
              }

              <Text style={{fontFamily: 'Rubik-Light', color: colors.white, paddingLeft: 10, fontSize: 18, fontWeight: 'bold', marginTop: 25}}>Upcoming</Text>
              <FlatList
                data={this.state.upcoming}
                keyExtractor={item => `${item}`}
                renderItem={({ item, index }) => (
                  <Card
                    elevation={4}
                    style={{ padding: 8, margin: 10, width: '90%' }}>
                    <View style={{flexDirection: 'column'}}>
                      <Text style={{
                        fontSize: 16,
                        fontFamily: 'Rubik-Light',
                        color: colors.black,
                        fontWeight: 'bold',
                        paddingLeft: 4,
                      }}>
                        {item.user}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'Rubik-Light',
                          color: colors.darkGray,
                          paddingLeft: 4,
                      }}>
                        {'Party of '+item.persons}
                      </Text>
                    </View>
                  </Card>
                )}
              />

              <Text style={{ fontFamily: 'Rubik-Light', color: colors.white, paddingLeft: 10, fontSize: 18, fontWeight: 'bold', marginTop: 30 }}>Earlier Today</Text>
              <FlatList
                data={this.state.earlierToday}
                keyExtractor={(item, index) => index}
                refreshControl={<RefreshControl
                  colors={["#9Bd35A", "#689F38"]}
                  refreshing={this.state.isRefreshing}
                  onRefresh={() => this.onRefresh()} />
                }
                renderItem={({ item, index }) => (
                  <Card
                    elevation={4}
                    style={{ padding: 8, margin: 10, width: '90%' }}>
                    <View style={{flexDirection: 'column'}}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'Rubik-Light',
                          color: colors.black,
                          fontWeight: 'bold',
                          paddingLeft: 4,
                        }}>
                        {item.user}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'Rubik-Light',
                          color: colors.darkGray,
                          paddingLeft: 4,
                          alignSelf: 'flex-start',
                        }}>
                        {'Party of 10.'}
                      </Text>
                    </View>
                </Card>)}
              />

          </ScrollView>

          <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', height: 50, backgroundColor: colors.lightestGray, paddingHorizontal: 50}}>
            <TouchableOpacity
            onPress={() => this.props.navigation.navigate('VenueDashboard')}
            style={{width: '30%', justifyContent: 'center', alignItems: 'center'}}>
              <Image style={{width: 35, height: 35}} source={require('../images/ic_menu.png')} />
            </TouchableOpacity>

            {/*<TouchableOpacity
            onPress={() => console.log('Button 1')}
            style={{width: '30%', justifyContent: 'center', alignItems: 'center'}}>
              <Image style={{width: 35, height: 35}} source={require('../images/ic_profile.png')} />
            </TouchableOpacity>*/}
          </View>

        </ImageBackground>
      );
    }
}

const styles = StyleSheet.create({
  image: {flex: 1, resizeMode: "cover", justifyContent: "center"},
});
