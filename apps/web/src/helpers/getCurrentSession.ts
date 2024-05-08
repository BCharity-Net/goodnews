import parseJwt from '@good/helpers/parseJwt';
import { hydrateAuthTokens } from 'src/store/persisted/useAuthStore';

/**
 * Get current session
 * @returns {Object} Current session
 */
const getCurrentSession = (): {
  authorizationId: string;
  evmAddress: string;
  id: string;
} => {
  const { accessToken } = hydrateAuthTokens();
  const currentSession = parseJwt(accessToken || '');

  return {
    authorizationId: currentSession?.authorizationId,
    evmAddress: currentSession?.evmAddress,
    id: currentSession?.id
  };
};

export default getCurrentSession;
