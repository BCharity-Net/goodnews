// import type { FC } from 'react';
// import dynamic from 'next/dynamic';

// import getAvatar from '@good/helpers/getAvatar';
// import getLennyURL from '@good/helpers/getLennyURL';
// import getProfile from '@good/helpers/getProfile';
// import { Card, Image } from '@good/ui';
// import { PencilSquareIcon } from '@heroicons/react/24/outline';
// import { useRouter } from 'next/router';
// import { useEffect, useRef, useState } from 'react';
// import { usePublicationStore } from 'src/store/non-persisted/publication/usePublicationStore';
// import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
// import { useProfileStore } from 'src/store/persisted/useProfileStore';

// const Shimmer = <div className="shimmer mb-1 size-5 rounded-lg" />;

// const Attachment = dynamic(
//   () => import('@components/Composer/Actions/Attachment'),
//   { loading: () => Shimmer }
// );

// const EmojiPicker = dynamic(() => import('@components/Shared/EmojiPicker'), {
//   loading: () => Shimmer
// });

// const PollSettings = dynamic(
//   () => import('@components/Composer/Actions/PollSettings'),
//   { loading: () => Shimmer }
// );

// const CollectSettings = dynamic(
//   () => import('@components/Composer/Actions/CollectSettings'),
//   { loading: () => Shimmer }
// );

// const OpenActionSettings = dynamic(
//   () => import('@components/Composer/Actions/OpenActionSettings'),
//   { loading: () => Shimmer }
// );

// const ReferenceSettings = dynamic(
//   () => import('@components/Composer/Actions/ReferenceSettings'),
//   { loading: () => Shimmer }
// );

// const NewPost: FC = () => {
//   const { isReady, push, query } = useRouter();
//   const { currentProfile } = useProfileStore();
//   const { setShowNewPostModal } = useGlobalModalStateStore();
//   const { setPublicationContent } = usePublicationStore();
//   const textAreaRef = useRef<HTMLTextAreaElement>(null); // Define type for ref
//   const [val, setVal] = useState<string>(""); // Define type for state
  
//   const openModal = () => {
//     setShowNewPostModal(true);
//   };

//   // useEffect(() => {
//   //   if (isReady && query.text) {
//   //     const { hashtags, text, url, via } = query;
//   //     let processedHashtags;

//   //     if (hashtags) {
//   //       processedHashtags = (hashtags as string)
//   //         .split(',')
//   //         .map((tag) => `#${tag} `)
//   //         .join('');
//   //     }

//   //     const content = `${text}${
//   //       processedHashtags ? ` ${processedHashtags} ` : ''
//   //     }${url ? `\n\n${url}` : ''}${via ? `\n\nvia @${via}` : ''}`;

//   //     openModal();
//   //     setPublicationContent(content);
//   //   }
    
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setVal(e.target.value);
//   }
  
//   useEffect(() => {
//     if (isReady && query.text) {
//           const { hashtags, text, url, via } = query;
//           let processedHashtags;
    
//           if (hashtags) {
//             processedHashtags = (hashtags as string)
//               .split(',')
//               .map((tag) => `#${tag} `)
//               .join('');
//           }
    
//           const content = `${text}${
//             processedHashtags ? ` ${processedHashtags} ` : ''
//           }${url ? `\n\n${url}` : ''}${via ? `\n\nvia @${via}` : ''}`;
    
//           openModal();
//           setPublicationContent(content);
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps

//     // Auto-resize text area
//     if (textAreaRef.current) {
//       textAreaRef.current.style.height = "auto";
//       textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
//     }
//   }, [val]);

  

//   return (
//     <Card className="space-y-3 p-5">
//       <div className="flex items-center space-x-3">
//         <Image
//           alt={currentProfile?.id}
//           className="size-11 cursor-pointer rounded-full border bg-gray-200 dark:border-gray-700"
//           height={44}
//           onClick={() => push(getProfile(currentProfile).link)}
//           onError={({ currentTarget }) => {
//             currentTarget.src = getLennyURL(currentProfile?.id);
//           }}
//           src={getAvatar(currentProfile)}
//           width={44}
//         />
//         {/* <button
//           className="flex w-full items-center space-x-2 rounded-xl bg-gray-800 px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
//           onClick={() => openModal()}
//           type="button"
//         >
//           <PencilSquareIcon className="size-5" />
//           <span className='text-left'>What is happening?!</span>
//         </button> */}

