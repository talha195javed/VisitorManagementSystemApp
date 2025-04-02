import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const SelectPurposeScreen = ({ route }) => {
    const navigation = useNavigation();
    const { visitorId } = route.params;
    const [purpose, setPurpose] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        fetchRoles();
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            let response = await fetch('http://10.0.2.2:8000/api/visitor/selctAppEmployee/'); // Replace with your API endpoint
            const data = await response.json();
            console.log(data.employees);
            if (data.employees) {
                setEmployees(data.employees); // Corrected from 'setEmployes' to 'setEmployees'
            }
        } catch (error) {
            console.error(error);
        }
    };

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

    const handleProceed = async () => {
        if (!purpose) {
            Alert.alert('Error', 'Please enter the purpose of visit.');
            return;
        }

        try {
            let response = await fetch('http://10.0.2.2:8000/api/visitor/setAppPurpose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    purpose,
                    employee_id: selectedEmployee,
                    visitor_id: visitorId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(visitorId);
                const visibleScreens = data.visibleFields || [];
               if (visibleScreens.includes('capture_image')) {
                    navigation.navigate('CaptureImage', { visitorId });
                } else if (visibleScreens.includes('capture_id')) {
                    navigation.navigate('CaptureId', { visitorId });
                } else if (visibleScreens.includes('emergency_contact')) {
                    navigation.navigate('EmergencyContact', { visitorId });
                } else {
                    navigation.navigate('Agreement', { visitorId });
                }
            } else {
                Alert.alert("Error", "Failed to set purpose.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ImageBackground source={require('../assets/images/checkin6.jpg')} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Select Purpose of Visit</Text>
                <Text style={styles.subtitle}>Please provide the details below:</Text>

                {roles?.includes('purpose') && (
                    <>
                        <Text style={styles.label}>Purpose of Visit</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter purpose..."
                            value={purpose}
                            onChangeText={setPurpose}
                        />
                    </>
                )}

                {roles?.includes('employee_to_visit') && (
                    <>
                        <Text style={styles.label}>Select Employee</Text>
                        <Picker
                            selectedValue={selectedEmployee}
                            onValueChange={(itemValue) => setSelectedEmployee(itemValue)}
                            style={styles.picker}
                        >
                            {employees.map((employee) => (
                                <Picker.Item
                                    key={employee.id}
                                    label={`${employee.name} (${employee.position})`}
                                    value={employee.id}
                                />
                            ))}
                        </Picker>
                    </>
                )}

                <TouchableOpacity style={styles.button} onPress={handleProceed}>
                    <Text style={styles.buttonText}>✅ Proceed</Text>
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
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: 'gray',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 15,
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default SelectPurposeScreen;
