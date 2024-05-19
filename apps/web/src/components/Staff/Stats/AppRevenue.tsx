import type { FC } from 'react';

import Loader from '@components/Shared/Loader';
import { APP_NAME, GOOD_API_URL, STATIC_IMAGES_URL } from '@good/data/constants';
import { CardHeader, ErrorMessage, NumberedStat } from '@good/ui';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const AppRevenue: FC = () => {
  const getAppRevenue = async (): Promise<
    { currency: string; month: string; revenue: string; symbol: string }[]
  > => {
    const response = await axios.get(
      `${GOOD_API_URL}/lens/internal/stats/revenue`
    );
    return response.data.result;
  };

  const { data, error, isLoading } = useQuery({
    queryFn: getAppRevenue,
    queryKey: ['getAppRevenue'],
    refetchInterval: 5000
  });

  if (isLoading) {
    return <Loader className="my-10" message="Loading revenue stats..." />;
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load revenue stats" />;
  }

  if (!data) {
    return <div className="m-5">No data...</div>;
  }

  return (
    <>
      <div className="divider" />
      <CardHeader title={`${APP_NAME} Revenue`} />
      <div className="m-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {data.map((revenue, index) => (
          <div key={index}>
            <NumberedStat
              count={revenue.revenue}
              name={
                <div className="flex items-center space-x-2">
                  <img
                    alt={revenue.symbol}
                    className="size-4"
                    height={16}
                    src={`${STATIC_IMAGES_URL}/tokens/${revenue.symbol}.svg`}
                    width={16}
                  />
                  <span>{revenue.currency}</span>
                </div>
              }
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default AppRevenue;