//         <div id="div1" className='text-neutral-200 bg-gray-800 p-2 w-[30rem] rounded flex flex-col space-y-2'>
//           <textarea className='p-1 bg-gray-800 border-none rounded resize-none overflow-hidden focus:outline-none' 
//                     placeholder='What is happening?!' 
//                     value={val} onChange={handleChange} 
//                     ref={textAreaRef}>
//           </textarea>
//           <div className='text-pink-500'>Who can reply</div>
//         </div>
//       </div>
//       <div className='h-[1px] bg-gray-500 my-5'></div>
//       <div className='flex items-center space-x-4 sm:flex'>
//         <div id='smallbuttons' className='flex items-center space-x-2 flex-grow'>
//           <Attachment />
//           <button>GIF</button>
//           <EmojiPicker
//             setEmoji={(emoji: string) => {
//               setShowEmojiPicker(false);
//               editor?.insertText(emoji);
//             }}
//             setShowEmojiPicker={setShowEmojiPicker}
//             showEmojiPicker={showEmojiPicker}
//           />
//           <Gif setGifAttachment={(gif: IGif) => setGifAttachment(gif)} />
//           <button>Collect</button>
//           <button>openaction</button>
//           <button>go live</button>
//         </div>

//           <div id="bigbutton" className='ml-auto mt-2 sm:mt-0'>
//             <button 
//               className='border border-pink-500 bg-pink-500 text-white hover:bg-pink-600 active:bg-pink-700 px-4 py-1 rounded-full font-bold shadow-sm outline-2 outline-offset-2 focus:outline disabled:opacity-50'
//               onClick={()=> openModal()}>Post
//             </button>
//           </div>
//       </div>
//     </Card>
//   );
// };

// export default NewPost;

import type {
  MirrorablePublication,
  MomokaCommentRequest,
  MomokaPostRequest,
  MomokaQuoteRequest,
  OnchainCommentRequest,
  OnchainPostRequest,
  OnchainQuoteRequest,
  Quote
} from '@good/lens';
import type { IGif } from '@good/types/giphy';
import type { NewAttachment } from '@good/types/misc';
import type { FC } from 'react';

import NewAttachments from '@components/Composer/NewAttachments';
import QuotedPublication from '@components/Publication/QuotedPublication';
import { AudioPublicationSchema } from '@components/Shared/Audio';
import Wrapper from '@components/Shared/Embed/Wrapper';
import { KNOWN_ATTRIBUTES } from '@good/data/constants';
import { Errors } from '@good/data/errors';
import { PUBLICATION } from '@good/data/tracking';
import checkDispatcherPermissions from '@good/helpers/checkDispatcherPermissions';
import collectModuleParams from '@good/helpers/collectModuleParams';
import getProfile from '@good/helpers/getProfile';
import removeQuoteOn from '@good/helpers/removeQuoteOn';
import { ReferenceModuleType } from '@good/lens';
import { Button, Card, ErrorMessage } from '@good/ui';
import cn from '@good/ui/cn';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import uploadToArweave from '@helpers/uploadToArweave';
import { MetadataAttributeType } from '@lens-protocol/metadata';
import { useUnmountEffect } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useCreatePoll from 'src/hooks/useCreatePoll';
import useCreatePublication from 'src/hooks/useCreatePublication';
import usePublicationMetadata from 'src/hooks/usePublicationMetadata';
import { useCollectModuleStore } from 'src/store/non-persisted/publication/useCollectModuleStore';
import { useOpenActionStore } from 'src/store/non-persisted/publication/useOpenActionStore';
import { usePublicationAttachmentStore } from 'src/store/non-persisted/publication/usePublicationAttachmentStore';
import { usePublicationAttributesStore } from 'src/store/non-persisted/publication/usePublicationAttributesStore';
import {
  DEFAULT_AUDIO_PUBLICATION,
  usePublicationAudioStore
} from 'src/store/non-persisted/publication/usePublicationAudioStore';
import { usePublicationLicenseStore } from 'src/store/non-persisted/publication/usePublicationLicenseStore';
import { usePublicationLiveStore } from 'src/store/non-persisted/publication/usePublicationLiveStore';
import { usePublicationPollStore } from 'src/store/non-persisted/publication/usePublicationPollStore';
import { usePublicationStore } from 'src/store/non-persisted/publication/usePublicationStore';
import {
  DEFAULT_VIDEO_THUMBNAIL,
  usePublicationVideoStore
} from 'src/store/non-persisted/publication/usePublicationVideoStore';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';
import { useProfileRestriction } from 'src/store/non-persisted/useProfileRestriction';
import { useProStore } from 'src/store/non-persisted/useProStore';
import { useReferenceModuleStore } from 'src/store/non-persisted/useReferenceModuleStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import LivestreamEditor from '../Actions/LivestreamSettings/LivestreamEditor';
import PollEditor from '../Actions/PollSettings/PollEditor';
import { Editor, useEditorContext, withEditorContext } from '../Editor';
import LinkPreviews from '../LinkPreviews';
import OpenActions from '../OpenActions';
import Discard from '../Post/Discard';

