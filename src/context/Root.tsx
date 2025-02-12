import React from 'react'

import { BackendProvider } from './Backend'

// this has to be named index because of expo-router
const RootProvider = (props: React.PropsWithChildren) => {
  return (
    <BackendProvider>
      {/*todo: <SplashProvider> */}
        {props.children}
        {/* </SplashProvider> */}
    </BackendProvider>
  )
}

export default RootProvider
