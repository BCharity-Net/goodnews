import type { FC } from 'react';

import { Errors } from '@good/data';
import { PUBLICATION } from '@good/data/tracking';
import stopEventPropagation from '@good/helpers/stopEventPropagation';
import { useReportPublicationMutation } from '@good/lens';
import {
    Button,
    EmptyState,
    ErrorMessage,
    Form,
    Spinner,
    TextArea,
    useZodForm
} from '@good/ui';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useProfileStatus } from 'src/store/non-persisted/useProfileStatus';
import { object, string } from 'zod';

import Reason from './Reason';

const newReportPublicationSchema = object({
  additionalComments: string().max(260, {
    message: 'Additional comments should not exceed 260 characters'
  })
});

interface ReportProps {
  publicationId: null | string;
}

const ReportPublication: FC<ReportProps> = ({ publicationId }) => {
  const { isSuspended } = useProfileStatus();
  const [type, setType] = useState('');
  const [subReason, setSubReason] = useState('');

  const form = useZodForm({
    schema: newReportPublicationSchema
  });

  const [
    createReport,
    { data: submitData, error: submitError, loading: submitLoading }
  ] = useReportPublicationMutation({
    onCompleted: () => {
      Leafwatch.track(PUBLICATION.REPORT, { publication_id: publicationId });
    }
  });

  const reportPublication = async (additionalComments: null | string) => {
    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      return await createReport({
        variables: {
          request: {
            additionalComments,
            for: publicationId,
            reason: {
              [type]: {
                reason: type.replace('Reason', '').toUpperCase(),
                subreason: subReason
              }
            }
          }
        }
      });
    } catch (error) {
      errorToast(error);
    }
  };

  return (
    <div onClick={stopEventPropagation}>
      {submitData?.reportPublication === null ? (
        <EmptyState
          hideCard
          icon={<CheckCircleIcon className="size-14" />}
          message="Publication reported successfully!"
        />
      ) : publicationId ? (
        <div className="p-5">
          <Form
            className="space-y-4"
            form={form}
            onSubmit={({ additionalComments }) =>
              reportPublication(additionalComments)
            }
          >
            {submitError ? (
              <ErrorMessage error={submitError} title="Failed to report" />
            ) : null}
            <Reason
              setSubReason={setSubReason}
              setType={setType}
              subReason={subReason}
              type={type}
            />
            {subReason ? (
              <>
                <TextArea
                  label="Description"
                  placeholder="Please provide additional details"
                  {...form.register('additionalComments')}
                />
                <Button
                  className="flex w-full justify-center"
                  disabled={submitLoading}
                  icon={
                    submitLoading ? (
                      <Spinner size="xs" />
                    ) : (
                      <PencilSquareIcon className="size-4" />
                    )
                  }
                  type="submit"
                >
                  Report
                </Button>
              </>
            ) : null}
          </Form>
        </div>
      ) : null}
    </div>
  );
};

export default ReportPublication;
