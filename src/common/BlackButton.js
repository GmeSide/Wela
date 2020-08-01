import React from "react";
import {
    StyleSheet,
    Dimensions,
    Text,
    TouchableOpacity,
    Image
} from "react-native";
import { colors } from "../common/AppColors";

const DEVICE_WIDTH = Dimensions.get('window').width;

class BlackButton extends React.Component {

    // IMAGEVIEW() {
    //     if (this.props.icon) {
    //         // var imageSource = this.props.icon.toString()
    //         return (
    //             <Image
    //                 source={require(props.icon)}
    //                 style={{ width: 20, height: 20, tintColor: '#ffffff' }} />
    //         )
    //     }
    // }
    render() {
        return (
            <TouchableOpacity
            disabled={this.props.disabled}
            style={{
                height: this.props.height ? this.props.height : 50,
                flexDirection: 'row',
                width: this.props.width ? this.props.width : DEVICE_WIDTH - 40,
                marginTop: this.props.topMargin,
                borderRadius: 4,
                alignSelf: 'center',
                borderColor: colors.themeDark,
                backgroundColor: this.props.background ? this.props.background : colors.black,
                justifyContent: "center",
                fontWeight: 'bold',
                alignContent: 'center',
                textAlign: 'center',
                alignItems: "center",
                marginHorizontal:this.props.marginHorizontaly?this.props.marginHorizontaly:0
            }}
                onPress={this.props.onButtonPress}>
                {/* {this.IMAGEVIEW()} */}
                <Text style={{
                    width: '100%',
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: "center",
                    fontWeight: 'bold',
                    alignContent: 'center',
                    textAlignVertical: 'center',
                    textAlign: 'center',
                    alignItems: "center",
                    color: this.props.textColor ? this.props.textColor:colors.white,
                    fontSize: this.props.textSize ? this.props.textSize : 16,
                    fontFamily: 'Rubik-Light'
                }} >{this.props.text ? this.props.text : 'Save'}</Text>
            </TouchableOpacity>
        );
    }
} // end of class

export default BlackButton;

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
