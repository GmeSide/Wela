/* @flow */
import moment from 'moment';
import React, { Component } from 'react';
import { FlatList, ImageBackground, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { Card } from 'react-native-shadow-cards';
import { colors } from '../../common/AppColors';
import Button from '../../common/BlackButton';
import LoadingView from '../../common/LoadingView';
import { getCustomerLog } from '../../network/ApiRequest.js';
import Helper from '../../utils/Helper';

export default class CustomerLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      isLoading: false,
      upcoming: [],
      earlierToday: [],
    }
    this.props.navigation.addListener('willFocus', this.componentWillFocus)
  }

  componentWillFocus = async () => {
    console.log('CustomerLog FOCUSED.');
    this.onRefresh()
  }

  async onRefresh() {
    userVenue = Helper.venueUserObject
    await this.setState({ isLoading: true })
    const res = await getCustomerLog(userVenue?.id, 12)
    await this.setState({ isLoading: false })
    if (res.data.success) {
      this.setState({ upcoming: res.data.data })
      this.setState({ earlierToday: res.data.data_history })
    }
  }

  getStatus(status) {
    // if (status == "waiting" || status == "Waiting") {
    //     // return "Notify"
    // }
    if (status == "confirm" || status == "Confirm") {
      return "Notified"
    } else {
      return status.length ? status.charAt(0).toUpperCase() + status.slice(1) : status
    }
  }

  componentDidMount = async () => { }

  renderEmptyItem = () => {
    return (
      <Text style={{
        fontFamily: 'Rubik-Light',
        color: colors.white,
        paddingLeft: 10,
        fontSize: 16,
        marginTop: 25
      }}>No items found</Text>
    )
  }

  render() {
    return (
      <ImageBackground source={require('../images/bg_screen.png')} style={styles.image}>
        <ScrollView>
          {/* <Text style={styles.text}>Upcoming</Text>
              <FlatList
                data={this.state.upcoming}
                keyExtractor={(item, index) => index + ""}
                renderItem={({ item, index }) => (
                  <Card
                    key={index}
                    elevation={4}
                    style={{ padding: 8, margin: 10, width: '90%', justifyContent: 'space-between', flexDirection: 'row' }}>
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
                        {'Party of ' + item.persons}
                      </Text>
                    </View>
                    <View style={{ justifyContent: 'flex-end' }}>
                      <Text style={{
                        fontSize: 16,
                        fontFamily: 'Rubik-Light',
                        color: colors.black,
                        fontWeight: 'bold',
                        paddingLeft: 4,
                      }}>
                        {moment(item.created_at).format("h:mm a")}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'Rubik-Light',
                          color: colors.darkGray,
                          paddingLeft: 4,
                          textAlign: 'right'
                      }}>
                        {this.getStatus(item.status)}
                      </Text>
                    </View>
                  </Card>
                )}
              /> */}

          <Text style={styles.text}>Past 12 Hours</Text>
          <FlatList
            data={this.state.earlierToday}
            keyExtractor={(item, index) => index + ""}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={() => this.onRefresh()} />
            }
            ListEmptyComponent={this.renderEmptyItem}
            renderItem={({ item, index }) => (
              <Card
                _key={index}
                elevation={4}
                style={{ padding: 8, margin: 10, width: '90%', justifyContent: 'space-between', flexDirection: 'row' }}>
                <View style={{ flexDirection: 'column' }}>
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
                    {'Party of ' + item.persons}
                  </Text>
                </View>
                <View style={{ justifyContent: 'flex-end' }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Rubik-Light',
                    color: colors.black,
                    fontWeight: 'bold',
                    paddingLeft: 4,
                  }}>
                    {moment(item.created_at).format("h:mm a")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Rubik-Light',
                      color: colors.darkGray,
                      paddingLeft: 4,
                      textAlign: 'right'
                    }}>
                    {this.getStatus(item.status)}
                  </Text>
                </View>
              </Card>)}
          />

        </ScrollView>

        {/* <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', height: 50, backgroundColor: colors.lightestGray, paddingHorizontal: 50}}>
            <TouchableOpacity
            onPress={() => this.props.navigation.navigate('VenueDashboard')}
            style={{width: '30%', justifyContent: 'center', alignItems: 'center'}}>
              <Image style={{width: 35, height: 35}} source={require('../images/ic_menu.png')} />
            </TouchableOpacity>

            <TouchableOpacity
            onPress={() => console.log('Button 1')}
            style={{width: '30%', justifyContent: 'center', alignItems: 'center'}}>
              <Image style={{width: 35, height: 35}} source={require('../images/ic_profile.png')} />
            </TouchableOpacity>
          </View> */}
        <Button
          style={{
            marginVertical: '4%'
          }}
          width={'92%'}
          topMargin={10}
          bottomMargin={Platform.OS === 'ios' ? 30 : 20}
          onButtonPress={() => this.props.navigation.navigate('VenueDashboard')}
          text={'Back'}
        />
        {this.state.isLoading ? <LoadingView message="Fetching.." /> : undefined}
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  text: {
    fontFamily: 'Rubik-Light',
    color: colors.white,
    paddingLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    ...ifIphoneX({
      marginTop: 50
    }, {
      marginTop: 30
    })
  }
});
