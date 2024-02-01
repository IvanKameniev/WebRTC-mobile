import {useEffect, useState} from 'react';
import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {Authorization} from './Authorization';
import {Connection} from './Connection';
import {Settings} from './Settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Debugging} from './Debugging';

const Tab = createBottomTabNavigator();

export function DeviceTabs({route}) {
  const [deviceId, setDeviceId] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getData('accessToken', setToken);
    getData('deviceIdInput', setDeviceId);
  }, []);

  console.log(route.params.deviceId);

  const getData = async (key, callback) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        callback(value);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const config = {
    ws: 'ws://gsm-proxy-exs.glitch.me/user',
    // http: 'https://gsm-proxy-exs.glitch.me/',
  };

  let ws = new WebSocket(config.ws);

  ws.addEventListener('open', _ => {
    console.log('The connection has been opened successfully.');
    authorize();
  });

  ws.addEventListener('close', _ => {
    console.log('The connection has been closed successfully.');
  });

  ws.addEventListener('error', event => {
    console.log('WebSocket error: ', event);
  });

  ws.addEventListener('message', async event => {
    const message = JSON.parse(event.data);
    console.log(message);
    setMessage(message);
  });

  function send2WS(obj, skipDeviceId, skipTag) {
    if (!skipDeviceId) {
      obj.deviceId = deviceId;
    }
    if (!skipTag) {
      obj.tag = makeid(5);
    }
    ws.send(JSON.stringify(obj));
  }

  function makeid(length) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  const authorize = () => {
    if (!token || !deviceId) {
      return;
    }
    send2WS(
      {
        type: 'token',
        token: token,
      },
      true,
    );
    storeData('accessToken', token);
    storeData('deviceIdInput', deviceId);
    setTimeout(keepAlive, 45000);
  };

  const keepAlive = () => {
    send2WS(
      {
        type: 'ping',
      },
      false,
      true,
    );
    setTimeout(keepAlive, 45000);
  };

  const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Authorization"
      screenOptions={{
        tabBarActiveTintColor: '#e91e63',
      }}>
      <Tab.Screen
        name="Authorization"
        options={{
          tabBarLabel: 'Authorization',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}>
        {props => (
          <Authorization
            {...props}
            deviceId={deviceId}
            setDeviceId={setDeviceId}
            authorize={authorize}
            token={token}
            setToken={setToken}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Connection"
        options={{
          tabBarLabel: 'Connection',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="transit-connection-variant" color={color} size={size} />
          ),
        }}>
        {props => (
          <Connection {...props} send2WS={send2WS} logMessage={message} />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Debugging"
        options={{
          tabBarLabel: 'Debugging',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="tools" color={color} size={size} />
          ),
        }}>
        {props => (
          <Debugging {...props} send2WS={send2WS} logMessage={message} />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({color, size}) => (
            <Feather name="settings" color={color} size={size} />
          ),
        }}>
        {props => <Settings {...props} send2WS={send2WS} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
