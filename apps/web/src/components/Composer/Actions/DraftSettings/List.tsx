import type { Draft } from '@good/types/good';
import type { FC } from 'react';

import { useEditorContext } from '@components/Composer/Editor';
import Loader from '@components/Shared/Loader';
import { GOOD_API_URL } from '@good/data/constants';
import stopEventPropagation from '@good/helpers/stopEventPropagation';
import { Button, EmptyState, ErrorMessage } from '@good/ui';
import getAuthApiHeaders from '@helpers/getAuthApiHeaders';
import { ArchiveBoxArrowDownIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCollectModuleStore } from 'src/store/non-persisted/publication/useCollectModuleStore';
import { usePublicationStore } from 'src/store/non-persisted/publication/usePublicationStore';

interface ListProps {
  setShowModal: (showModal: boolean) => void;
}

const List: FC<ListProps> = ({ setShowModal }) => {
  const { setDraftId, setPublicationContent } = usePublicationStore();
  const { setCollectModule } = useCollectModuleStore((state) => state);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [deleting, setDeleting] = useState(false);

  const editor = useEditorContext();

  const getDrafts = async (): Promise<[] | Draft[]> => {
    try {
      const { data } = await axios.get(`${GOOD_API_URL}/drafts/all`, {
        headers: getAuthApiHeaders()
      });

      return data.result;
    } catch {
      return [];
    }
  };

  const { error, isLoading, isRefetching } = useQuery({
    queryFn: () =>
      getDrafts().then((drafts) => {
        setDrafts(drafts);
        return drafts;
      }),
    queryKey: ['getDrafts']
  });

  if (isLoading || isRefetching) {
    return <Loader className="my-10" message="Loading drafts..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load drafts"
      />
    );
  }

  if (!drafts.length) {
    return (
      <div className="my-5">
        <EmptyState
          hideCard
          icon={<ArchiveBoxArrowDownIcon className="size-8" />}
          message="No drafts yet"
        />
      </div>
    );
  }

  const onDeleteDraft = async (draft: Draft) => {
    try {
      setDeleting(true);
      await axios.post(
        `${GOOD_API_URL}/drafts/delete`,
        { id: draft.id },
        { headers: getAuthApiHeaders() }
      );
      setDrafts((drafts) => drafts.filter((d) => d.id !== draft.id));

      return toast.success('Draft deleted successfully');
    } catch {
      return toast.error('Failed to delete draft');
    } finally {
      setDeleting(false);
    }
  };

  const onSelectDraft = (draft: Draft) => {
    editor?.setMarkdown(draft.content);

    setPublicationContent(draft.content);

    if (draft.collectModule) {
      setCollectModule(draft.collectModule as any);
    }

    setDraftId(draft.id);
    setShowModal(false);
  };

  return (
    <div className="max-h-[80vh] divide-y overflow-y-auto dark:divide-gray-700">
      {drafts.map((draft) => (
        <div
          className="flex cursor-pointer items-center justify-between space-x-5 p-5"
          key={draft.id}
          onClick={() => onSelectDraft(draft)}
        >
          <div className="line-clamp-3 text-left text-sm">{draft.content}</div>
          <Button
            disabled={deleting}
            onClick={(event) => {
              stopEventPropagation(event);
              onDeleteDraft(draft);
            }}
            outline
            size="sm"
            variant="danger"
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
};

export default List;
