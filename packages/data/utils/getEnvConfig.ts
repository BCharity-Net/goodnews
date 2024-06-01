import { LENS_NETWORK } from '../constants';
import { MainnetContracts, TestnetContracts } from '../contracts';
import GoodEndpoint from '../good-endpoints';
import LensEndpoint from '../lens-endpoints';

const getEnvConfig = (): {
  defaultCollectToken: string;
  heyApiEndpoint: string;
  heyLensSignup: `0x${string}`;
  heyPro: `0x${string}`;
  heyTipping: `0x${string}`;
  lensApiEndpoint: string;
  lensHandles: `0x${string}`;
  lensHub: `0x${string}`;
  permissionlessCreator?: `0x${string}`;
  tokenHandleRegistry: `0x${string}`;
} => {
  switch (LENS_NETWORK) {
    case 'testnet':
      return {
        defaultCollectToken: TestnetContracts.DefaultToken,
        heyApiEndpoint: GoodEndpoint.Testnet,
        heyLensSignup: TestnetContracts.GoodLensSignup,
        heyPro: TestnetContracts.GoodPro,
        heyTipping: TestnetContracts.GoodTipping,
        lensApiEndpoint: LensEndpoint.Testnet,
        lensHandles: TestnetContracts.LensHandles,
        lensHub: TestnetContracts.LensHub,
        permissionlessCreator: TestnetContracts.PermissionlessCreator,
        tokenHandleRegistry: TestnetContracts.TokenHandleRegistry
      };
    case 'staging':
      return {
        defaultCollectToken: TestnetContracts.DefaultToken,
        heyApiEndpoint: GoodEndpoint.Staging,
        heyLensSignup: TestnetContracts.GoodLensSignup,
        heyPro: TestnetContracts.GoodPro,
        heyTipping: TestnetContracts.GoodTipping,
        lensApiEndpoint: LensEndpoint.Staging,
        lensHandles: TestnetContracts.LensHandles,
        lensHub: TestnetContracts.LensHub,
        permissionlessCreator: TestnetContracts.PermissionlessCreator,
        tokenHandleRegistry: TestnetContracts.TokenHandleRegistry
      };
    default:
      return {
        defaultCollectToken: MainnetContracts.DefaultToken,
        heyApiEndpoint: GoodEndpoint.Mainnet,
        heyLensSignup: MainnetContracts.GoodLensSignup,
        heyPro: MainnetContracts.GoodPro,
        heyTipping: MainnetContracts.GoodTipping,
        lensApiEndpoint: LensEndpoint.Mainnet,
        lensHandles: MainnetContracts.LensHandles,
        lensHub: MainnetContracts.LensHub,
        permissionlessCreator: MainnetContracts.PermissionlessCreator,
        tokenHandleRegistry: MainnetContracts.TokenHandleRegistry
      };
  }
};

export default getEnvConfig;
