import React from "react";
import {
    StyleSheet,
    Dimensions,
    TextInput,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    View,
    FlatList,
    ScrollView,
    Platform
} from "react-native";
import { colors } from "../../common/AppColors";
import { Card } from 'react-native-shadow-cards';
import UserInput from '../../common/UserInput';
import Button from '../../common/BlackButton';
import { showToastMessage } from '../../network/ApiRequest.js';

import Helper from '../../utils/Helper.js'

const DEVICE_WIDTH = Dimensions.get('window').width;


const primaryColor = "#1abc9c";
const lightGrey = "#ecf0f1";
const darkGrey = "#bdc3c7";



class ContactsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            allContacts: this.props.cotactlist,
            SelectedContactList: [],
            limit: this.props.limit,
            enteredLimit: 1
        }
    }
    componentDidMount() {
        this.setState({ allContacts: this.props.cotactlist, limit: this.props.limit })
    }

    // Header = (props) => (
    //     <View style={styles.searchContainer}>
    //         <TextInput
    //         style={styles.input}
    //          placeholder="Search..."
    //          onChangeText={text => this.updateSearchText(text)} />
    //     </View>
    // );
    renderHeader = () => {
        return (
            <View style={styles.searchContainer}>
                <TextInput
                    style={{ width: '100%', height: 34, }}
                    placeholder="Search..."
                    onChangeText={text => this.updateSearchText(text)} />
            </View>
        )
    };
    press = (hey) => {


        this.state.allContacts.map((item) => {
            if (item.recordID === hey.recordID) {
                Helper.DEBUG_LOG(item.check)
                Helper.DEBUG_LOG(this.state.enteredLimit)
                Helper.DEBUG_LOG(this.state.limit)
                if (item.check === true) {

                    item.check = !item.check
                    if (item.check === true) {
                        this.state.SelectedContactList.push(item);
                        this.setState({ enteredLimit: this.state.enteredLimit + 1 })
                        console.log('selected:' + item.givenName);
                    } else if (item.check === false) {
                        const i = this.state.SelectedContactList.indexOf(item)
                        if (1 != -1) {
                            this.state.SelectedContactList.splice(i, 1)
                            console.log('unselect:' + item.givenName)
                            this.setState({ enteredLimit: this.state.enteredLimit - 1 })
                            return this.state.SelectedContactList
                        }
                    }
                } else {
                    if (this.state.enteredLimit != this.state.limit) {

                        item.check = !item.check
                        if (item.check === true) {
                            this.state.SelectedContactList.push(item);
                            console.log('selected:' + item.givenName);
                            this.setState({ enteredLimit: this.state.enteredLimit + 1 })
                        } else if (item.check === false) {
                            const i = this.state.SelectedContactList.indexOf(item)
                            if (1 != -1) {
                                this.state.SelectedContactList.splice(i, 1)
                                this.setState({ enteredLimit: this.state.enteredLimit - 1 })
                                console.log('unselect:' + item.givenName)
                                return this.state.SelectedContactList
                            }
                        }
                    } else {
                        showToastMessage('limit', "This venue has total limit of persons " + this.state.limit)
                    }
                }

            }
        })
        this.setState({ allContacts: this.state.allContacts })


    }

    _showSelectedContact() {
        return this.state.SelectedContactList.length;
    }

    updateSearchText(text) {
        Helper.DEBUG_LOG(`searchText -> ${text}`)
        if (text === '') {
            this.setState({ allContacts: this.props.cotactlist })
            return
        }
        const newData = this.state.allContacts.filter(item => {
            var name = item.familyName + item.givenName
            const itemData = name.toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1
        });
        this.setState({ allContacts: newData })

    }
    hideContacts() {
        this.setState({ SelectedContactList: [], enteredLimit: 1 })
        this.props.hideContacts()
    }
    onSelectionComplete() {

        var _pesons = this.state.enteredLimit
        var _pesons_detail = ""

        this.state.SelectedContactList.map((item, index) => {
            if (index == 0) {
                var name = item.givenName + "" + item.familyName
                var phone = "000"
                if (item.phoneNumbers[0].number) {
                    phone = item.phoneNumbers[0].number
                }
                _pesons_detail = name + ":" + phone
            } else {
                var name = item.givenName + "" + item.familyName
                var phone = "000"
                if (item.phoneNumbers[0].number) {
                    phone = item.phoneNumbers[0].number
                }
                _pesons_detail = _pesons_detail + "," + name + ":" + phone
            }
        })

        this.setState({ SelectedContactList: [], enteredLimit: 1 })
        this.props.onSelectionComplete(_pesons, _pesons_detail)
    }
    render() {
        return (
            <Modal
                animationType={'fade'}
                backdropOpacity={0.8}
                transparent={true}
                visible={this.props.visible}
            >
                <Card
                    style={styles.container}
                    elevation={24}>
                    <View >
                        <View style={{ flexDirection: 'row', marginHorizontal: 20, paddingBottom: 10 }}>
                            <TouchableOpacity onPress={() => this.hideContacts()}>

                                <Text style={{ flex: 1, fontFamily: 'Rubik-Light' }}>CANCEL</Text>

                            </TouchableOpacity>

                            <Text style={{ flex: 1, textAlign: 'right', fontFamily: 'Rubik-Light' }}>{`${this.state.SelectedContactList.length}/${this.state.allContacts.length}`}</Text>

                            <TouchableOpacity
                                style={{ flex: 1, textAlign: 'right' }}
                                onPress={() => this.onSelectionComplete()}>

                                <Text style={{ flex: 1, textAlign: 'right', fontFamily: 'Rubik-Light' }}>DONE</Text>

                            </TouchableOpacity>



                        </View>
                        <View >
                            <FlatList
                                data={this.state.allContacts}
                                keyExtractor={item => item.recordID}
                                extraData={this.state}
                                ListHeaderComponent={this.renderHeader}
                                renderItem={({ item }) => {
                                    return <TouchableOpacity style={{
                                        flexDirection: 'row',
                                        padding: 10,
                                        borderBottomWidth: 1,
                                        borderStyle: 'solid',
                                        borderColor: '#ecf0f1'
                                    }} onPress={() => {
                                        this.press(item)
                                    }}>
                                        <View style={{
                                            flex: 3,
                                            alignItems: 'flex-start',
                                            justifyContent: 'center'
                                        }}>
                                            {item.check
                                                ? (
                                                    <Text style={{
                                                        fontFamily: 'Rubik-Light',
                                                        fontWeight: 'bold'
                                                    }}>{`${item.givenName} ${item.familyName}`}</Text>
                                                )
                                                : (
                                                    <Text>{`${item.givenName} ${item.familyName}`}</Text>
                                                )}
                                        </View>
                                        <View style={{
                                            flex: 1,
                                            alignItems: 'flex-end',
                                            justifyContent: 'center'
                                        }}>
                                            {item.check
                                                ? (
                                                    <Image
                                                        style={{ width: 20, height: 20 }}
                                                        source={require('../images/checked.png')}
                                                    />
                                                )
                                                : (
                                                    <Image
                                                        style={{ width: 20, height: 20 }}
                                                        source={require('../images/uncheck.png')}
                                                    />
                                                )}
                                        </View>
                                    </TouchableOpacity>
                                }} />
                        </View>


                    </View>
                </Card>
            </Modal>
        );
    };
} // end of class

export default ContactsList;



const styles = StyleSheet.create({
    container: {
        width: '95%',
        height: '95%',
        alignSelf: 'center',
        marginTop: Platform.OS == 'android' ? 20 : 70,
        marginBottom: 20,
        backgroundColor: 'white',
        paddingTop: 8,
        paddingBottom: 20
    },
    containerFooter: {
        height: 50,
        backgroundColor: '#1abc9c',
        padding: 5,
        flexDirection: 'row'
    },
    searchContainer: {
        padding: 5,
        height: 35,
        flex: 1,
        width: '90%',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecf0f1'
    }
});
