/* @flow */
import React from "react";
import {
    StyleSheet,
    Dimensions,
    Text,
    TouchableOpacity,
    Image,
    View,
    Switch
} from "react-native";
import { colors } from "../../common/AppColors";
import FlipToggle from 'react-native-flip-toggle-button'
const DEVICE_WIDTH = Dimensions.get('window').width;

export default class ToggleWaiting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: true
        }
    }

    changeOnToggle(value) {
        this.setState({ isActive: value })
        this.props.toggleSwitch(value)
    }

    render() {
        return (
            <View style={{
                flexDirection: 'row',
                marginTop: 15,
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                alignSelf: 'center'
            }}>

                <Text style={{
                    color: colors.black,
                    fontFamily: 'Rubik-Light',
                    fontSize: 14
                }}>Toggle waitlist on/off</Text>

                <View style={{ height: 1, width: 40 }} />

                {/* disabledButtonOnColor: PropTypes.string,
                disabledButtonOffColor: PropTypes.string, */}
                <FlipToggle
                    buttonOnColor={colors.black}
                    buttonOffColor={colors.midGray}
                    value={this.props.isActive}
                    buttonWidth={100}
                    buttonHeight={30}
                    buttonRadius={20}
                    sliderWidth={20}
                    sliderHeight={20}
                    sliderRadius={50}
                    sliderOnColor={'white'}
                    sliderOffColor={colors.lightGray}
                    onLabel={'On'}
                    offLabel={'Off'}
                    labelStyle={{ color: 'white' }}
                    onToggle={(value) => { this.changeOnToggle(value) }}
                // onToggleLongPress={() => console.log('toggle long pressed!')}
                />

            </View>
        );
    }
} // end of class

const styles = StyleSheet.create({
    listItem: {
        flex: 1,
    },
});
