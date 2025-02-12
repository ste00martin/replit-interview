import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const InputBar = ({ sendMessage, newMessage, setNewMessage}: {
  sendMessage: ()=> void;
  newMessage: string;
  setNewMessage: (input: string)=> void;
}) => {
  const { bottom } = useSafeAreaInsets()

  const scaleClosed = -bottom
  const scaleOpen = 0

  const bottomPadAnimation = useRef(
    new Animated.Value(scaleClosed),
  ).current

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(()=> {
    if(isKeyboardVisible) {
      Animated.timing(bottomPadAnimation, {
        toValue: scaleOpen,
        duration: 0,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(bottomPadAnimation, {
        toValue: scaleClosed,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [isKeyboardVisible])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardWillShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Animated.View style={[styles.inputContainer, {
        transform: [  {
          translateY:  bottomPadAnimation,
        },
      ],
    }]}>
      <View style={styles.inputContainerTop}>
      <TextInput
        style={styles.input}
        autoCapitalize='none'
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="type javascript here"
        placeholderTextColor="#666"
        multiline
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={sendMessage}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'column',
  },
  inputContainerTop: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadContainer: {
    backgroundColor: 'red',
    width: '100%',
  }
});

export default InputBar;