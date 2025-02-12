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
import { ItemType, useBackend } from '../context/Backend';

const MainRepl = () => {

  const { messages, evaluate } = useBackend()

  const [newMessage, setNewMessage] = useState('');

  // get top inset
  const { top } = useSafeAreaInsets()


  const sendMessage = () => {
    const newMessageToSend = newMessage.trim();

    if (newMessageToSend) {
      evaluate(newMessageToSend)
      setNewMessage('');

      // // Simulate received message
      // setTimeout(() => {
      //   setMessages(prevMessages => [
      //     ...prevMessages,
      //     {
      //       id: Date.now().toString(),
      //       text: 'Thanks for your message!',
      //       sender: 'other',
      //     },
      //   ]);
      // }, 1000);
    }
  };

  const renderMessage = ({ item }: { item: ItemType}) => (
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
  );

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
        keyExtractor={item => item.id}
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