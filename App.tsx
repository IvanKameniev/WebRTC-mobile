import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {DeviceTabs, HomeScreen} from './screens';
// import NativeDevSettings from 'react-native/Libraries/NativeModules/specs/NativeDevSettings';

const Stack = createNativeStackNavigator();

const App = () => {
  // const connectToRemoteDebugger = () => {
  //   NativeDevSettings.setIsDebuggingRemotely(true);
  // };
  // connectToRemoteDebugger()

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          option={{title: 'Home'}}
          component={HomeScreen}
        />
        <Stack.Screen name="Device" component={DeviceTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
