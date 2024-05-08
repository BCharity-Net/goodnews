import type { ModReport, ModReportsRequest } from '@good/lens';
import type { FC } from 'react';

import Loader from '@components/Shared/Loader';
import { LimitType, useModLatestReportsQuery } from '@good/lens';
import { Card, ErrorMessage } from '@good/ui';
import { Virtuoso } from 'react-virtuoso';

import ReportDetails from './ReportDetails';

interface ReportsProps {
  profileId?: string;
  publicationId?: string;
}

const Reports: FC<ReportsProps> = ({ profileId, publicationId }) => {
  // Variables
  const request: ModReportsRequest = {
    ...(profileId && { forProfile: profileId }),
    ...(publicationId && { forPublication: publicationId }),
    limit: LimitType.Fifty
  };

  const { data, error, fetchMore, loading } = useModLatestReportsQuery({
    variables: { request }
  });

  const reports = data?.modLatestReports?.items;
  const pageInfo = data?.modLatestReports?.pageInfo;
  const hasMore = pageInfo?.next;

  const onEndReached = async () => {
    if (!hasMore) {
      return;
    }

    return await fetchMore({
      variables: { request: { ...request, cursor: pageInfo?.next } }
    });
  };

  if (loading) {
    return <Loader className="my-10" message="Loading reports..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load reports"
      />
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Virtuoso
        className="!h-[80vh] [&>div>div]:space-y-5 [&>div>div]:px-5 [&>div]:py-5"
        components={{ Footer: () => <div className="pb-5" /> }}
        computeItemKey={(index, report) =>
          `${report.reporter.id}-${report.reportedPublication?.id}-${index}`
        }
        data={reports}
        endReached={onEndReached}
        itemContent={(index, report) => {
          return (
            <Card>
              <ReportDetails
                hideViewReportsButton
                report={report as ModReport}
              />
            </Card>
          );
        }}
      />
    </div>
  );
};

export default Reports;
