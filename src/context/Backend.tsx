import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Crypto from 'expo-crypto';

const BackendContext = React.createContext<{
  isConnected: boolean | null
  evaluate: (code: string) => void
  setServerUrl: (code: string) => void
  messages: FlatListItem[]
}>({
  isConnected: null,
  evaluate: ()=> { },
  setServerUrl: ()=> { },
  messages: [],
})

// This hook can be used to access the user info.
export function useBackend() {
  const value = React.useContext(BackendContext)
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <BackendProvider />')
    }
  }

  return value
}

export type SenderType = 'repl-local' | 'user' | 'repl-server'

export type ItemType = {
  id: string;
  text: string
  sender: SenderType
}

// from backend
export type SerializedType =
  | { type: 'object'; value: Array<{ key: string; value: string }> }
  | { type: 'array'; value: string[] }
  | { type: 'error'; value: { name: string; message: string; stack: string } }
  | { type: 'undefined'; value: string }
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean };

export interface EvalResponseBody {
  root: string;
  serialized: {
    [key: string]: SerializedType;
  };
}

export interface EvalResponseBodyLocal extends EvalResponseBody {
  sender: 'repl-server'
}

export type FlatListItem = ItemType | EvalResponseBodyLocal

export function BackendProvider(props: React.PropsWithChildren) {
  const [serverUrl, _setServerUrl] = useState('')
  const [sessionId, setSessionId] = useState<string|undefined>(undefined)

  const isConnected = !!serverUrl

  const [messages, setMessages] = useState<FlatListItem[]>([
    { id: '1', text: 'Welcome!', sender: 'repl-local' },
    // { id: '2', text: 'Hi there!', sender: 'user' },
  ]);

  useEffect(()=> {
    if(!isConnected) {
      // prompt for connection url
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          text: 'please provide a url to connect to a server',
          sender: 'repl-local',
        },
      ]);
      setSessionId('')
    } else {
      setMessages(prevMessages => [
        {
          id: Date.now().toString(),
          text: 'ready to repl!',
          sender: 'repl-local',
        },
      ]);
      const UUID = Crypto.randomUUID();
      setSessionId(UUID)
    }
  }, [isConnected])


  const evaluate = async (code: string) => {
    try {
      if(!isConnected) {
        setServerUrl(code)
        return;
      }

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          text: code,
          sender: 'user',
        },
      ]);


      const body = {
        code,
        sessionId,
      }
      console.log('body is', body)
      const response =  await fetch(`${serverUrl}/eval`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-type": "application/json"
        }
      });
      console.log('response is ', response)
      console.log('response status', response.status)
      if (response.status !== 200) {
        Alert.alert('server error!', `HTTP error! status: ${response.status}`)
      }
      const data: EvalResponseBody = await response.json();
      console.log('response back is')
      console.log(data);
      console.log('EvalResponseBody is data')

      setMessages(prevMessages => [
        ...prevMessages,
        {
          ...data,
          sender: 'repl-server',
        },
      ]);

    } catch (error) {
      setServerUrl('')
      console.warn('backend error:', error);
    }
  }

  // const sendMessage = () => {
  //   if(!isConnected) {
  //     attemptBackendConnect(newMessage.trim())
  //     return
  //   }

  //   if (newMessage.trim()) {
  //     const newMessageToSend = newMessage.trim();
  //     setMessages(prevMessages => [
  //       ...prevMessages,
  //       {
  //         id: Date.now().toString(),
  //         text: newMessageToSend,
  //         sender: 'user',
  //       },
  //     ]);
  //     setNewMessage('');
  //     evaluate(newMessageToSend)

  //     // Simulate received message
  //     setTimeout(() => {
  //       setMessages(prevMessages => [
  //         ...prevMessages,
  //         {
  //           id: Date.now().toString(),
  //           text: 'Thanks for your message!',
  //           sender: 'repl',
  //         },
  //       ]);
  //     }, 1000);
  //   }
  // };


  const setServerUrl = (newUrl: string) => {
    // remove all spaces from newUrlString
    const removedSpaces = newUrl.replaceAll(' ', '')
    _setServerUrl(removedSpaces)

  }

  return (
    <BackendContext.Provider
      value={{
        isConnected,
        evaluate,
        setServerUrl,
        messages,
      }}
    >
      {props.children}
    </BackendContext.Provider>
  )
}
