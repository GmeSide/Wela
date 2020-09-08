/* @flow */
import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    Text,
    ActivityIndicator,
    Image
} from 'react-native';

const ProgressDialog = ({ visible, title, message }) => (
    <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
    >
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf:'center' }}>
                    <Image style={{width: 50, height: 50}} source={require('../../assets/wela2.gif')} />
                </View>
                <View style={styles.loadingContent}>
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
        </View>
    </Modal>
);

const ProgressDialogWithoutMessage = ({ visible }) => (
    <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
    >
        <View style={styles.containerwithoutmessage}>
            <ActivityIndicator size="large" />
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf:'center',
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.7)',
        width: '100%'
    }, containerwithoutmessage: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    content: {
       padding: 25,
        justifyContent: 'center',
        alignSelf:'center',
        borderRadius: 10,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Rubik-Light',
        fontWeight: 'bold',
        color: 'black'
    }, message: {
        fontSize: 12,
        fontFamily: 'Rubik-Light',
        color: 'black'
    },
    loading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf:'center',
    },
    loader: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf:'center',
    },
    loadingContent: {
        fontSize: 16,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf:'center',
    }
})

export default ProgressDialog;
