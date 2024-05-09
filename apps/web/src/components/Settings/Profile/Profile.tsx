import type { Area } from '@good/image-cropper/types';
import type { OnchainSetProfileMetadataRequest } from '@good/lens';
import type {
  MetadataAttribute,
  ProfileOptions
} from '@lens-protocol/metadata';
import type { ChangeEvent, FC } from 'react';
import type { z } from 'zod';

import ChooseFile from '@components/Shared/ChooseFile';
import ImageCropperController from '@components/Shared/ImageCropperController';
import { LensHub } from '@good/abis';
import {
  AVATAR,
  COVER,
  LENS_HUB,
  STATIC_IMAGES_URL
} from '@good/data/constants';
import { Errors } from '@good/data/errors';
import { Regex } from '@good/data/regex';
import { SETTINGS } from '@good/data/tracking';
import checkDispatcherPermissions from '@good/helpers/checkDispatcherPermissions';
import getAvatar from '@good/helpers/getAvatar';
import getProfileAttribute from '@good/helpers/getProfileAttribute';
import getSignature from '@good/helpers/getSignature';
import imageKit from '@good/helpers/imageKit';
import sanitizeDStorageUrl from '@good/helpers/sanitizeDStorageUrl';
import trimify from '@good/helpers/trimify';
import { getCroppedImg } from '@good/image-cropper/cropUtils';
import {
  useBroadcastOnchainMutation,
  useCreateOnchainSetProfileMetadataTypedDataMutation,
  useSetProfileMetadataMutation
} from '@good/lens';
import {
  Button,
  Card,
  ErrorMessage,
  Form,
  Image,
  Input,
  Modal,
  Spinner,
  TextArea,
  useZodForm
} from '@good/ui';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import uploadCroppedImage, { readFile } from '@helpers/profilePictureUtils';
import uploadToArweave from '@helpers/uploadToArweave';
import { InformationCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import {
  MetadataAttributeType,
  profile as profileMetadata
} from '@lens-protocol/metadata';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useProfileRestriction } from 'src/store/non-persisted/useProfileRestriction';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useSignTypedData, useWriteContract } from 'wagmi';
import { object, string, union } from 'zod';

const editProfileSchema = object({
  bio: string().max(260, { message: 'Bio should not exceed 260 characters' }),
  location: string().max(100, {
    message: 'Location should not exceed 100 characters'
  }),
  name: string()
    .max(100, { message: 'Name should not exceed 100 characters' })
    .regex(Regex.profileNameValidator, {
      message: 'Profile name must not contain restricted symbols'
    }),
  website: union([
    string().regex(Regex.url, { message: 'Invalid website' }),
    string().max(0)
  ]),
  x: string().max(100, { message: 'X handle must not exceed 100 characters' })
});

type FormData = z.infer<typeof editProfileSchema>;

