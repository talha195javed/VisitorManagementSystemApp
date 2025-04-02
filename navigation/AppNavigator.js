import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FirstScreen from '../screens/FirstScreen';
import CheckIn from '../screens/CheckIn';
import CheckOut from '../screens/CheckOut';
import SelectRole from '../screens/SelectRole';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="FirstScreen">
            <Stack.Screen name="FirstScreen" component={FirstScreen} />
            <Stack.Screen name="CheckIn" component={CheckIn} />
            <Stack.Screen name="CheckOut" component={CheckOut} />
            <Stack.Screen name="SelectRole" component={SelectRole} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
