import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';

const CheckInSuccessScreen = ({ route }) => {
    const navigation = useNavigation();
    const { visitor } = route.params;

    useEffect(() => {
        showMessage({
            message: "Welcome!",
            description: "Your check-in is successful.",
            type: "success",
            duration: 2000,
        });

        setTimeout(() => {
            navigation.navigate('FirstScreen');
        }, 20000);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' }} style={styles.image} />
                <Text style={styles.title}>Check-In Complete!</Text>
                <Text style={styles.message}>Thank you <Text style={styles.visitorName}>{visitor.full_name}</Text> for completing the check-in process. We are excited to have you with us today!</Text>
                <View style={styles.notificationBox}>
                    <Text style={styles.notificationTitle}>Notification Sent</Text>
                    <Text style={styles.notificationMessage}>An email has been sent to the relevant department, notifying them of your arrival. Please wait in the lobby, and someone will assist you shortly.</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FirstScreen')}>
                    <Text style={styles.buttonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, // Optional: for some padding around the card
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    image: {
        width: 80,
        height: 80,
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#28a745',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
    visitorName: {
        fontWeight: 'bold',
        color: '#007bff',
    },
    notificationBox: {
        marginTop: 15,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f8f9fa',
        width: '100%',
        alignItems: 'center',
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
    },
    notificationMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#5B86E5',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default CheckInSuccessScreen;
