import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="FirstScreen" component={FirstScreen} />
                <Stack.Screen name="CheckIn" component={CheckIn} />
                <Stack.Screen name="VisitorDetails" component={VisitorDetails} />
                <Stack.Screen name="SelectRole" component={SelectRole} />
                <Stack.Screen name="SelectPurpose" component={SelectPurpose} />
                <Stack.Screen name="CaptureImage" component={CaptureImage} />
                <Stack.Screen name="CaptureId" component={CaptureId} />
                <Stack.Screen name="EmergencyContact" component={EmergencyContact} />
                <Stack.Screen name="Agreement" component={Agreement} />
                <Stack.Screen name="CheckInSuccessScreen" component={CheckInSuccessScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
