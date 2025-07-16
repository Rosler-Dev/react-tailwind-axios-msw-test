import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { worker } from './api/mocks/browser';

async function start() {
  if (process.env.NODE_ENV === "development") {
    await worker.start();
  }
  
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

start();
