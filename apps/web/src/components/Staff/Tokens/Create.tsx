import type { AllowedToken } from '@good/types/good';
import type { FC } from 'react';

import { GOOD_API_URL } from '@good/data/constants';
import { Regex } from '@good/data/regex';
import { STAFFTOOLS } from '@good/data/tracking';
import { Button, Form, Input, useZodForm } from '@good/ui';
import getAuthApiHeaders from '@helpers/getAuthApiHeaders';
import { Leafwatch } from '@helpers/leafwatch';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { object, string } from 'zod';

const createTokenSchema = object({
  contractAddress: string()
    .min(1)
    .max(42)
    .regex(Regex.ethereumAddress, { message: 'Invalid Ethereum address' }),
  decimals: string().min(1, { message: 'Decimals is required' }),
  name: string().min(1, { message: 'Name is required' }),
  symbol: string().min(1, { message: 'Symbol is required' })
});

interface CreateProps {
  setShowCreateModal: (show: boolean) => void;
  setTokens: (tokens: any) => void;
  tokens: AllowedToken[];
}

const Create: FC<CreateProps> = ({ setShowCreateModal, setTokens, tokens }) => {
  const [creating, setCreating] = useState(false);

  const form = useZodForm({
    schema: createTokenSchema
  });

  const create = (
    name: string,
    symbol: string,
    decimals: string,
    contractAddress: string
  ) => {
    setCreating(true);
    toast.promise(
      axios.post(
        `${GOOD_API_URL}/internal/tokens/create`,
        { contractAddress, decimals: parseInt(decimals), name, symbol },
        { headers: getAuthApiHeaders() }
      ),
      {
        error: () => {
          setCreating(false);
          return 'Failed to create token';
        },
        loading: 'Creating token...',
        success: ({ data }) => {
          Leafwatch.track(STAFFTOOLS.TOKENS.CREATE);
          setTokens([...tokens, data?.token]);
          setCreating(false);
          setShowCreateModal(false);
          return 'Token created';
        }
      }
    );
  };

  return (
    <Form
      className="m-5 space-y-4"
      form={form}
      onSubmit={async ({ contractAddress, decimals, name, symbol }) => {
        await create(name, symbol, decimals, contractAddress);
      }}
    >
      <Input
        className="text-sm"
        placeholder="Name"
        type="text"
        {...form.register('name')}
      />
      <Input
        className="text-sm"
        placeholder="Symbol"
        type="text"
        {...form.register('symbol')}
      />
      <Input
        className="text-sm"
        max="30"
        min="0"
        placeholder="1"
        type="number"
        {...form.register('decimals')}
      />
      <Input
        className="text-sm"
        placeholder="Contract Address"
        type="text"
        {...form.register('contractAddress')}
      />
      <Button disabled={creating} type="submit">
        Create
      </Button>
    </Form>
  );
};

export default Create;
