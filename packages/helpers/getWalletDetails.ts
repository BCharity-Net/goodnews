import { PUBLIC_WALLET_IMAGE_PATH } from '@good/data/constants';

interface WalletDetails {
  logo: string;
  name: string;
}

/**
 * Returns an object with the name and logo URL for the specified wallet name.
 *
 * @param name The wallet name.
 * @returns An object with the name and logo URL.
 */
const getWalletDetails = (name: string): WalletDetails => {
  const walletDetails: Record<string, WalletDetails> = {
    'Coinbase Wallet': {
      logo: `${PUBLIC_WALLET_IMAGE_PATH}/CoinbaseLogo.png`,
      name: 'Coinbase Wallet'
    },
    WalletConnect: {
      logo: `${PUBLIC_WALLET_IMAGE_PATH}/walletConnect.png`,
      name: 'WalletConnect'
    }
  };
  const defaultDetails: WalletDetails = {
    logo: `${PUBLIC_WALLET_IMAGE_PATH}/BrowserWalletLogo.png`,
    name
  };

  return walletDetails[name] || defaultDetails;
};

export default getWalletDetails;
