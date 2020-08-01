import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { colors } from '../styles/variables'
import { Colors } from 'react-native-paper';

const ProgressDialogWithoutMessage = ({ visible }) => (
    <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
    >
        <View style={styles.containerwithoutmessage}>

            <ActivityIndicator
                size="large" />
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    containerwithoutmessage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0)',
    },
})

export default ProgressDialogWithoutMessage;
