import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Crypto from 'expo-crypto';

const BackendContext = React.createContext<{
  evaluate: (code: string) => void
  messages: FlatListItem[]
}>({
  evaluate: ()=> { },
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

export interface EvalResponseBodyServer extends EvalResponseBody {
  sender: 'repl-server'
}

export type FlatListItem = ItemType | EvalResponseBodyServer

export function BackendProvider(props: React.PropsWithChildren) {
  const [serverUrl, setServerUrl] = useState('https://be9904a4-aced-4e4e-bea5-09e7b17b27a3-00-2pfvb1reqsovd.spock.replit.dev')
  const [sessionId, setSessionId] = useState<string|undefined>(undefined)

  const isConnected = !!serverUrl

  const [messages, setMessages] = useState<FlatListItem[]>([
    { id: '1', text: 'Welcome!', sender: 'repl-local' },
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
      if(!serverUrl) {
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
        cache: 'no-cache',
        body: JSON.stringify(body),
        headers: {
          "Content-type": "application/json"
        }
      });

      console.log('response', response)

      if (response.status !== 200) {
        throw new Error(`server responded with http ${response.status} code`)
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
      console.log('server url used', serverUrl)
      console.log('sessionid used', sessionId)
      const errorMessageAsString = String(error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          text: errorMessageAsString,
          sender: 'repl-local',
        },
      ]);
      setServerUrl('')
      setSessionId(undefined)

      console.log('backend error:', error);
    }
  }

  return (
    <BackendContext.Provider
      value={{
        evaluate,
        messages,
      }}
    >
      {props.children}
    </BackendContext.Provider>
  )
}
