import './init';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useRPC } from './lib/useRPC';
import { useWeb3 } from './lib/useWeb3';

function EmbeddedApp() {
  const web3 = useWeb3(useRPC().sendRPC);

  return <App web3={web3} />
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <EmbeddedApp />
  </React.StrictMode>
)
