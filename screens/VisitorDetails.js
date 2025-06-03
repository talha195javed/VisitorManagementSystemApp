import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    TextInput,
    Alert,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const VisitorDetails = ({ route, navigation }) => {
    const { visibleFields, visitorId: routeVisitorId } = route.params || {};

    const [visitorId, setVisitorId] = useState(routeVisitorId || null);
    const [visitorData, setVisitorData] = useState({
        full_name: '',
        company: '',
        email: '',
        phone: '',
        id_type: '',
        identification_number: '',
        date_of_birth: '',
        gender: '',
    });

    const [clientId, setClientId] = useState('');
    const [cameraOpen, setCameraOpen] = useState(false);
    const [capturedImageUri, setCapturedImageUri] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [validationStatus, setValidationStatus] = useState(null); // 'good' or 'bad'

    // Upload states
    const [uploading, setUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

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
            } catch (error) {
                console.error('Error reading ClientId from AsyncStorage:', error);
            }
        };
        fetchClientId();
    }, []);

    useEffect(() => {
        (async () => {
            const status = await Camera.getCameraPermissionStatus();
            if (status !== 'authorized' && status !== 'granted') {
                const newStatus = await Camera.requestCameraPermission();
                if (newStatus !== 'authorized' && newStatus !== 'granted') {
                    Alert.alert('Camera permission is required');
                }
            }
        })();
    }, []);

    const uploadCapturedImage = async (uri) => {
        if (!visitorId) {
            console.warn('Visitor ID not set, cannot upload');
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append('photo', {
            uri,
            type: 'image/jpeg',
            name: `visitor_${visitorId}_${Date.now()}.jpg`,
        });
        formData.append('visitor_id', visitorId);

        try {
            const response = await fetch('http://10.0.2.2:8000/api/visitor/storeAppIdCapturedImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUploadedImageUrl(data.photo_url);
                Alert.alert('Success', 'ID card image uploaded successfully!');
            } else {
                Alert.alert('Upload failed', data.message || 'Failed to upload image.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload error', 'An error occurred while uploading the image.');
        } finally {
            setUploading(false);
        }
    };

    const processCapturedImage = async (imageUri) => {
        try {
            const result = await TextRecognition.recognize(imageUri);

            let fullText = '';
            if (result && typeof result === 'object') {
                if (typeof result.text === 'string') {
                    fullText = result.text;
                } else if (Array.isArray(result.blocks)) {
                    fullText = result.blocks.map(block => block.text).join('\n');
                }
            } else if (typeof result === 'string') {
                fullText = result;
            }

            setExtractedText(fullText);

            // Parse fields
            let extractedName = '';
            let extractedFirstName = '';
            let extractedLastName = '';
            let extractedDOB = '';
            let extractedGender = '';
            let extractedID = '';

            const lines = fullText.split('\n');

            lines.forEach(line => {
                const lower = line.toLowerCase();

                if (lower.includes('name:')) {
                    const value = line.split(':')[1]?.trim() || '';
                    extractedName = value;
                } else if (lower.includes('first name:')) {
                    extractedFirstName = line.split(':')[1]?.trim() || '';
                } else if (lower.includes('surname:') || lower.includes('last name:')) {
                    extractedLastName = line.split(':')[1]?.trim() || '';
                } else if (lower.includes('dob:') || lower.includes('date of birth:')) {
                    extractedDOB = line.split(':')[1]?.trim() || '';
                } else if (lower.includes('gender:')) {
                    extractedGender = line.split(':')[1]?.trim() || '';
                } else if ((lower.includes('id') || lower.includes('identification')) && lower.includes('no')) {
                    extractedID = line.split(':')[1]?.trim() || '';
                }
            });

            // Compose full name if separate first and last names found and no full name detected
            if (!extractedName && (extractedFirstName || extractedLastName)) {
                extractedName = (extractedFirstName + ' ' + extractedLastName).trim();
            }

            setVisitorData(prev => ({
                ...prev,
                full_name: extractedName,
                identification_number: extractedID,
                date_of_birth: extractedDOB,
                gender: extractedGender,
            }));

            if (extractedName) {
                setValidationStatus('good');
                Alert.alert('Success', 'ID card captured and parsed.');
            } else {
                setValidationStatus('bad');
                Alert.alert(
                    'Warning',
                    'Could not reliably parse the ID card info. Please check manually.'
                );
            }
        } catch (err) {
            Alert.alert('Error processing image');
        }
    };

    const handleCapture = async (camera) => {
        try {
            const photo = await camera.takePhoto({
                qualityPrioritization: 'quality',
                flash: 'off',
            });
            const uri = 'file://' + photo.path;
            setCapturedImageUri(uri);
            setCameraOpen(false);

            await processCapturedImage(uri);

            // Upload image to backend
            await uploadCapturedImage(uri);
        } catch (err) {
            console.error('Capture error:', err);
            Alert.alert('Error capturing image');
        }
    };

    const handleProceed = async () => {
        if (!visitorData.full_name) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        try {
            const payload = {
                ...visitorData,
                client_id: clientId,
            };

            const response = await fetch('http://10.0.2.2:8000/api/visitor/store-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.visitor?.id) {
                const visitorIdReturned = data.visitor.id;
                if (!visitorId) setVisitorId(visitorIdReturned); // save visitorId for uploads
                const nextScreen = data.next_screen;

                switch (nextScreen) {
                    case 'select_role':
                        navigation.navigate('SelectRole', { visitorId: visitorIdReturned });
                        break;
                    case 'select_purpose':
                        navigation.navigate('SelectPurpose', { visitorId: visitorIdReturned });
                        break;
                    case 'capture_image':
                        navigation.navigate('CaptureImage', { visitorId: visitorIdReturned });
                        break;
                    case 'capture_id':
                        navigation.navigate('CaptureId', { visitorId: visitorIdReturned });
                        break;
                    case 'emergency_contact':
                        navigation.navigate('EmergencyContact', { visitorId: visitorIdReturned });
                        break;
                    default:
                        navigation.navigate('Agreement', { visitorId: visitorIdReturned });
                }
            } else {
                Alert.alert('Error', data.message || 'Something went wrong!');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server. Check your internet connection.');
        }
    };

    return (
        <ImageBackground source={require('../assets/images/checkin6.jpg')} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Visitor Details</Text>

                {visibleFields?.includes('full_name') && (
                    <>
                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={() => {
                                setValidationStatus(null);
                                setCameraOpen(true);
                            }}
                        >
                            <Text style={styles.cameraButtonText}>Scan Id</Text>
                        </TouchableOpacity>

                        {capturedImageUri && <Image source={{ uri: capturedImageUri }} style={styles.previewImage} />}

                        {uploading && <Text style={{ color: 'orange', marginBottom: 10 }}>Uploading image...</Text>}

                        {uploadedImageUrl && (
                            <>
                                <Text style={{ marginBottom: 5 }}>Uploaded Image Preview:</Text>
                                <Image source={{ uri: uploadedImageUrl }} style={{ width: 150, height: 150, borderRadius: 10, marginBottom: 10 }} />
                            </>
                        )}

                        {validationStatus === 'good' && (
                            <Text style={[styles.feedbackText, { color: 'green' }]}>ID looks good!</Text>
                        )}
                        {validationStatus === 'bad' && (
                            <Text style={[styles.feedbackText, { color: 'red' }]}>Please recapture the ID clearly.</Text>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={visitorData.full_name}
                            onChangeText={text => setVisitorData(prev => ({ ...prev, full_name: text }))}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Date of Birth"
                            value={visitorData.date_of_birth}
                            onChangeText={text => setVisitorData(prev => ({ ...prev, date_of_birth: text }))}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Gender"
                            value={visitorData.gender}
                            onChangeText={text => setVisitorData(prev => ({ ...prev, gender: text }))}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="ID Number"
                            value={visitorData.identification_number}
                            onChangeText={text => setVisitorData(prev => ({ ...prev, identification_number: text }))}
                        />
                    </>
                )}

                {visibleFields?.includes('company') && (
                    <TextInput
                        style={styles.input}
                        placeholder="Company"
                        value={visitorData.company}
                        onChangeText={text => setVisitorData(prev => ({ ...prev, company: text }))}
                    />
                )}

                <TouchableOpacity style={styles.button} onPress={handleProceed}>
                    <Text style={styles.buttonText}>Proceed</Text>
                </TouchableOpacity>

                <Modal visible={cameraOpen} animationType="slide" transparent={false}>
                    {device ? (
                        <View style={{ flex: 1 }}>
                            <Camera
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={cameraOpen}
                                photo={true}
                                ref={cameraRef}
                            />
                            <View style={styles.overlay}>
                                <View style={styles.frame} />
                            </View>
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
                        </View>
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
    feedbackText: {
        marginBottom: 10,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    frame: {
        width: 320,
        height: 200,
        borderWidth: 3,
        borderColor: '#00FF00',
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
});

export default VisitorDetails;
