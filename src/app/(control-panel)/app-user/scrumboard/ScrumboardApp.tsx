import { useGetConfigsQuery } from '@/store/api/configsApi';
import { useAppDispatch } from '@/store/hooks';
import { useEffect } from 'react';
import { Outlet } from 'react-router';

/**
 * The scrumboard app.
 */
function ScrumboardApp() {
  const { data: configs } = useGetConfigsQuery('key=AI-AUTOMATIC', {
    // skip: !user?.uid || !user?.role.includes('user'),
    refetchOnMountOrArgChange: true,
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (configs?.data) {
      const aiAutomaticConfig = configs.data.value == 'true';
      dispatch({ type: 'boardSlice/setAiAutomatic', payload: { aiAutomatic: aiAutomaticConfig } });
    }
  }, [configs, dispatch]);

  return <Outlet />;
}

export default ScrumboardApp;
