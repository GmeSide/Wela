import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { colors } from '../common/AppColors'

import { StyleSheet, View, TextInput, Dimensions, Image } from 'react-native';

export default class UserInput extends Component {
    render() {
        return (
            <View style={{
                backgroundColor: colors.input_box_grey,
                marginHorizontal: this.props.marginHorizontal ? this.props.marginHorizontal : 20,
                width: this.props.width ? this.props.width : DEVICE_WIDTH - 40,
                height: this.props.height ? this.props.height :45,
                color: colors.black,
                marginTop: 8,
                borderRadius: 4,
                alignSelf: this.props.alignSelf ? this.props.alignSelf : 'center'

            }}>
                <Image source={this.props.source} style={styles.inlineImg} />
                <TextInput
                    style={{
                        maxHeight:this.props.maxHeight ? this.props.maxHeight:45,
                        height:this.props.inputTextHeight ? this.props.inputTextHeight:45,
                        paddingHorizontal: 10,
                        color: colors.black
                    }}
                    numberOfLines={this.props.numberOfLines ? this.props.numberOfLines:1}
                    placeholder={this.props.placeholder}
                    secureTextEntry={this.props.secureTextEntry}
                    autoCorrect={this.props.autoCorrect}
                    autoCapitalize={this.props.autoCapitalize}
                    returnKeyType={this.props.returnKeyType}
                    onChangeText={this.props.onChangeText}
                    value={this.props.value}
                    editable={this.props.editable ? this.props.editable : true}
                    placeholderTextColor={this.props.placeholderTextColor}
                    underlineColorAndroid="transparent"
                    autogrow={this.props.autogrow ? this.props.autogrow : false}
                    multiline={this.props.multiline ? this.props.multiline : false}
                    scrollEnabled={this.props.scrollEnabled ? this.props.scrollEnabled : false}
                />
            </View>
        );
    }
}

UserInput.propTypes = {
    source: PropTypes.number.isRequired,
    placeholder: PropTypes.string.isRequired,
    secureTextEntry: PropTypes.bool,
    autoCorrect: PropTypes.bool,
    autoCapitalize: PropTypes.string,
    returnKeyType: PropTypes.string,
};

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
    input: {
        height: 45,
        paddingHorizontal: 10,
        color: colors.black,

    },
    inlineImg: {
        position: 'absolute',
        zIndex: 99,
        width: 22,
        height: 22,
        left: 15,
        top: 9,
    },
});