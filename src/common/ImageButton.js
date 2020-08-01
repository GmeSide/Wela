import React from "react";
import {
    StyleSheet,
    Dimensions,
    Text,
    TouchableOpacity,
    Image,
    View
} from "react-native";
import { colors } from "../common/AppColors";

const DEVICE_WIDTH = Dimensions.get('window').width;


class ImageButton extends React.Component {

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
            <TouchableOpacity style={{
                height: 50,
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
            }}
                onPress={this.props.onButtonPress}>
                {/* {this.IMAGEVIEW()} */}

                <View style={{
                    flex: 1, flexDirection: 'row',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>

                    <Image
                        source={this.props.image}
                        style={this.props.imageStyle ? this.props.imageStyle : { width: 0, height: 0 }}

                    />
                    <Text style={{
                        flexDirection: 'row',
                        alignSelf: 'center',
                        color: colors.themeDark,
                        fontWeight: 'bold',
                        alignContent: 'center',
                        textAlignVertical: 'center',
                        textAlign: 'center',
                        alignItems: "center",
                        color: this.props.textColor ? this.props.textColor : colors.white,
                        fontSize: 16,
                        fontFamily: 'Rubik-Light'
                    }} >{this.props.text ? this.props.text : 'Save'}</Text>
                </View>

            </TouchableOpacity>
        );
    }
} // end of class

export default ImageButton;



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
