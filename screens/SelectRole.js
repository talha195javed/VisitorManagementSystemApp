import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';

const SelectRole = ({ route, navigation }) => {
    const { visitorId } = route.params || {};
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await fetch('http://10.0.2.2:8000/api/visitor/visibleFields/');
            const data = await response.json();

            if (data.fields) {
                setRoles(data.fields);
            }
        }  catch (error) {
            console.error("Fetch Roles Error:", error);
            Alert.alert("Error", "Unable to fetch roles.");
        }
    };

    const handleRoleSelect = async (role) => {
        try {
            const response = await fetch('http://10.0.2.2:8000/api/visitor/set-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitor_id: visitorId, role }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data); // Debugging: Log response
                const visibleScreens = data.visibleFields || [];
                if (visibleScreens.includes('select_purpose')) {
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
                Alert.alert("Error", "Failed to set role.");
            }
        } catch (error) {
            console.error("Role Selection Error:", error);
        }
    };

    return (
        <ImageBackground source={require('../assets/images/checkin6.jpg')} style={styles.background}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Select Your Role</Text>
                    <Text style={styles.subtitle}>Please select one of the following options:</Text>

                    {roles?.includes('visitor') && (
                        <TouchableOpacity style={[styles.button, styles.visitor]} onPress={() => handleRoleSelect('visitor')}>
                            <Text style={styles.buttonText}>🚀 Visitor</Text>
                        </TouchableOpacity>
                    )}
                    {roles?.includes('client') && (
                        <TouchableOpacity style={[styles.button, styles.client]} onPress={() => handleRoleSelect('client')}>
                            <Text style={styles.buttonText}>💼 Client</Text>
                        </TouchableOpacity>
                    )}
                    {roles?.includes('interviewer') && (
                        <TouchableOpacity style={[styles.button, styles.interviewer]} onPress={() => handleRoleSelect('interviewer')}>
                            <Text style={styles.buttonText}>🎤 Interviewer</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        width: 300,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: 'gray',
        marginBottom: 20,
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 10,
        marginVertical: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    visitor: { backgroundColor: '#007bff' },
    client: { backgroundColor: '#28a745' },
    interviewer: { backgroundColor: '#ffc107' },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});

export default SelectRole;
