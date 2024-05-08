import { Network } from 'alchemy-sdk';

const getAlchemyNetwork = (chain: number): Network => {
  switch (chain) {
    case 1:
      return Network.ETH_MAINNET;
    case 5:
      return Network.ETH_GOERLI;
    case 137:
      return Network.MATIC_MAINNET;
    case 80002:
      return Network.MATIC_AMOY;
    default:
      return Network.ETH_MAINNET;
  }
};

export default getAlchemyNetwork;
