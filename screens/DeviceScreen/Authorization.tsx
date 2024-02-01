import * as React from 'react';
import {Button, TextInput, View, StyleSheet, Text} from 'react-native';

export const Authorization = ({
  setDeviceId,
  deviceId,
  authorize,
  setToken,
  token,
}) => {
  return (
    <View style={{flexDirection: 'column'}}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Access Token</Text>
        <TextInput
          value={token}
          editable
          multiline
          placeholder="Access Token"
          minLength={45}
          style={styles.input}
          onChangeText={newText => setToken(newText)}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Device Id</Text>
        <TextInput
          value={deviceId}
          placeholder="Device Id"
          minLength={45}
          style={styles.input}
          onChangeText={newText => setDeviceId(newText)}
        />
      </View>
      <View style={styles.wrapper}>
        <Button title="Authorize" onPress={authorize} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
    width: '90%',
  },
  wrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    padding: 5,
    color: '#483d8b',
  },
});
