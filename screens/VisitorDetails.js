import React, { useState } from 'react';
import {
    View, Text, TextInput, Alert, ImageBackground, TouchableOpacity, StyleSheet, ScrollView
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

    const handleProceed = async () => {
        const { full_name, company, phone, id_type, identification_number, email } = visitorData;

        if (!full_name) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        try {
            const response = await fetch('http://10.0.2.2:8000/api/visitor/store-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(visitorData),
            });

            const data = await response.json();

            if (response.ok && data.visitor && data.visitor.id) {
                const visitorId = data.visitor.id;
                const visibleScreens = data.visibleFields || [];

                if (visibleScreens.includes('select_role')) {
                    navigation.navigate('SelectRole', { visitorId });
                } else if (visibleScreens.includes('select_purpose')) {
                    navigation.navigate('SelectPurpose', { visitorId });
                } else if (visibleScreens.includes('capture_image')) {
                    navigation.navigate('CaptureImage', { visitorId });
                } else if (visibleScreens.includes('capture_id')) {
                    navigation.navigate('CaptureId', { visitorId });
                } else if (visibleScreens.includes('emergency_contact')) {
                    navigation.navigate('EmergencyContact', { visitorId });
                } else {
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    card: {
        width: 300, // Set width of card to match SelectRole screen
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        alignItems: 'center',
        marginTop: 100,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        width: '100%', // Set to 100% to take up full width of the container
        height: 50,    // Ensure uniform height
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
        width: '100%', // Set to 100% for the picker container
        height: 50,    // Set uniform height for the picker
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
        width: '100%', // Set to 100% to match the width of input fields
        paddingVertical: 12,  // Adjusted height for better button size
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
