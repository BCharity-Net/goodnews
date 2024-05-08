import type { OptimisticTransaction } from '@good/types/misc';
import type { FC } from 'react';

import {
  LensTransactionStatusType,
  useLensTransactionStatusQuery
} from '@good/lens';
import { OptmisticPublicationType } from '@good/types/enums';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';

const OptimisticTransactionsProvider: FC = () => {
  const { removeTransaction, setIndexedPostHash, txnQueue } =
    useTransactionStore();

  const Transaction = ({
    transaction
  }: {
    transaction: OptimisticTransaction;
  }) => {
    useLensTransactionStatusQuery({
      fetchPolicy: 'no-cache',
      notifyOnNetworkStatusChange: true,
      onCompleted: ({ lensTransactionStatus }) => {
        if (
          lensTransactionStatus?.status === LensTransactionStatusType.Failed ||
          lensTransactionStatus?.status === LensTransactionStatusType.Complete
        ) {
          // Trigger Profile feed refetch
          if (
            transaction.type === OptmisticPublicationType.Post &&
            lensTransactionStatus.txHash
          ) {
            setIndexedPostHash(lensTransactionStatus.txHash);
          }

          return removeTransaction(
            (transaction.txId || transaction.txHash) as string
          );
        }
      },
      pollInterval: 3000,
      variables: {
        request: {
          ...(transaction.txId && { forTxId: transaction.txId }),
          ...(transaction.txHash && { forTxHash: transaction.txHash })
        }
      }
    });

    return null;
  };

  return txnQueue.map((txn) => (
    <Transaction key={txn.txId || txn.txHash} transaction={txn} />
  ));
};

export default OptimisticTransactionsProvider;
