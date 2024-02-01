import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
} from 'react-native';
import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCView,
} from 'react-native-webrtc';

export const Debugging = ({send2WS, logMessage}): React.JSX.Element => {
  const [deviceLog, setDeviceLog] = useState('');
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [command, setCommand] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [ussd, setUssd] = useState('');
  const [type, setType] = useState('');
  const [json, setJson] = useState('');

  const scrollViewRef = useRef();
  let pc = null;

  useEffect(() => {
    if (!!logMessage) {
      switch (logMessage.type) {
        case 'webRTCAnswer':
          handleAnswer(logMessage.answer);
          break;
        case 'ICECandidate':
          handleCandidate(logMessage.candidate);
          break;
        default:
          handleDeviceLog(JSON.stringify(logMessage));
          break;
      }
    }
  }, [logMessage]);

  const servers = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
      {
        urls: 'stun:stun1.l.google.com:19302',
      },
      {
        urls: 'stun:stun2.l.google.com:19302',
      },
    ],
    iceCandidatePoolSize: 10,
  };

  function sendCmdMessage() {
    send2WS({
      type: 'cmd',
      data: command,
    });
  }

  const handleAnswer = answer => {
    console.log('handleAnswer', answer);
    pc.setRemoteDescription(answer);
  };

  const handleCandidate = candidate => {
    console.log('handleCandidate', candidate);
    pc.addIceCandidate(candidate);
  };

  const handleDeviceLog = line => {
    setDeviceLog(prev => prev + line + '\n');
  };

  const sendSMS = () => {
    send2WS({
      type: 'sms',
      data: {number: phone, message: message},
    });
  };

  const sendUSSD = () => {
    send2WS({
      type: 'ussd',
      data: ussd,
    });
  };

  const callAnswer = () => {
    createWRTCConnection(() => {
      sendCmdMessage('ATA');
    });
  };

  // Send message to drop call, and terminate RTC
  const callDrop = () => {
    sendCmdMessage('ATH');
    terminateRTC();
  };

  const createWRTCConnection = async (callback = null) => {
    pc = new RTCPeerConnection(servers);

    pc.addEventListener('icecandidate', e => onIceCandidate(pc, e));
    function onIceCandidate(pc, event) {
      console.log('onIceCandidate', event);

      if (event.candidate) {
        send2WS({
          type: 'ICECandidate',
          candidate: event.candidate,
        });
      }
      console.log(`ICE candidate:
          ${event.candidate ? event.candidate.candidate : '(null)'}
        `);
    }

    const local = await mediaDevices.getUserMedia({
      video: {
        frameRate: 30,
        facingMode: 'user',
      },
      audio: true,
    });

    local.getTracks().forEach(track => {
      pc.addTrack(track, local);
    });

    setLocalStream(local);
    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.addEventListener('track', event => {
      // Grab the remote track from the connected participant.
      remote.addTrack(event.track, remote);
    });

    // local.getTracks().forEach(track => pc.addTrack(track, local));

    // Push tracks from local stream to peer connection
    // local.getTracks().forEach(track => {
    //   console.log(pc.getLocalStreams());
    //   pc.getLocalStreams()[0].addTrack(track);
    // });

    // Pull tracks from remote stream, add to video stream
    // pc.ontrack = event => {
    //   event.streams[0].getTracks().forEach(track => {
    //     remote.addTrack(track);
    //   });
    // };

    // pc.onaddstream = event => {
    //   setRemoteStream(event.stream);
    // };
    //
    // pc.createOffer()
    //   .then(offer => {
    //     return pc.setLocalDescription(offer);
    //   })
    //   .then(() => {
    //     send2WS({
    //       type: 'webRTCOffer',
    //       offer: pc.localDescription,
    //     });
    //   })
    //   .catch(e => console.log(e));
    //
    // pc.onconnectionstatechange = event => {
    //   console.log(event, pc.connectionState);
    // };

    callback();
  };

  const terminateRTC = async () => {
    pc.close();
    pc = null;
  };

  const sendDebug = () => {
    send2WS({
      type: type,
      data: JSON.parse(json),
    });
  };

  return (
    <ScrollView style={{flexDirection: 'column'}}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Log / Messages from device</Text>
        <ScrollView
          style={styles.scrollView}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({animated: true})
          }>
          <Text style={styles.text}>{deviceLog}</Text>
        </ScrollView>
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Send Command</Text>
        <TextInput
          value={command}
          placeholder="Command"
          style={styles.input}
          onChangeText={newText => setCommand(newText)}
        />
        <View style={{flexDirection: 'row'}}>
          <Button title="Send command" onPress={sendCmdMessage} />
          <Button title="Answer call" onPress={callAnswer} />
          <Button title="Drop call" onPress={callDrop} />
        </View>
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.title}>SMS Sender</Text>
        <TextInput
          value={phone}
          placeholder="Recipient Phone Number"
          style={styles.input}
          onChangeText={newText => setPhone(newText)}
        />
        <TextInput
          value={message}
          multiline
          placeholder="Message"
          style={{...styles.input, marginTop: 10}}
          onChangeText={newText => setMessage(newText)}
        />
        <Button title="Send SMS" onPress={sendSMS} />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.title}>USSD Request</Text>
        <TextInput
          value={ussd}
          placeholder="USSD command"
          style={styles.input}
          onChangeText={newText => setUssd(newText)}
        />
        <Button title="Send USSD" onPress={sendUSSD} />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Debug</Text>
        <TextInput
          value={type}
          placeholder="Type"
          style={styles.input}
          onChangeText={newText => setType(newText)}
        />
        <TextInput
          value={json}
          multiline
          placeholder="JSON"
          style={{...styles.input, marginTop: 10}}
          onChangeText={newText => setJson(newText)}
        />
        <Button title="Send data" onPress={sendDebug} />
      </View>

      {localStream && (
        <RTCView
          streamURL={localStream?.toURL()}
          style={styles.stream}
          objectFit="cover"
          mirror
        />
      )}

      {remoteStream && (
        <RTCView
          streamURL={remoteStream?.toURL()}
          style={styles.stream}
          objectFit="cover"
          mirror
        />
      )}

    </ScrollView>
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
  scrollView: {
    height: 120,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'black',
    width: '90%',
    padding: 5,
  },
  text: {
    fontSize: 14,
  },
  stream: {
    flex: 2,
    width: 200,
    height: 200,
  },
});
