import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    Text,
    ActivityIndicator
} from 'react-native';

const ProgressDialog = ({ visible, title, message }) => (
    <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
    >
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" />
                </View>
                <View style={styles.loadingContent}>
                    <Text style={styles.message}>{message}</Text>
                </View>
                {/* <Text style={styles.title}>{title}</Text>
                <View style={styles.loading}>
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" />
                    </View>
                    <View style={styles.loadingContent}>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                </View> */}
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
        backgroundColor: 'rgba(0,0,0,0)',
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
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    }, message: {
        fontSize: 12,
        color: 'white'
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