const ProfileSettingsForm: FC = () => {
  const { currentProfile } = useProfileStore();
  const { isSuspended } = useProfileRestriction();
  const [isLoading, setIsLoading] = useState(false);

  // Cover Picture
  const [coverPictureIpfsUrl, setCoverPictureIpfsUrl] = useState(
    currentProfile?.metadata?.coverPicture?.__typename === 'ImageSet'
      ? currentProfile?.metadata?.coverPicture?.raw.uri
      : ''
  );
  const [coverPictureSrc, setCoverPictureSrc] = useState('');
  const [showCoverPictureCropModal, setShowCoverPictureCropModal] =
    useState(false);
  const [croppedCoverPictureAreaPixels, setCoverPictureCroppedAreaPixels] =
    useState<Area | null>(null);
  const [uploadedCoverPictureUrl, setUploadedCoverPictureUrl] = useState('');
  const [uploadingCoverPicture, setUploadingCoverPicture] = useState(false);

  // Picture
  const [profilePictureIpfsUrl, setProfilePictureIpfsUrl] = useState(
    currentProfile?.metadata?.picture?.__typename === 'ImageSet'
      ? currentProfile?.metadata?.picture?.raw.uri
      : currentProfile?.metadata?.picture?.__typename === 'NftImage'
        ? currentProfile?.metadata?.picture?.image?.raw.uri
        : ''
  );
  const [profilePictureSrc, setProfilePictureSrc] = useState('');
  const [showProfilePictureCropModal, setShowProfilePictureCropModal] =
    useState(false);
  const [croppedProfilePictureAreaPixels, setCroppedProfilePictureAreaPixels] =
    useState<Area | null>(null);
  const [uploadedProfilePictureUrl, setUploadedProfilePictureUrl] =
    useState('');
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);

  const handleWrongNetwork = useHandleWrongNetwork();

  // Lens manager
  const { canBroadcast, canUseLensManager } =
    checkDispatcherPermissions(currentProfile);

  const onCompleted = (
    __typename?: 'LensProfileManagerRelayError' | 'RelayError' | 'RelaySuccess'
  ) => {
    if (
      __typename === 'RelayError' ||
      __typename === 'LensProfileManagerRelayError'
    ) {
      return;
    }

    setIsLoading(false);
    toast.success('Profile updated successfully!');
    Leafwatch.track(SETTINGS.PROFILE.UPDATE);
  };

  const onError = (error: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const { signTypedDataAsync } = useSignTypedData({ mutation: { onError } });
  const { error, writeContractAsync } = useWriteContract({
    mutation: { onError, onSuccess: () => onCompleted() }
  });

  const write = async ({ args }: { args: any[] }) => {
    return await writeContractAsync({
      abi: LensHub,
      address: LENS_HUB,
      args,
      functionName: 'setProfileMetadataURI'
    });
  };

  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) =>
      onCompleted(broadcastOnchain.__typename)
  });
  const [createOnchainSetProfileMetadataTypedData] =
    useCreateOnchainSetProfileMetadataTypedDataMutation({
      onCompleted: async ({ createOnchainSetProfileMetadataTypedData }) => {
        const { id, typedData } = createOnchainSetProfileMetadataTypedData;
        const { metadataURI, profileId } = typedData.value;
        await handleWrongNetwork();

        if (canBroadcast) {
          const signature = await signTypedDataAsync(getSignature(typedData));
          const { data } = await broadcastOnchain({
            variables: { request: { id, signature } }
          });
          if (data?.broadcastOnchain.__typename === 'RelayError') {
            return await write({ args: [profileId, metadataURI] });
          }

          return;
        }

        return await write({ args: [profileId, metadataURI] });
      },
      onError
    });

  const [setProfileMetadata] = useSetProfileMetadataMutation({
    onCompleted: ({ setProfileMetadata }) =>
      onCompleted(setProfileMetadata.__typename),
    onError
  });

  const updateProfile = async (request: OnchainSetProfileMetadataRequest) => {
    const { data } = await setProfileMetadata({
      variables: { request }
    });

    if (
      data?.setProfileMetadata?.__typename === 'LensProfileManagerRelayError'
    ) {
      return await createOnchainSetProfileMetadataTypedData({
        variables: { request }
      });
    }
  };

  const form = useZodForm({
    defaultValues: {
      bio: currentProfile?.metadata?.bio || '',
      location: getProfileAttribute(
        'location',
        currentProfile?.metadata?.attributes
      ),
      name: currentProfile?.metadata?.displayName || '',
      website: getProfileAttribute(
        'website',
        currentProfile?.metadata?.attributes
      ),
      x: getProfileAttribute(
        'x',
        currentProfile?.metadata?.attributes
      )?.replace(/(https:\/\/)?x\.com\//, '')
    },
    schema: editProfileSchema
  });

  const editProfile = async (data: FormData) => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      setIsLoading(true);
      const otherAttributes =
        currentProfile.metadata?.attributes
          ?.filter(
            (attr) =>
              !['app', 'location', 'timestamp', 'website', 'x'].includes(
                attr.key
              )
          )
          .map(({ key, type, value }) => ({
            key,
            type: MetadataAttributeType[type] as any,
            value
          })) || [];

      const preparedProfileMetadata: ProfileOptions = {
        ...(data.name && { name: data.name }),
        ...(data.bio && { bio: data.bio }),
        attributes: [
          ...(otherAttributes as MetadataAttribute[]),
          {
            key: 'location',
            type: MetadataAttributeType.STRING,
            value: data.location
          },
          {
            key: 'website',
            type: MetadataAttributeType.STRING,
            value: data.website
          },
          { key: 'x', type: MetadataAttributeType.STRING, value: data.x },
          {
            key: 'timestamp',
            type: MetadataAttributeType.STRING,
            value: new Date().toISOString()
          }
        ],
        coverPicture: coverPictureIpfsUrl ? coverPictureIpfsUrl : undefined,
        picture: profilePictureIpfsUrl ? profilePictureIpfsUrl : undefined
      };
      preparedProfileMetadata.attributes =
        preparedProfileMetadata.attributes?.filter((m) => {
          return m.key !== '' && Boolean(trimify(m.value));
        });
      const metadata = profileMetadata(preparedProfileMetadata);
      const arweaveId = await uploadToArweave(metadata);

      const request: OnchainSetProfileMetadataRequest = {
        metadataURI: `ar://${arweaveId}`
      };

      if (canUseLensManager) {
        return await updateProfile(request);
      }

      return await createOnchainSetProfileMetadataTypedData({
        variables: { request }
      });
    } catch (error) {
      onError(error);
    }
  };

  const uploadAndSave = async (type: 'avatar' | 'cover') => {
    try {
      const croppedImage = await getCroppedImg(
        type === 'avatar' ? profilePictureSrc : coverPictureSrc,
        type === 'avatar'
          ? croppedProfilePictureAreaPixels
          : croppedCoverPictureAreaPixels
      );

      if (!croppedImage) {
        return toast.error(Errors.SomethingWentWrong);
      }

      // Update Loading State
      if (type === 'avatar') {
        setUploadingProfilePicture(true);
      } else if (type === 'cover') {
        setUploadingCoverPicture(true);
      }

      const ipfsUrl = await uploadCroppedImage(croppedImage);
      const dataUrl = croppedImage.toDataURL('image/png');

      // Update Profile Picture
      if (type === 'avatar') {
        setProfilePictureIpfsUrl(ipfsUrl);
        setUploadedProfilePictureUrl(dataUrl);
      } else if (type === 'cover') {
        setCoverPictureIpfsUrl(ipfsUrl);
        setUploadedCoverPictureUrl(dataUrl);
      }
    } catch (error) {
      onError(error);
    } finally {
      setShowCoverPictureCropModal(false);
      setShowProfilePictureCropModal(false);
      setUploadingCoverPicture(false);
      setUploadingProfilePicture(false);
    }
  };

  const onFileChange = async (
    evt: ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'cover'
  ) => {
    const file = evt.target.files?.[0];
    if (file) {
      if (type === 'avatar') {
        setProfilePictureSrc(await readFile(file));
        setShowProfilePictureCropModal(true);
      } else if (type === 'cover') {
        setCoverPictureSrc(await readFile(file));
        setShowCoverPictureCropModal(true);
      }
    }
  };

  const coverPictureUrl =
    currentProfile?.metadata?.coverPicture?.optimized?.uri ||
    `${STATIC_IMAGES_URL}/patterns/2.svg`;
  const renderCoverPictureUrl = coverPictureUrl
    ? imageKit(sanitizeDStorageUrl(coverPictureUrl), COVER)
    : '';

  const profilePictureUrl = getAvatar(currentProfile);
  const renderProfilePictureUrl = profilePictureUrl
    ? imageKit(sanitizeDStorageUrl(profilePictureUrl), AVATAR)
    : '';

  return (
    <>
      <Card className="p-5">
        <Form
          className="space-y-4"
          form={form}
          onSubmit={(data) => editProfile(data)}
        >
          {error ? (
            <ErrorMessage
              className="mb-3"
              error={error}
              title="Transaction failed!"
            />
          ) : null}
          <Input
            disabled
            label="Profile Id"
            type="text"
            value={currentProfile?.id}
          />
          <Input
            label="Name"
            placeholder="Gavin"
            type="text"
            {...form.register('name')}
          />
          <Input
            label="Location"
            placeholder="Miami"
            type="text"
            {...form.register('location')}
          />
          <Input
            label="Website"
            placeholder="https://hooli.com"
            type="text"
            {...form.register('website')}
          />
          <Input
            label="X"
            placeholder="gavin"
            prefix="https://x.com"
            type="text"
            {...form.register('x')}
          />
          <TextArea
            label="Bio"
            placeholder="Tell us something about you!"
            {...form.register('bio')}
          />
          <div className="space-y-1.5">
            <div className="label">Avatar</div>
            <div className="space-y-3">
              <Image
                alt="Profile picture crop preview"
                className="max-w-xs rounded-lg"
                onError={({ currentTarget }) => {
                  currentTarget.src = sanitizeDStorageUrl(
                    profilePictureIpfsUrl
                  );
                }}
                src={uploadedProfilePictureUrl || renderProfilePictureUrl}
              />
              <ChooseFile onChange={(event) => onFileChange(event, 'avatar')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="label">Cover</div>
            <div className="space-y-3">
              <div>
                <Image
                  alt="Cover picture crop preview"
                  className="h-[175px] w-[675px] rounded-lg object-cover"
                  onError={({ currentTarget }) => {
                    currentTarget.src =
                      sanitizeDStorageUrl(coverPictureIpfsUrl);
                  }}
                  src={uploadedCoverPictureUrl || renderCoverPictureUrl}
                />
              </div>
              <ChooseFile onChange={(event) => onFileChange(event, 'cover')} />
            </div>
          </div>
          <Button
            className="ml-auto"
            disabled={
              isLoading ||
              (!form.formState.isDirty &&
                !coverPictureSrc &&
                !profilePictureSrc)
            }
            icon={
              isLoading ? (
                <Spinner size="xs" />
              ) : (
                <PencilIcon className="size-4" />
              )
            }
            type="submit"
          >
            Save
          </Button>
        </Form>
      </Card>
      <Modal
        onClose={
          isLoading
            ? undefined
            : () => {
                setCoverPictureSrc('');
                setShowCoverPictureCropModal(false);
              }
        }
        show={showCoverPictureCropModal}
        size="lg"
        title="Crop cover picture"
      >
        <div className="p-5 text-right">
          <ImageCropperController
            imageSrc={coverPictureSrc}
            setCroppedAreaPixels={setCoverPictureCroppedAreaPixels}
            targetSize={{ height: 350, width: 1350 }}
          />
          <div className="flex w-full flex-wrap items-center justify-between gap-y-3">
            <div className="ld-text-gray-500 flex items-center space-x-1 text-left text-sm">
              <InformationCircleIcon className="size-4" />
              <div>
                Optimal cover picture size is <b>1350x350</b>
              </div>
            </div>
            <Button
              disabled={uploadingCoverPicture || !coverPictureSrc}
              icon={
                uploadingCoverPicture ? (
                  <Spinner size="xs" />
                ) : (
                  <PencilIcon className="size-4" />
                )
              }
              onClick={() => uploadAndSave('cover')}
              type="submit"
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>
      {/* Picture */}
      <Modal
        onClose={
          isLoading
            ? undefined
            : () => {
                setProfilePictureSrc('');
                setShowProfilePictureCropModal(false);
              }
        }
        show={showProfilePictureCropModal}
        size="sm"
        title="Crop profile picture"
      >
        <div className="p-5 text-right">
          <ImageCropperController
            imageSrc={profilePictureSrc}
            setCroppedAreaPixels={setCroppedProfilePictureAreaPixels}
            targetSize={{ height: 300, width: 300 }}
          />
          <Button
            disabled={uploadingProfilePicture || !profilePictureSrc}
            icon={
              uploadingProfilePicture ? (
                <Spinner size="xs" />
              ) : (
                <PencilIcon className="size-4" />
              )
            }
            onClick={() => uploadAndSave('avatar')}
            type="submit"
          >
            Upload
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ProfileSettingsForm;
