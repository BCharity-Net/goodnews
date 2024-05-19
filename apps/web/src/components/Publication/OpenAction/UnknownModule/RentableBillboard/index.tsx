import type {
    MirrorablePublication,
    UnknownOpenActionModuleSettings
} from '@good/lens';
import type { FC } from 'react';

import stopEventPropagation from '@good/helpers/stopEventPropagation';
import { Button, Card } from '@good/ui';

interface RentableBillboardOpenActionProps {
  module: UnknownOpenActionModuleSettings;
  publication?: MirrorablePublication;
}

const RentableBillboardOpenAction: FC<RentableBillboardOpenActionProps> = ({
  module,
  publication
}) => {
  return (
    <Card
      className="space-y-4 p-10 text-center"
      forceRounded
      onClick={stopEventPropagation}
    >
      <div>
        <b>
          This post space is available for rent! Rent now to promote your post.
        </b>
      </div>
      <Button>Rent now</Button>
    </Card>
  );
};

export default RentableBillboardOpenAction;
