import PageTitle from '@/components/PageTitle';
import { useCreateConfigMutation, useUpdateConfigMutation } from '../../../../../store/api/configsApi';
import { useAppDispatch } from '@/store/hooks';
import { useEffect } from 'react';
import { useN8nMutation } from '@/store/api/n8nApi';
import useUser from '@auth/useUser';

/**
 * The Keys header component.
 */

interface KeysHeaderProps {
  setLoading: (loading: boolean) => void;
  uid?: string;
}

function KeysHeader({ setLoading, uid }: KeysHeaderProps) {
  const dispatch = useAppDispatch();
  const user = useUser();

  const [createConfig, { isLoading: isLoadingCreate }] = useCreateConfigMutation();
  const [updateConfig, { isLoading: isLoadingUpdate }] = useUpdateConfigMutation();
  const [n8n, { isLoading: isLoadingN8n }] = useN8nMutation();

  useEffect(() => {
    setLoading(isLoadingCreate);
  }, [isLoadingCreate]);

  useEffect(() => {
    setLoading(isLoadingUpdate);
  }, [isLoadingUpdate]);

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Chaves" />

      <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3"></div>
    </div>
  );
}

export default KeysHeader;
