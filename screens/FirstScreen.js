import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ImageBackground,
    Image,
    TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import background images
import WelcomeBg from '../assets/images/welcome1.jpg';
import MainBg from '../assets/images/welcome2.webp';
import ScannerImg from '../assets/images/scanner.png';

const FirstScreen = () => {
    const navigation = useNavigation();
    const [showWelcome, setShowWelcome] = useState(true);
    let idleTimer = null;

    // Function to reset the inactivity timer
    const resetIdleTimer = () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            setShowWelcome(true); // Show Welcome Screen on inactivity
        }, 122000);
    };

    useEffect(() => {
        if (!showWelcome) {
            resetIdleTimer(); // Start the inactivity timer when entering main screen
        }
        return () => {
            if (idleTimer) clearTimeout(idleTimer);
        };
    }, [showWelcome]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Detect User Interaction */}
            <TouchableWithoutFeedback onPress={resetIdleTimer} onTouchMove={resetIdleTimer}>
                <View style={{ flex: 1 }}>
                    {/* Welcome Screen */}
                    {showWelcome ? (
                        <ImageBackground source={WelcomeBg} style={styles.welcomeScreen}>
                            <View style={styles.overlay} />
                            <Text style={styles.welcomeText}>Welcome</Text>
                            <Text style={styles.subText}>Experience Seamless Visitor Management</Text>
                            <TouchableOpacity
                                style={styles.enterButton}
                                onPress={() => {
                                    setShowWelcome(false);
                                    resetIdleTimer(); // Start timer after entering
                                }}
                            >
                                <Text style={styles.buttonText}>Enter</Text>
                            </TouchableOpacity>
                        </ImageBackground>
                    ) : (
                        <ImageBackground source={MainBg} style={styles.mainScreen}>
                            <View style={styles.overlay} />

                            {/* Centered Main Heading */}
                            <Text style={styles.mainHeading}>Visitor Management System</Text>
                            <Text style={styles.mainHeading_description}>
                                Welcome! Please check in or check out to continue.
                            </Text>
                            {/* Left Side - Buttons */}
                            <View style={styles.leftSide}>

                                <TouchableOpacity
                                    style={[styles.button, styles.checkInBtn]}
                                    onPress={() => navigation.navigate('CheckIn')}
                                >
                                    <Text style={styles.buttonText}>Check In</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.button, styles.checkOutBtn]}>
                                    <Text style={styles.buttonText}>Check Out</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Right Side - QR Scanner */}
                            <View style={styles.rightSide}>
                                <Image source={ScannerImg} style={styles.scannerImg} />
                            </View>

                            <Text style={styles.mainHeading_footer}>
                                Experience seamless and secure entry with Touchless Check-In.
                                Simply scan the QR code to log in instantly—no contact, no hassle.
                            </Text>
                        </ImageBackground>

                    )}
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainHeading: {
        position: 'absolute',
        top: 40, // Adjust as needed
        width: '100%',
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    mainHeading_description: {
        position: 'absolute',
        top: 150, // Adjust as needed
        width: '100%',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    mainHeading_footer: {
        position: 'absolute',
        bottom: 150, // Adjust as needed
        width: '100%',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    container: {
        flex: 1,
    },
    welcomeScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    mainScreen: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    welcomeText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subText: {
        fontSize: 16,
        color: '#fff',
        marginTop: 10,
        textAlign: 'center',
    },
    enterButton: {
        backgroundColor: '#ffcc00',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    leftSide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingLeft: 60, // Increased left padding
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    description: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginVertical: 10,
    },
    button: {
        width: 200,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    checkInBtn: {
        backgroundColor: '#28a745',
    },
    checkOutBtn: {
        backgroundColor: '#dc3545',
    },
    rightSide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scannerText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    scannerImg: {
        width: 150,
        height: 150,
    },
});

export default FirstScreen;
