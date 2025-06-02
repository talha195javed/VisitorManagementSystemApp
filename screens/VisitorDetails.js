import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View, Text, TextInput, Alert, ImageBackground, TouchableOpacity, StyleSheet, Modal, Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { Camera, useCameraDevices } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';

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

    // New states for camera
    const [cameraOpen, setCameraOpen] = useState(false);
    const [capturedImageUri, setCapturedImageUri] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const devices = useCameraDevices();
    const device = Array.isArray(devices)
        ? devices.find(d => d.position === 'back')
        : Object.values(devices).find(d => d.position === 'back');

    const cameraRef = useRef(null);

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

    // Function to request camera permissions on mount (optional)
    useEffect(() => {
        (async () => {
            const status = await Camera.getCameraPermissionStatus();
            console.log('Camera permission status:', status);

            if (status !== 'authorized' && status !== 'granted') {
                const newStatus = await Camera.requestCameraPermission();
                console.log('Camera request permission result:', newStatus);
                if (newStatus !== 'authorized' && newStatus !== 'granted') {
                    Alert.alert('Camera permission is required');
                }
            }
        })();
    }, []);

    const handleCapture = async (camera) => {
        try {
            const photo = await camera.takePhoto({
                qualityPrioritization: 'quality',
                flash: 'off',
            });
            setCapturedImageUri('file://' + photo.path);
            setCameraOpen(false);

            const result = await TextRecognition.recognize('file://' + photo.path);
            console.log('OCR result:', result);

            let fullText = '';
            if (result && typeof result === 'object') {
                if (typeof result.text === 'string') {
                    fullText = result.text;
                } else if (Array.isArray(result.blocks)) {
                    fullText = result.blocks.map(block => block.text).join('\n');
                }
            } else if (typeof result === 'string') {
                fullText = result;
            } else {
                console.warn('Unexpected OCR result format:', result);
            }

            const nameLine = fullText
                .split('\n')
                .find(line => line.trim().toLowerCase().startsWith('name:'));

            let extractedName = '';
            if (nameLine) {
                extractedName = nameLine.substring(nameLine.indexOf(':') + 1).trim();
            }
            setExtractedText(fullText);
            setVisitorData({ ...visitorData, full_name: extractedName });
        } catch (err) {
            console.error('Capture error:', err);
            Alert.alert('Error capturing image');
        }
    };

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
                    <>
                        <TouchableOpacity style={styles.cameraButton} onPress={() => setCameraOpen(true)}>
                            <Text style={styles.cameraButtonText}>Scan Id</Text>
                        </TouchableOpacity>

                        {/* Show preview if image captured */}
                        {capturedImageUri && (
                            <Image source={{ uri: capturedImageUri }} style={styles.previewImage} />
                        )}

                        {/* Show extracted text input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Extracted Text"
                            value={extractedText}
                            onChangeText={(text) => {
                                setExtractedText(text);
                                setVisitorData({ ...visitorData, full_name: text });
                            }}
                        />

                        {/* Original full_name input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={visitorData.full_name}
                            onChangeText={(text) => setVisitorData({ ...visitorData, full_name: text })}
                        />
                    </>
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

                {/* rest of fields... */}

                <TouchableOpacity style={styles.button} onPress={handleProceed}>
                    <Text style={styles.buttonText}>Proceed</Text>
                </TouchableOpacity>

                {/* Camera Modal */}
                <Modal visible={cameraOpen} animationType="slide" transparent={false}>
                    {device ? (
                        <>
                            <Camera
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={cameraOpen}
                                photo={true}
                                ref={cameraRef}
                            />
                            {/* Overlay buttons */}
                            <View style={styles.cameraControls}>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={async () => {
                                        if (cameraRef.current) {
                                            await handleCapture(cameraRef.current);
                                        }
                                    }}
                                >
                                    <Text style={styles.captureButtonText}>Capture</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setCameraOpen(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text>Loading Camera...</Text>
                        </View>
                    )}
                </Modal>
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
    cameraButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    cameraButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    previewImage: {
        width: '100%',
        height: 200,
        marginBottom: 10,
        borderRadius: 10,
    },
    cameraControls: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingVertical: 10,
    },
    captureButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 50,
        width: 100,
        alignItems: 'center',
    },
    captureButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 50,
        width: 100,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default VisitorDetails;
