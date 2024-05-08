import type { Feature } from '@good/types/good';
import type { FC } from 'react';

import getAuthApiHeaders from '@helpers/getAuthApiHeaders';
import { Leafwatch } from '@helpers/leafwatch';
import { HEY_API_URL } from '@good/data/constants';
import { STAFFTOOLS } from '@good/data/tracking';
import { Button, Form, TextArea, useZodForm } from '@good/ui';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { object, string } from 'zod';

const assignFeatureSchema = object({
  ids: string().regex(/0x[\dA-Fa-f]+/g, {
    message: 'Invalid user IDs'
  })
});

interface AssignProps {
  feature: Feature;
  setShowAssignModal: (show: boolean) => void;
}

const Assign: FC<AssignProps> = ({ feature, setShowAssignModal }) => {
  const [assigning, setAssigning] = useState(false);

  const form = useZodForm({
    schema: assignFeatureSchema
  });

  const assign = (ids: string) => {
    setAssigning(true);
    toast.promise(
      axios.post(
        `${HEY_API_URL}/internal/features/bulkAssign`,
        { id: feature.id, ids },
        { headers: getAuthApiHeaders() }
      ),
      {
        error: () => {
          setAssigning(false);
          return 'Failed to assign feature flag';
        },
        loading: 'Assigning feature flag...',
        success: ({ data }) => {
          Leafwatch.track(STAFFTOOLS.FEATURE_FLAGS.BULK_ASSIGN);
          setAssigning(false);
          setShowAssignModal(false);
          return `Assigned feature flag to ${data.assigned} users`;
        }
      }
    );
  };

  return (
    <Form
      className="m-5 space-y-4"
      form={form}
      onSubmit={async ({ ids }) => {
        await assign(ids);
      }}
    >
      <TextArea
        placeholder='User IDs, Eg: ["0x0d", "0x05"]'
        rows={5}
        {...form.register('ids')}
      />
      <Button disabled={assigning} type="submit">
        Assign
      </Button>
    </Form>
  );
};

export default Assign;