const Shimmer = <div className="shimmer mb-1 size-5 rounded-lg" />;

const Attachment = dynamic(
  () => import('@components/Composer/Actions/Attachment'),
  { loading: () => Shimmer }
);
const EmojiPicker = dynamic(() => import('@components/Shared/EmojiPicker'), {
  loading: () => Shimmer
});
const Gif = dynamic(() => import('@components/Composer/Actions/Gif'), {
  loading: () => Shimmer
});
const CollectSettings = dynamic(
  () => import('@components/Composer/Actions/CollectSettings'),
  { loading: () => Shimmer }
);
const OpenActionSettings = dynamic(
  () => import('@components/Composer/Actions/OpenActionSettings'),
  { loading: () => Shimmer }
);
const ReferenceSettings = dynamic(
  () => import('@components/Composer/Actions/ReferenceSettings'),
  { loading: () => Shimmer }
);
const PollSettings = dynamic(
  () => import('@components/Composer/Actions/PollSettings'),
  { loading: () => Shimmer }
);
const LivestreamSettings = dynamic(
  () => import('@components/Composer/Actions/LivestreamSettings'),
  { loading: () => Shimmer }
);
const DraftSettings = dynamic(
  () => import('@components/Composer/Actions/DraftSettings'),
  { loading: () => Shimmer }
);

interface NewPublicationProps {
  publication?: MirrorablePublication;
}

