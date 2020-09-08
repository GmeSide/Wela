/* @flow */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { colors } from '../../common/AppColors'
import { Card } from 'react-native-shadow-cards';
import Button from '../../common/BlackButton';
import { StyleSheet, View, TouchableOpacity, Dimensions, TextInput, Text, Image } from 'react-native';
import Helper from '../../utils/Helper';

var textInputLimit = null
var textInputPeople = null

export default class VenueDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isExpanded: false,
            viewHeight: 50,
            topMargin: '20%',
            bottomMargin: '0%'
        }
    }

    componentDidMount() {
        this.setState({ loggedInVenue: Helper.venueUserObject})
    }

    setExpanded() {
        this.props.onVisible()
    }

    onConfirm() {
        this.setState({
            isExpanded: false,
            viewHeight: 50,
            topMargin: '33%'
        })
    }

    SHOW_Name() {
        if (!this.state.isExpanded) {
            return (
                <View style={{
                    marginLeft: 10,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignContent: 'flex-start',
                    alignSelf: 'flex-start',
                    flex: 1
                }}>
                    <Text style={{
                        fontFamily: 'Rubik-Light',
                        alignSelf: 'center',
                        textAlignVertical: 'center',
                        flex: 1
                    }}>{'Edit Profile'}</Text>
                    <Image
                        style={{
                            alignSelf: 'center',
                            width: 22, height: 22, marginRight: 15
                        }}
                        source={require('../../screens/images/ic_profile.png')}
                    />
                </View>
            )
        }
    }

    render() {
        return (
            <Card style={{
                height: this.state.viewHeight,
                position: 'absolute',
                // top: this.state.topMargin,
                bottom: -25,
                alignContent: 'center',
                alignSelf: 'center',
                justifyContent: 'center'
            }}>
                <TouchableOpacity
                    onPress={() => this.setExpanded()}
                >
                    <View style={{
                        height: this.state.expanded ? '100%' : 50,
                    }}>
                        {this.SHOW_Name()}
                        {/* {this.SHOW_VIEWS()} */}
                    </View>
                </TouchableOpacity>
            </Card>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: '80%',
        width: '90%',
    },
});
