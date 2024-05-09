import type { FC } from 'react';

import { GoodLensSignup } from '@good/abis';
import {
  HANDLE_PREFIX,
  GOOD_LENS_SIGNUP,
  ZERO_ADDRESS
} from '@good/data/constants';
import { Regex } from '@good/data/regex';
import { Button, Card, Form, Input, useZodForm } from '@good/ui';
import errorToast from '@helpers/errorToast';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useWriteContract } from 'wagmi';
import { object, string } from 'zod';

const newProfileSchema = object({
  address: string().regex(Regex.ethereumAddress),
  handle: string()
    .min(5, { message: 'Handle must be at least 5 characters long' })
    .max(26, { message: 'Handle must be at most 26 characters long' })
    .regex(Regex.handle)
});

const Mint: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useZodForm({ mode: 'onChange', schema: newProfileSchema });

  const { writeContractAsync } = useWriteContract({
    mutation: {
      onError: errorToast,
      onSuccess: (hash: string) => {
        form.reset();
        toast.success(hash);
      }
    }
  });

  const handleMint = async (handle: string, address: string) => {
    try {
      setIsLoading(true);
      return await writeContractAsync({
        abi: GoodLensSignup,
        address: GOOD_LENS_SIGNUP,
        args: [
          [address, ZERO_ADDRESS, '0x'],
          handle.toLowerCase(),
          ['0xe88E17550978A9f87819ABE96b3f9ec1edc3d953']
        ],
        functionName: 'createProfileWithHandle'
      });
    } catch (error) {
      errorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-5">
      <Form
        className="space-y-5"
        form={form}
        onSubmit={async ({ address, handle }) =>
          await handleMint(handle, address)
        }
      >
        <Input
          placeholder="To Handle"
          prefix={`@${HANDLE_PREFIX}`}
          {...form.register('handle')}
        />
        <Input placeholder="To Address" {...form.register('address')} />
        <Button
          className="w-full justify-center"
          disabled={isLoading}
          type="submit"
        >
          Mint
        </Button>
      </Form>
    </Card>
  );
};

export default Mint;
