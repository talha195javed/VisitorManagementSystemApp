import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import axios from 'axios';

const EmergencyContactScreen = ({ route, navigation }) => {
    const { visitorId } = route.params;
    const [visibleFields, setVisibleFields] = useState([]);
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [emergencyRelation, setEmergencyRelation] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVisibleFields();
    }, []);

    const fetchVisibleFields = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:8000/api/visitor/visibleFields/');
            if (response.data.fields) {
                setVisibleFields(response.data.fields);
            }
        } catch (error) {
            console.error("Fetch Visible Fields Error:", error);
            Alert.alert("Error", "Unable to fetch visible fields.");
        }
    };

    const handleSubmit = async () => {
        const payload = {};
        if (visibleFields.includes('emergency_name')) payload.emergency_name = emergencyName;
        if (visibleFields.includes('emergency_phone')) payload.emergency_phone = emergencyPhone;
        if (visibleFields.includes('emergency_relation')) payload.emergency_relation = emergencyRelation;

        if (Object.keys(payload).length === 0) {
            Alert.alert('Error', 'No fields to submit.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://10.0.2.2:8000/api/visitor/appEmergencyContact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, visitor_id: visitorId }),
            });

            const data = await response.json();
            if (response.ok) {
                const visibleScreens = data.visibleFields || [];
                    navigation.navigate('Agreement', { visitorId });
            } else {
                Alert.alert("Error", "Failed to save Emergency Contact.");
            }
        } catch (error) {
            setLoading(false);
            console.error("Submission Error:", error);
            Alert.alert('Error', 'An error occurred while submitting the form.');
        }
    };

    return (
        <ImageBackground source={require('../assets/images/checkin6.jpg')} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Emergency Contact</Text>
                {visibleFields.includes('emergency_name') && (
                    <TextInput
                        style={styles.input}
                        placeholder="Emergency Contact Name"
                        value={emergencyName}
                        onChangeText={setEmergencyName}
                    />
                )}
                {visibleFields.includes('emergency_phone') && (
                    <TextInput
                        style={styles.input}
                        placeholder="Emergency Contact Phone"
                        value={emergencyPhone}
                        onChangeText={setEmergencyPhone}
                        keyboardType="phone-pad"
                    />
                )}
                {visibleFields.includes('emergency_relation') && (
                    <TextInput
                        style={styles.input}
                        placeholder="Relation to Visitor"
                        value={emergencyRelation}
                        onChangeText={setEmergencyRelation}
                    />
                )}
                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Emergency Contact'}</Text>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        width: '100%',
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#48c6ef',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default EmergencyContactScreen;
