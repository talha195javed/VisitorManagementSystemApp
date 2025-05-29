import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View, Text, TextInput, Alert, ImageBackground, TouchableOpacity, StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const VisitorDetails = ({ route, navigation }) => {
    const { visibleFields } = route.params || {};

    const [visitorData, setVisitorData] = useState({
        full_name: '',
        company: '',
        email: '',
        phone: '',
        id_type: '',
        identification_number: '',
    });

    const [clientId, setClientId] = useState('');

    useEffect(() => {
        const fetchClientId = async () => {
            try {
                const id = await AsyncStorage.getItem('ClientId');
                setClientId(id || '');
                console.log("Fetched ClientId from storage:", id);
            } catch (error) {
                console.error("Error reading ClientId from AsyncStorage:", error);
            }
        };
        fetchClientId();
    }, []);

    const handleProceed = async () => {
        const { full_name } = visitorData;

        if (!full_name) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        try {
            const payload = {
                ...visitorData,
                client_id: clientId,
            };

            console.log("Payload being sent:", payload);

            const response = await fetch('http://10.0.2.2:8000/api/visitor/store-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.visitor?.id) {
                const visitorId = data.visitor.id;
                const nextScreen = data.next_screen;

                console.log("Next Screen:", nextScreen);

                switch (nextScreen) {
                    case 'select_role':
                        navigation.navigate('SelectRole', { visitorId });
                        break;
                    case 'select_purpose':
                        navigation.navigate('SelectPurpose', { visitorId });
                        break;
                    case 'capture_image':
                        navigation.navigate('CaptureImage', { visitorId });
                        break;
                    case 'capture_id':
                        navigation.navigate('CaptureId', { visitorId });
                        break;
                    case 'emergency_contact':
                        navigation.navigate('EmergencyContact', { visitorId });
                        break;
                    default:
                        navigation.navigate('Agreement', { visitorId });
                }
            } else {
                Alert.alert("Error", data.message || "Something went wrong!");
            }
        } catch (error) {
            console.error("API Error:", error);
            Alert.alert("Error", "Failed to connect to the server. Check your internet connection.");
        }
    };

    return (
        <ImageBackground source={require('../assets/images/checkin6.jpg')} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Visitor Details</Text>

                {visibleFields?.includes('full_name') && (
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        autoCorrect={false}
                        autoCapitalize="none"
                        value={visitorData.full_name}
                        onChangeText={(text) => setVisitorData({ ...visitorData, full_name: text })}
                    />
                )}
                {visibleFields?.includes('company') && (
                    <TextInput
                        style={styles.input}
                        placeholder="Company"
                        autoCorrect={false}
                        autoCapitalize="none"
                        value={visitorData.company}
                        onChangeText={(text) => setVisitorData({ ...visitorData, company: text })}
                    />
                )}
                {visibleFields?.includes('email') && (
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCorrect={false}
                        autoCapitalize="none"
                        value={visitorData.email}
                        onChangeText={(text) => setVisitorData({ ...visitorData, email: text })}
                    />
                )}
                {visibleFields?.includes('phone') && (
                    <TextInput
                        style={styles.input}
                        placeholder="Phone"
                        keyboardType="phone-pad"
                        autoCorrect={false}
                        autoCapitalize="none"
                        value={visitorData.phone}
                        onChangeText={(text) => setVisitorData({ ...visitorData, phone: text })}
                    />
                )}
                {visibleFields?.includes('id_type') && (
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={visitorData.id_type}
                            onValueChange={(itemValue) => setVisitorData({ ...visitorData, id_type: itemValue })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select ID Type" value="" />
                            <Picker.Item label="Emirates ID" value="emirates_id" />
                            <Picker.Item label="Passport" value="passport" />
                            <Picker.Item label="National CNIC" value="cnic" />
                        </Picker>
                    </View>
                )}
                {visibleFields?.includes('identification_number') && (
                    <TextInput
                        style={styles.input}
                        placeholder="Identification Number"
                        autoCorrect={false}
                        autoCapitalize="none"
                        value={visitorData.identification_number}
                        onChangeText={(text) => setVisitorData({ ...visitorData, identification_number: text })}
                    />
                )}
                <TouchableOpacity style={styles.button} onPress={handleProceed}>
                    <Text style={styles.buttonText}>Proceed</Text>
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
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        maxWidth: 400,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 15,
        fontSize: 16,
        textAlign: 'center',
    },
    pickerContainer: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        marginBottom: 15,
    },
    picker: {
        width: '100%',
        height: 50,
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#007bff',
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default VisitorDetails;
