import React, { useState, useEffect } from 'react';
import {
    View, Text, Image, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, ImageBackground
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CaptureVisitorPhoto = ({ route }) => {
    const { visitorId } = route.params;
    const navigation = useNavigation();
    const [photoUri, setPhotoUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadedPhoto, setUploadedPhoto] = useState(null);

    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        try {
            const cameraPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA
            );
            const storagePermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );

            if (cameraPermission !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Permissions Required', 'Camera permission is required to capture photos.');
                return false;
            }

            // if (storagePermission !== PermissionsAndroid.RESULTS.GRANTED) {
            //     Alert.alert('Permissions Required', 'Storage permission is required to upload photos.');
            //     return false;
            // }

            return true;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };


    const capturePhoto = async () => {
        launchCamera({ mediaType: 'photo', quality: 1 }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled photo capture');
            } else if (response.errorCode) {
                console.error('ImagePicker Error:', response.errorMessage);
            } else {
                setPhotoUri(response.assets[0].uri);
            }
        });
    };

    const uploadPhoto = async () => {
        if (!photoUri) {
            Alert.alert('Error', 'Please capture a photo first.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('photo', {
            uri: photoUri,
            type: 'image/jpeg',
            name: `visitor_${visitorId}.jpg`
        });
        formData.append('visitor_id', visitorId);

        try {
            console.log('Visitor ID:', visitorId);
            console.log('Photo URI:', photoUri);
            console.log('FormData:', formData);

            const response = await fetch('http://10.0.2.2:8000/api/visitor/storeAppCapturedImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/json',
                },
                body: formData,
            });
            const data = await response.json();

            if (response.ok) {
                setUploadedPhoto(data.photo_url);
                Alert.alert('Success', 'Photo uploaded successfully!');

                const visibleScreens = data.visibleFields || [];
                if (visibleScreens.includes('capture_id')) {
                    navigation.navigate('CaptureId', { visitorId });
                } else if (visibleScreens.includes('emergency_contact')) {
                    navigation.navigate('EmergencyContact', { visitorId });
                } else {
                    navigation.navigate('Agreement', { visitorId });
                }
            } else {
                Alert.alert('Error', 'Failed to upload photo.');
            }
        } catch (error) {
            console.error('Upload failed', error);
            Alert.alert('Error', 'An error occurred during the upload.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={require('../assets/images/checkin6.jpg')} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Capture Visitor Photo</Text>
                <Text style={styles.subtitle}>Align your face and click the button to capture.</Text>

                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.imagePreview} />
                ) : (
                    <View style={styles.cameraPreview}>
                        <Text style={styles.cameraText}>Camera Preview</Text>
                    </View>
                )}

                <TouchableOpacity onPress={capturePhoto} style={styles.captureButton}>
                    <Text style={styles.captureButtonText}>📸 Capture Photo</Text>
                </TouchableOpacity>

                {uploadedPhoto && (
                    <>
                        <Text style={styles.previewLabel}>Uploaded Image Preview:</Text>
                        <Image source={{ uri: uploadedPhoto }} style={styles.capturedImage} />
                    </>
                )}

                <TouchableOpacity onPress={uploadPhoto} style={styles.saveButton} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>💾 Save Photo</Text>}
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
        padding: 16,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginVertical: 10,
    },
    cameraPreview: {
        width: 320,
        height: 240,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    cameraText: {
        color: '#fff',
        fontSize: 18,
    },
    captureButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#007bff',
        borderRadius: 8,
    },
    captureButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    imagePreview: {
        width: 320,
        height: 240,
        borderRadius: 8,
        marginTop: 20,
    },
    previewLabel: {
        marginTop: 10,
        fontWeight: '600',
        color: '#fff',
    },
    capturedImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginTop: 10,
        opacity: 0.8,
    },
    saveButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#28a745',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default CaptureVisitorPhoto;
