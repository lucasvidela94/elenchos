import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonMumbai } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Elenchos',
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [polygon, polygonMumbai],
  ssr: false,
});