const NewPost: FC<NewPublicationProps> = ({ publication }) => {
  const { currentProfile } = useProfileStore();
  const { isSuspended } = useProfileRestriction();
  const { isPro } = useProStore();

  // Global modal store
  const { setShowDiscardModal, setShowNewPostModal } =
    useGlobalModalStateStore();

  // Nonce store
  const { lensHubOnchainSigNonce } = useNonceStore();

  // Publication store
  const {
    publicationContent,
    quotedPublication,
    setPublicationContent,
    setQuotedPublication
  } = usePublicationStore();

  // Audio store
  const { audioPublication, setAudioPublication } = usePublicationAudioStore();

  // Video store
  const { setVideoThumbnail, videoThumbnail } = usePublicationVideoStore();

  // Live video store
  const { resetLiveVideoConfig, setShowLiveVideoEditor, showLiveVideoEditor } =
    usePublicationLiveStore();

  // Attachment store
  const { addAttachments, attachments, isUploading, setAttachments } =
    usePublicationAttachmentStore((state) => state);

  // Poll store
  const { pollConfig, resetPollConfig, setShowPollEditor, showPollEditor } =
    usePublicationPollStore();

  // License store
  const { setLicense } = usePublicationLicenseStore();

  // Collect module store
  const { collectModule, reset: resetCollectSettings } = useCollectModuleStore(
    (state) => state
  );

  // Open action store
  const { openAction, reset: resetOpenActionSettings } = useOpenActionStore();

  // Reference module store
  const { degreesOfSeparation, onlyFollowers, selectedReferenceModule } =
    useReferenceModuleStore();

  // Attributes store
  const { reset: resetAttributes } = usePublicationAttributesStore();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [publicationContentError, setPublicationContentError] = useState('');

  const editor = useEditorContext();

  const createPoll = useCreatePoll();
  const getMetadata = usePublicationMetadata();

  const { canUseLensManager } = checkDispatcherPermissions(currentProfile);

  const isComment = Boolean(publication);
  const isQuote = Boolean(quotedPublication);
  const hasAudio = attachments[0]?.type === 'Audio';
  const hasVideo = attachments[0]?.type === 'Video';

  const noCollect = !collectModule.type;
  const noOpenAction = !openAction;
  // Use Momoka if the profile the comment or quote has momoka proof and also check collect module has been disabled
  const useMomoka = isComment
    ? publication?.momoka?.proof
    : isQuote
      ? quotedPublication?.momoka?.proof
      : noCollect && noOpenAction;

  const reset = () => {
    editor?.setMarkdown('');
    setPublicationContent('');
    setShowPollEditor(false);
    resetPollConfig();
    setShowLiveVideoEditor(false);
    resetLiveVideoConfig();
    setAttachments([]);
    setVideoThumbnail(DEFAULT_VIDEO_THUMBNAIL);
    setAudioPublication(DEFAULT_AUDIO_PUBLICATION);
    setLicense(null);
    resetAttributes();
    resetOpenActionSettings();
    resetCollectSettings();
  };

  const onError = (error?: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const onCompleted = (
    __typename?:
      | 'CreateMomokaPublicationResult'
      | 'LensProfileManagerRelayError'
      | 'RelayError'
      | 'RelaySuccess'
  ) => {
    if (
      __typename === 'RelayError' ||
      __typename === 'LensProfileManagerRelayError'
    ) {
      return onError();
    }

    setIsLoading(false);
    setQuotedPublication(null);
    reset();

    if (!isComment) {
      setShowNewPostModal(false);
    }

    // Track in leafwatch
    const eventProperties = {
      comment_on: isComment ? publication?.id : null,
      publication_collect_module: collectModule.type,
      publication_has_attachments: attachments.length > 0,
      publication_has_poll: showPollEditor,
      publication_is_live: showLiveVideoEditor,
      publication_open_action: openAction?.address,
      publication_reference_module: selectedReferenceModule,
      publication_reference_module_degrees_of_separation:
        selectedReferenceModule ===
        ReferenceModuleType.DegreesOfSeparationReferenceModule
          ? degreesOfSeparation
          : null,
      quote_on: isQuote ? quotedPublication?.id : null
    };
    Leafwatch.track(
      isComment
        ? PUBLICATION.NEW_COMMENT
        : isQuote
          ? PUBLICATION.NEW_QUOTE
          : PUBLICATION.NEW_POST,
      eventProperties
    );
  };

  const {
    createCommentOnChain,
    createCommentOnMomka,
    createMomokaCommentTypedData,
    createMomokaPostTypedData,
    createMomokaQuoteTypedData,
    createOnchainCommentTypedData,
    createOnchainPostTypedData,
    createOnchainQuoteTypedData,
    createPostOnChain,
    createPostOnMomka,
    createQuoteOnChain,
    createQuoteOnMomka,
    error
  } = useCreatePublication({
    commentOn: publication,
    onCompleted,
    onError,
    quoteOn: quotedPublication as Quote
  });

  useEffect(() => {
    setPublicationContentError('');
  }, [audioPublication]);

  const getAnimationUrl = () => {
    const fallback =
      'ipfs://bafkreiaoua5s4iyg4gkfjzl6mzgenw4qw7mwgxj7zf7ev7gga72o5d3lf4';

    if (attachments.length > 0 || hasAudio || hasVideo) {
      return attachments[0]?.uri || fallback;
    }

    return fallback;
  };

  const getTitlePrefix = () => {
    if (hasVideo) {
      return 'Video';
    }

    return isComment ? 'Comment' : isQuote ? 'Quote' : 'Post';
  };

  const createPublication = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      setIsLoading(true);
      if (hasAudio) {
        setPublicationContentError('');
        const parsedData = AudioPublicationSchema.safeParse(audioPublication);
        if (!parsedData.success) {
          const issue = parsedData.error.issues[0];
          setIsLoading(false);
          return setPublicationContentError(issue.message);
        }
      }

      if (publicationContent.length === 0 && attachments.length === 0) {
        setIsLoading(false);
        return setPublicationContentError(
          `${
            isComment ? 'Comment' : isQuote ? 'Quote' : 'Post'
          } should not be empty!`
        );
      }

      setPublicationContentError('');

      let pollId;
      if (showPollEditor) {
        pollId = await createPoll();
      }

      const processedPublicationContent =
        publicationContent.length > 0 ? publicationContent : undefined;
      const title = hasAudio
        ? audioPublication.title
        : `${getTitlePrefix()} by ${getProfile(currentProfile).slugWithPrefix}`;
      const hasAttributes = Boolean(pollId);

      const baseMetadata = {
        content: processedPublicationContent,
        title,
        ...(hasAttributes && {
          attributes: [
            ...(pollId
              ? [
                  {
                    key: KNOWN_ATTRIBUTES.POLL_ID,
                    type: MetadataAttributeType.STRING,
                    value: pollId
                  }
                ]
              : [])
          ]
        }),
        marketplace: {
          animation_url: getAnimationUrl(),
          description: processedPublicationContent,
          external_url: `https://bcharity.net${getProfile(currentProfile).link}`,
          name: title
        }
      };

      const metadata = getMetadata({ baseMetadata });
      const arweaveId = await uploadToArweave(metadata);

      // Payload for the open action module
      const openActionModules = [];
      if (collectModule.type) {
        openActionModules.push({
          collectOpenAction: collectModuleParams(collectModule, currentProfile)
        });
      }

      if (openAction) {
        openActionModules.push({ unknownOpenAction: openAction });
      }

      // Payload for the Momoka post/comment/quote
      const momokaRequest:
        | MomokaCommentRequest
        | MomokaPostRequest
        | MomokaQuoteRequest = {
        ...(isComment && { commentOn: publication?.id }),
        ...(isQuote && { quoteOn: quotedPublication?.id }),
        contentURI: `ar://${arweaveId}`
      };

      if (useMomoka) {
        if (canUseLensManager) {
          if (isComment) {
            return await createCommentOnMomka(
              momokaRequest as MomokaCommentRequest
            );
          }

          if (isQuote) {
            return await createQuoteOnMomka(
              momokaRequest as MomokaQuoteRequest
            );
          }

          return await createPostOnMomka(momokaRequest);
        }

        if (isComment) {
          return await createMomokaCommentTypedData({
            variables: { request: momokaRequest as MomokaCommentRequest }
          });
        }

        if (isQuote) {
          return await createMomokaQuoteTypedData({
            variables: { request: momokaRequest as MomokaQuoteRequest }
          });
        }

        return await createMomokaPostTypedData({
          variables: { request: momokaRequest }
        });
      }

      // Payload for the post/comment/quote
      const onChainRequest:
        | OnchainCommentRequest
        | OnchainPostRequest
        | OnchainQuoteRequest = {
        contentURI: `ar://${arweaveId}`,
        ...(isComment && { commentOn: publication?.id }),
        ...(isQuote && { quoteOn: quotedPublication?.id }),
        openActionModules,
        ...(onlyFollowers && {
          referenceModule:
            selectedReferenceModule ===
            ReferenceModuleType.FollowerOnlyReferenceModule
              ? { followerOnlyReferenceModule: true }
              : {
                  degreesOfSeparationReferenceModule: {
                    commentsRestricted: true,
                    degreesOfSeparation,
                    mirrorsRestricted: true,
                    quotesRestricted: true
                  }
                }
        })
      };

      if (canUseLensManager) {
        if (isComment) {
          return await createCommentOnChain(
            onChainRequest as OnchainCommentRequest
          );
        }

        if (isQuote) {
          return await createQuoteOnChain(
            onChainRequest as OnchainQuoteRequest
          );
        }

        return await createPostOnChain(onChainRequest);
      }

      if (isComment) {
        return await createOnchainCommentTypedData({
          variables: {
            options: { overrideSigNonce: lensHubOnchainSigNonce },
            request: onChainRequest as OnchainCommentRequest
          }
        });
      }

      if (isQuote) {
        return await createOnchainQuoteTypedData({
          variables: {
            options: { overrideSigNonce: lensHubOnchainSigNonce },
            request: onChainRequest as OnchainQuoteRequest
          }
        });
      }

      return await createOnchainPostTypedData({
        variables: {
          options: { overrideSigNonce: lensHubOnchainSigNonce },
          request: onChainRequest
        }
      });
    } catch (error) {
      onError(error);
    }
  };

  const setGifAttachment = (gif: IGif) => {
    const attachment: NewAttachment = {
      mimeType: 'image/gif',
      previewUri: gif.images.original.url,
      type: 'Image',
      uri: gif.images.original.url
    };
    addAttachments([attachment]);
  };

  const isSubmitDisabledByPoll = showPollEditor
    ? !pollConfig.options.length ||
      pollConfig.options.some((option) => !option.length)
    : false;

  const onDiscardClick = () => {
    setQuotedPublication(null);
    setShowNewPostModal(false);
    setShowDiscardModal(false);
    reset();
  };

  useUnmountEffect(() => reset());

  return (
    <Card
      className={cn({
        '!rounded-b-xl rounded-t border-none': !isComment
      })}
      onClick={() => setShowEmojiPicker(false)}
    >
      {error ? (
        <ErrorMessage
          className="!rounded-none"
          error={error}
          title="Transaction failed!"
        />
      ) : null}
      <Editor />
      {publicationContentError ? (
        <div className="mt-1 px-5 pb-3 text-sm font-bold text-red-500">
          {publicationContentError}
        </div>
      ) : null}
      {showPollEditor ? <PollEditor /> : null}
      {showLiveVideoEditor ? <LivestreamEditor /> : null}
      <OpenActions />
      <LinkPreviews />
      <NewAttachments attachments={attachments} />
      {quotedPublication ? (
        <Wrapper className="m-5" zeroPadding>
          <QuotedPublication
            isNew
            publication={removeQuoteOn(quotedPublication as Quote)}
          />
        </Wrapper>
      ) : null}
      <div className="divider mx-5" />
      <div className="block items-center px-5 py-3 sm:flex">
        <div className="flex ml-12 items-center space-x-4">
          <Attachment />
          <EmojiPicker
            setEmoji={(emoji: string) => {
              setShowEmojiPicker(false);
              editor?.insertText(emoji);
            }}
            setShowEmojiPicker={setShowEmojiPicker}
            showEmojiPicker={showEmojiPicker}
          />
          <Gif setGifAttachment={(gif: IGif) => setGifAttachment(gif)} />
          {!publication?.momoka?.proof ? (
            <>
              <CollectSettings />
              <OpenActionSettings />
              <ReferenceSettings />
            </>
          ) : null}
          <PollSettings />
          {!isComment && <LivestreamSettings />}
          {isPro && <DraftSettings />}
        </div>
        <div className="ml-auto mt-2 sm:mt-0">
          <Button
            disabled={
              isLoading ||
              isUploading ||
              isSubmitDisabledByPoll ||
              videoThumbnail.uploading
            }
            onClick={createPublication}
          >
            {isComment ? 'Comment' : 'Post'}
          </Button>
        </div>
      </div>
      <Discard onDiscard={onDiscardClick} />
    </Card>
  );
};

export default withEditorContext(NewPost);

