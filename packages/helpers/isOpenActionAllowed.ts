import type { Maybe, OpenActionModule } from '@good/lens';

import allowedOpenActionModules from './allowedOpenActionModules';

const isOpenActionAllowed = (
  openActions?: Maybe<OpenActionModule[]>
): boolean => {
  if (!openActions?.length) {
    return false;
  }

  return openActions.some((openAction) => {
    const { type } = openAction;

    return allowedOpenActionModules.includes(type);
  });
};

export default isOpenActionAllowed;
