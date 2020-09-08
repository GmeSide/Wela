import React from "react";
import {
    StyleSheet,
    Dimensions,
    Text,
    TouchableOpacity,
    Image,
    View
} from "react-native";
import { colors } from "../../common/AppColors";

const DEVICE_WIDTH = Dimensions.get('window').width;

class Arrows extends React.Component {

    render() {
        return (
            <View style={{ flexDirection: 'row'}}>

                <TouchableOpacity
                    onPress={() => { this.props.onBackSlider() }}
                >
                    <Image
                        style={{ width: 25, height: 20, tintColor: colors.black }}
                        source={require('../images/back.png')}
                    >

                    </Image>
                </TouchableOpacity>

                <View style={{height:1, width:40}}/>

                <TouchableOpacity

                    onPress={() => { this.props.onNextSlider() }}
                >
                    <Image
                        style={{ width: 25, height: 20, tintColor: colors.black }}
                        source={require('../images/next.png')}
                    >

                    </Image>
                </TouchableOpacity>

            </View>
        );
    }
} // end of class

export default Arrows;



const styles = StyleSheet.create({
    listItem: {
        flex: 1,
    },
});
