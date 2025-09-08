import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')).render(
  //TODO//removing <StrictMode></StrictMode>
  <StrictMode>
    <Auth0Provider
      domain="dev-v1b5qi2oaj7rxnb7.us.auth0.com"
      clientId="wMkdDqvsGX52LdTxmnsCFOJctizFdFts"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)
