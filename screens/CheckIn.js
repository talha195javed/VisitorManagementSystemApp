import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, StyleSheet, ImageBackground
} from 'react-native';

const CheckIn = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const checkPreRegistered = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://10.0.2.2:8000/api/visitor/checkPreRegistered/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            const fieldsResponse = await fetch('http://10.0.2.2:8000/api/visitor/visibleFields/');
            const fieldsData = await fieldsResponse.json();

            setLoading(false);

            if (data.success) {
                Alert.alert("Success", "Visitor details retrieved.");
                navigation.navigate('VisitorDetails', { visitor: data.visitor, visibleFields: fieldsData.fields });
            } else {
                Alert.alert("Not Found", "Visitor not found. Enter details manually.");
                navigation.navigate('VisitorDetails', { visitor: null, email, visibleFields: fieldsData.fields });
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            Alert.alert("Error", "An error occurred while checking. Please try again.");
        }
    };

    return (
        <ImageBackground source={require('../assets/images/checkin6.jpg')} style={styles.background}>
            <View style={styles.overlay} />
            <View style={styles.card}>
                <Text style={styles.heading}>Visitor Check-In</Text>
                <Text style={styles.instruction}>
                    Please enter your email and check if you're pre-registered
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={checkPreRegistered}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Check</Text>}
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for contrast
    },
    card: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        alignItems: 'center',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    instruction: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
        color: '#666',
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    button: {
        width: '100%',
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default CheckIn;
