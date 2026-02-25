import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';
import App from './App';
import { config } from './config/wagmi';

const queryClient = new QueryClient();

const theme = lightTheme({
  accentColor: '#1d44e8',
  accentColorForeground: 'white',
  borderRadius: 'large',
  fontStack: 'system',
});

// Override to match our design
theme.colors.connectButtonBackground = '#ffffff';
theme.colors.connectButtonInnerBackground = '#faf9f7';
theme.colors.modalBackground = '#ffffff';
theme.colors.profileForeground = '#faf9f7';
theme.shadows.connectButton = '0 1px 3px rgba(10, 22, 40, 0.04), 0 4px 12px rgba(10, 22, 40, 0.03)';
theme.fonts.body = 'Outfit, system-ui, sans-serif';
theme.radii.connectButton = '9999px';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
