import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FirstScreen from './screens/FirstScreen';
import CheckIn from './screens/CheckIn';
import VisitorDetails from './screens/VisitorDetails';
import SelectRole from './screens/SelectRole';
import SelectPurpose from './screens/SelectPurpose';
import CaptureImage from './screens/CaptureImage';
import CaptureId from './screens/CaptureId';
import EmergencyContact from './screens/EmergencyContact';
import Agreement from './screens/Agreement';
import CheckInSuccessScreen from './screens/CheckInSuccessScreen';
import CheckOut from './screens/CheckOut';
import LoginScreen from './screens/LoginScreen';

const Stack = createStackNavigator();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                setIsLoggedIn(!!token);
            } catch (error) {
                console.error('Error checking login status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, []);

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!isLoggedIn ? (
                    <Stack.Screen
                        name="Login"
                        options={{ headerShown: false }}
                    >
                        {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                    </Stack.Screen>
                ) : (
                    <>
                        <Stack.Screen
                            name="FirstScreen"
                            options={({ navigation }) => ({
                                headerRight: () => (
                                    <TouchableOpacity
                                        onPress={async () => {
                                            await AsyncStorage.removeItem('authToken');
                                            setIsLoggedIn(false);
                                            navigation.replace('Login');
                                        }}
                                        style={{ marginRight: 15 }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
                                    </TouchableOpacity>
                                ),
                                headerStyle: {
                                    backgroundColor: '#1e88e5',
                                },
                                headerTintColor: '#fff',
                                headerTitleStyle: {
                                    fontWeight: 'bold',
                                },
                            })}
                        >
                            {(props) => <FirstScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                        </Stack.Screen>
                        <Stack.Screen name="CheckIn" component={CheckIn} />
                        <Stack.Screen name="VisitorDetails" component={VisitorDetails} />
                        <Stack.Screen name="SelectRole" component={SelectRole} />
                        <Stack.Screen name="SelectPurpose" component={SelectPurpose} />
                        <Stack.Screen name="CaptureImage" component={CaptureImage} />
                        <Stack.Screen name="CaptureId" component={CaptureId} />
                        <Stack.Screen name="EmergencyContact" component={EmergencyContact} />
                        <Stack.Screen name="Agreement" component={Agreement} />
                        <Stack.Screen name="CheckInSuccessScreen" component={CheckInSuccessScreen} />
                        <Stack.Screen name="CheckOut" component={CheckOut} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
