import type { Profile } from '@good/lens';
import type { OptimisticTransaction } from '@good/types/misc';
import type { FC } from 'react';

import Markup from '@components/Shared/Markup';
import SmallUserProfile from '@components/Shared/SmallUserProfile';
import getMentions from '@good/helpers/getMentions';
import {
    LensTransactionStatusType,
    PublicationDocument,
    useLensTransactionStatusQuery,
    usePublicationLazyQuery
} from '@good/lens';
import { useApolloClient } from '@good/lens/apollo';
import { Card, Tooltip } from '@good/ui';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

interface QueuedPublicationProps {
  txn: OptimisticTransaction;
}

const QueuedPublication: FC<QueuedPublicationProps> = ({ txn }) => {
  const { currentProfile } = useProfileStore();

  const { cache } = useApolloClient();
  const txHash = txn?.txHash;
  const txId = txn?.txId;

  const [getPublication] = usePublicationLazyQuery({
    onCompleted: ({ publication }) => {
      if (publication) {
        cache.modify({
          fields: {
            publications: () => {
              cache.writeQuery({
                data: publication,
                query: PublicationDocument
              });
            }
          }
        });
      }
    }
  });

  useLensTransactionStatusQuery({
    notifyOnNetworkStatusChange: true,
    onCompleted: async ({ lensTransactionStatus }) => {
      if (
        lensTransactionStatus?.status === LensTransactionStatusType.Complete &&
        txn.commentOn
      ) {
        await getPublication({
          variables: { request: { forTxHash: lensTransactionStatus.txHash } }
        });
      }
    },
    pollInterval: 1000,
    variables: {
      request: {
        ...(txHash && { forTxHash: txHash }),
        ...(txId && { forTxId: txId })
      }
    }
  });

  if (!txn.content) {
    return null;
  }

  return (
    <Card as="article" className="p-5">
      <div className="flex items-start justify-between pb-4">
        <SmallUserProfile linkToProfile profile={currentProfile as Profile} />
        <Tooltip content="Indexing" placement="top">
          <div className="flex size-4 items-center justify-center rounded-full bg-gray-200">
            <div className="animate-shimmer size-2 rounded-full bg-gray-500" />
          </div>
        </Tooltip>
      </div>
      <div className="markup linkify text-md break-words">
        <Markup mentions={getMentions(txn.content)}>{txn.content}</Markup>
      </div>
    </Card>
  );
};

export default QueuedPublication;
