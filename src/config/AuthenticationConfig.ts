import { AuthConfig, AuthStrategy } from '../types/Auth';

const authenticationConfig: AuthConfig = {
  strategy: AuthStrategy.token
};

// Returns true if authentication strategy is either 'openshift' or 'openid'
export const isAuthStrategyOAuth = () =>
  authenticationConfig.strategy === AuthStrategy.openshift || authenticationConfig.strategy === AuthStrategy.openid;

export default authenticationConfig;
