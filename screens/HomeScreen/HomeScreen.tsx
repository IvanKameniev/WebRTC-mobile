import * as React from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {useEffect, useState} from 'react';
import {CLIENT_ID_WEB, CLIENT_ID_ANDROID, CLIENT_ID_IOS} from '@env';

const clientIdWeb = CLIENT_ID_WEB;
const clientIdAndroid = CLIENT_ID_ANDROID;
const clientIdIos = CLIENT_ID_IOS;

export const HomeScreen = ({navigation}) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['email', 'profile'],
      androidClientId: clientIdAndroid,
      iosClientId: clientIdIos,
      webClientId: clientIdWeb,
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const accessToken = await GoogleSignin.getTokens();

      console.log('accessToken', accessToken)

      setAccessToken(accessToken);
      setUserInfo(userInfo);
      setLoggedIn(true);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUserInfo(null); // Remember to remove the user from your app's state as well
      setLoggedIn(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{flexDirection: 'column', alignItems: 'center'}}>
      <Text style={{fontSize: 24, marginTop: 40}}>Welcome</Text>

      <View>
        <View style={styles.sectionContainer}>
          <GoogleSigninButton
            style={{width: 192, height: 48}}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={signIn}
          />
        </View>
        <View style={styles.buttonContainer}>
          {!loggedIn && <Text>You are currently logged out</Text>}
          {loggedIn && (
            <Button onPress={signOut} title="LogOut" color="red"></Button>
          )}
          {/*{loggedIn && (*/}
          <Button
            style={{marginTop: 10}}
            title="Start"
            onPress={() => navigation.navigate('Device', {deviceId: ''})}
          />
          {/*)}*/}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonContainer: {
    alignSelf: 'center',
  },
})
