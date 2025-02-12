import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SearchBar from '../components/InputBar';
import { FlatListItem, useBackend, EvalResponseBodyServer } from '../context/Backend';
import SerializedDisplay from '../components/SerializedDisplay';

const MainRepl = () => {

  const { messages, evaluate } = useBackend()

  const [newMessage, setNewMessage] = useState('');

  const { top, bottom } = useSafeAreaInsets()

  const sendMessage = () => {
    const newMessageToSend = newMessage.trim();

    if (newMessageToSend) {
      evaluate(newMessageToSend)
      setNewMessage('');
    }
  };
  function isServerResponse(item: FlatListItem): item is EvalResponseBodyServer {
    return (item as EvalResponseBodyServer).sender === 'repl-server';
  }

  const renderMessage = ({ item }: { item: FlatListItem}) => {
    if(isServerResponse(item)) {
      return <SerializedDisplay response={item} />
    }

    return (
      <View
        style={[
          styles.messageBubble,
          item.sender === 'user'
            ? styles.userMessage
            : styles.replMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    )
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        ListHeaderComponent={()=> {
          return <View style={{height: top}}></View>
        }}
        ListFooterComponent={()=> {
          return <View style={{height: bottom+40}}></View>
        }}
        keyExtractor={item => {
          if(isServerResponse(item)) {
            return item.root
          }
          return item.id
        }}
        style={styles.messageList}
        inverted={false}
      />
      <SearchBar newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage}/>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  replMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'grey',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default MainRepl;