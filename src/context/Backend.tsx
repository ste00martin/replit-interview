import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Crypto from 'expo-crypto';

const BackendContext = React.createContext<{
  isConnected: boolean | null
  evaluate: (code: string) => void
  setServerUrl: (code: string) => void
  messages: ItemType[]
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

export type SenderType = 'repl' | 'user'

export type ItemType = {
  id: string;
  text: string
  sender: SenderType
}

export function BackendProvider(props: React.PropsWithChildren) {
  const [serverUrl, _setServerUrl] = useState('')
  const [sessionId, setSessionId] = useState<string|undefined>(undefined)

  const isConnected = !!serverUrl

  const [messages, setMessages] = useState<ItemType[]>([
    { id: '1', text: 'Welcome!', sender: 'repl' },
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
          sender: 'repl',
        },
      ]);
      setSessionId('')
    } else {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          text: 'ready to repl!',
          sender: 'repl',
        },
      ]);
    }
  }, [isConnected])


  const evaluate = async (code: string) => {
    try {
      if(!isConnected) {
        setServerUrl(code)
        return;
      }


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

      if (!response.ok) {
        Alert.alert('server error!', `HTTP error! status: ${response.status}`)
      }
      const data = await response.json();
      console.log('response back is')
      console.log(data);
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

    // setTimeout(() => {
    //   evaluate('1+1')
    // }, 3000);
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
