/* @flow */
import React from "react";
import {
    StyleSheet,
    Dimensions,
    Text,
    FlatList,
    Image,
    View,
    TouchableOpacity
} from "react-native";
import { Card } from 'react-native-shadow-cards';
import { colors } from '../../common/AppColors';
import Button from '../../common/BlackButton';
import Helper from '../../utils/Helper';
import Arrows from './Arrows'

const DEVICE_WIDTH = Dimensions.get('window').width;

var mFlatList = null

export default class ListQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndexListFocus: 0
        }
    }

    componentDidMount() {
        if (Helper.venueQueueDataOfCustomers.length > 3) {
            this.setState({ currentIndexListFocus: 1 })
        } else {
            this.setState({ currentIndexListFocus: 0 })
        }
        this.onSlideScroll()
    }

    onSlideScroll() {
        let wait = new Promise((resolve) => setTimeout(resolve, 500));  // Smaller number should work
        wait.then(() => {
            mFlatList.scrollToIndex({ index: this.state.currentIndexListFocus, animated: true });
        });
    }

    getButtonLabel(status) {
        if (status == "waiting" || status == "Waiting") {
            return "Notify"
        } else if (status == "confirm" || status == "Confirm") {
            return "Notified"
        } else {
            return status.length ? status.charAt(0).toUpperCase() + status.slice(1) : status
        }
    }

    focusedItem(data, index) {
        Helper.DEBUG_LOG(index)
    }

    DELETE_ICON(item, index) {
      if (item.status == "Notified" || item.status == "notified" || item.status == "confirm" || item.status == "Confirm") {
        return (
          <TouchableOpacity style={{
              position: 'absolute',
              height: 20,
              width: 20,
              right: 0,
              backgroundColor: colors.lightGray,
              borderRadius: Platform.OS === 'ios' ? 20 / 2 : 20,
            }}
            onPress={() => this.props.deleteNow(index,item)}
          >
            <Text
              style={{
                height: 20,
                fontFamily: 'Rubik-Light',
                width: 20,
                padding: 2,
                color: colors.black,
                alignSelf: 'center',
                textAlign: 'center',
                borderRadius: Platform.OS === 'ios' ? 20 / 2 : 20
              }}
            >
                X
            </Text>
          </TouchableOpacity>
        )
      }
    }

    slideBack() {
        if (this.state.currentIndexListFocus != 0) {
            this.setState({ currentIndexListFocus: this.state.currentIndexListFocus - 1 })
            this.onSlideScroll()
        }
    }

    slideNext() {
        if (this.state.currentIndexListFocus < Helper.venueQueueDataOfCustomers.length) {
            this.setState({ currentIndexListFocus: this.state.currentIndexListFocus + 1 })
            this.onSlideScroll()
        }
    }

    showArrowsIfListCanScroll() {
        if (this.props.dataSource.length > 3) {
            return (
                <Arrows
                    onBackSlider={() => { this.slideBack() }}
                    onNextSlider={() => { this.slideNext() }}
                />
            )
        }
    }

    getUserName(item) {
        if (item.user) {
            return item.user
        } else {
            return "No Name"
        }
    }

    render() {
        const { dataSource } = this.props
        return (
            <View style={{
                width: DEVICE_WIDTH,
                alignContent: 'center',
                justifyContent: dataSource.length > 0 ? 'space-evenly' : 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
                height: '100%'
            }}>
                <Text style={{
                    marginBottom: dataSource.length > 0 ? 0 : 20,
                    marginTop: 5,
                    fontFamily: 'Rubik-Light',
                    color: colors.black,
                    fontWeight: 'bold',
                    fontSize: 18
                }}>
                    {'Current Wait List'}
                </Text>

                <FlatList
                    data={dataSource.length? [...dataSource,{status:'thatall'}] : dataSource}
                    keyExtractor={item => `${item}`}
                    ref={ref => mFlatList = ref}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{ flexGrow: 0 }}
                    renderItem={({ item, index }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            {item.status==='thatall'?
                            <Card
                              elevation={0}
                              style={{ width: DEVICE_WIDTH / 2.7, padding: 8, margin: 10, justifyContent: 'center', height: 150 }}>
                              <Image
                                source={require('../../../assets/Group1.png')}
                                style={{ height: 100, width: DEVICE_WIDTH / 2.7 }}
                                resizeMode='contain'
                              />
                            </Card>

                            :
                            <Card
                                elevation={4}
                                style={{ width: DEVICE_WIDTH / 2.7, padding: 8, margin: 10 }}>
                                {this.DELETE_ICON(item, index)}

                                <View style={{
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <View style={{
                                        height: 60,
                                        width: 60,
                                        backgroundColor: colors.input_box_grey,
                                        borderRadius: Platform.OS === 'ios' ? 60 / 2 : 60
                                    }}>
                                        <Image
                                            source={item.url? { uri: item.url }:require('../images/user_placeholder.png')}
                                            style={{
                                                height: 60,
                                                width: 60,
                                                borderRadius: Platform.OS === 'ios' ? 60 / 2 : 60
                                            }}
                                        />
                                    </View>
                                    <View style={{
                                        height: 60,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Text
                                            numberOfLines={2}
                                            style={{
                                                textAlign: 'center',
                                                fontFamily: 'Rubik-Light',
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                color: colors.black,
                                                marginTop: 10,
                                                fontSize: 16,
                                            }}>
                                            {this.getUserName(item)}
                                        </Text>
                                        <Text
                                            numberOfLines={1}
                                            style={{ fontFamily: 'Rubik-Light', color: colors.black, marginTop: 2, fontSize: 12, }}>
                                            {`Group of ${item.persons}`}
                                        </Text>
                                    </View>

                                    <Button
                                        background={item.status == "waiting" ? '#000000' : '#8cb3e5'}
                                        topMargin={15}
                                        textSize={12}
                                        height={40}
                                        width={DEVICE_WIDTH / 3 - 30}
                                        topMargin={10}
                                        onButtonPress={() => this.props.notify(item, index)}
                                        text={this.getButtonLabel(item.status)} />
                                </View>
                            </Card>}
                        </View>
                    )}
                />

                {this.showArrowsIfListCanScroll()}

                <Text style={{
                    fontFamily: 'Rubik-Light',
                    color: colors.black,
                    fontWeight: 'bold',
                    fontSize: 18,
                  }}>
                  {`${dataSource.length} Groups Waiting`}
                </Text>
            </View>
        );
    }
} // end of class

const styles = StyleSheet.create({
    listItem: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#fff",
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 8
    },
});
