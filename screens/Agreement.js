import React, { useState } from 'react';
import {
    View, Text, Alert, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, ActivityIndicator
} from 'react-native';

const AgreementScreen = ({ route, navigation }) => {
    const { visitor } = route.params;
    const { visitorId } = route.params;
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!isChecked) {
            Alert.alert(
                'Agreement Required',
                'You must agree to the Privacy Policy & Terms and Conditions to proceed.',
                [{ text: 'OK', style: 'cancel' }]
            );
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://10.0.2.2:8000/api/visitor/appPrivacyAgreement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitor_id: visitorId,
                    privacy_policy_agreement: 1,
                }),
            });

            const data = await response.json();
            console.log(data);
            setLoading(false);

            if (data.success) {
                navigation.navigate('CheckInSuccessScreen', { visitor: data.visitor });
            } else {
                Alert.alert('Error', data.message || 'Something went wrong.');
            }
        } catch (error) {
            setLoading(false);
            console.error('Error submitting agreement:', error);
            Alert.alert('Error', 'An error occurred while submitting the agreement.');
        }
    };

    return (
        <ImageBackground source={require('../assets/images/checkin6.jpg')} style={styles.background}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Privacy Policy & Terms and Conditions</Text>
                <Text style={styles.paragraph}>
                    Welcome to our company! We value your privacy and ensure that your information is kept safe. By signing this agreement, you agree to our terms and conditions.
                </Text>

                <View style={styles.checkboxContainer}>
                    <TouchableOpacity onPress={() => setIsChecked(!isChecked)} style={styles.checkbox}>
                        {isChecked && <View style={styles.checked}></View>}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>
                        I agree to the <Text style={styles.bold}>Privacy Policy</Text> and <Text style={styles.bold}>Terms & Conditions</Text>.
                    </Text>
                </View>

                <TouchableOpacity style={[styles.button, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm and Proceed</Text>}
                </TouchableOpacity>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay for readability
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff', // Changed to white for contrast
        textAlign: 'center',
    },
    paragraph: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 5,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checked: {
        width: 16,
        height: 16,
        backgroundColor: '#48c6ef',
        borderRadius: 3,
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#fff',
    },
    bold: {
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#48c6ef',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#bbb', // Greyed out when loading
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default AgreementScreen;
