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
import { NavigationEvents } from "react-navigation";
import Helper from '../../utils/Helper';
import Arrows from './Arrows'

const DEVICE_WIDTH = Dimensions.get('window').width;

var mFlatList = null

class ListQueue extends React.Component {
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
        } else {
            return status.length ? status.charAt(0).toUpperCase() + status.slice(1) : status
        }

    }
    focusedItem(data, index) {
        Helper.DEBUG_LOG(index)
    }

    DELETE_ICON(item, index) {
        if (item.status == "Notified" || item.status == "notified") {
            return (
                <View style={{
                    position: 'absolute',
                    height: 20,
                    width: 20,
                    right: 0,
                    backgroundColor: colors.lightGray,
                    borderRadius: Platform.OS === 'ios' ? 20 / 2 : 20
                }}>
                    <TouchableOpacity
                        onPress={() => this.props.deleteNow(index)}
                    >
                        <Text
                            style={{
                                height: 20,
                                width: 20,
                                padding: 2,
                                color: colors.black,
                                justifyContent: 'center',
                                textAlign: 'center',
                                borderRadius: Platform.OS === 'ios' ? 20 / 2 : 20
                            }}
                        >
                            X
                        </Text>

                    </TouchableOpacity>
                </View>
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
        return (
            <View style={{
                width: DEVICE_WIDTH,
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent'
            }}>


                <FlatList
                    ref={ref => mFlatList = ref}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <View>


                            <Card
                                elevation={4}
                                style={{ width: DEVICE_WIDTH / 3, padding: 8, margin: 10, }}>


                                {this.DELETE_ICON(item, index)}

                                <View style={{
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <View style={{
                                        height: 60,
                                        width: 60,
                                        backgroundColor: colors.input_box_grey,
                                        borderRadius: Platform.OS === 'ios' ? 60 / 2 : 60
                                    }}>
                                        <Image
                                            source={{ uri: "" }}
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
                                            style={{ color: colors.black, marginTop: 2, fontSize: 12, }}>
                                            {`Group of ${item.persons}`}
                                        </Text>
                                    </View>

                                    <Button
                                        background={item.status == "waiting" ? '#000000' : '#8cb3e5'}
                                        topMargin={15}
                                        textSize={12}
                                        height={35}
                                        width={DEVICE_WIDTH / 3 - 40}
                                        topMargin={10}
                                        onButtonPress={() => this.props.notify(item, index)}
                                        text={this.getButtonLabel(item.status)} />
                                </View>
                            </Card>


                        </View>
                    )}

                    data={this.props.dataSource}
                    keyExtractor={item => `${item}`}
                />
                {this.showArrowsIfListCanScroll()}
            </View>
        );
    }
} // end of class

export default ListQueue;



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
