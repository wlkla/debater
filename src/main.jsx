
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import App from './App.jsx';
import './index.css';

const AntdConfig = {
  token: {
    colorPrimary: '#1677ff',
  },
  algorithm: theme.darkAlgorithm,
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={AntdConfig}>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
