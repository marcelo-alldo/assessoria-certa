import { styled } from '@mui/material/styles';
import FuseMessage from '@fuse/core/FuseMessage';
import { memo, ReactNode, Suspense, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Layout1ConfigDefaultsType } from 'src/components/theme-layouts/layout1/Layout1Config';
import useFuseLayoutSettings from '@fuse/core/FuseLayout/useFuseLayoutSettings';
import FooterLayout1 from './components/FooterLayout1';
import LeftSideLayout1 from './components/LeftSideLayout1';
import NavbarWrapperLayout1 from './components/NavbarWrapperLayout1';
import RightSideLayout1 from './components/RightSideLayout1';
import ToolbarLayout1 from './components/ToolbarLayout1';
import FuseDialog from '@fuse/core/FuseDialog';
import { useGetConfigsQuery } from '@/store/api/configsApi';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import useUser from '@auth/useUser';
import { useGetUserSubscriptionsQuery } from '@/store/api/userApi';
import { useReminderNotifications } from '../components/quickPanel/hooks/useReminderNotifications';
import ReminderNotificationModal from '../components/quickPanel/components/ReminderNotificationsModal';

const Root = styled('div')(({ config }: { config: Layout1ConfigDefaultsType }) => ({
  ...(config.mode === 'boxed' && {
    clipPath: 'inset(0)',
    maxWidth: `${config.containerWidth}px`,
    margin: '0 auto',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  }),
  ...(config.mode === 'container' && {
    '& .container': {
      maxWidth: `${config.containerWidth}px`,
      width: '100%',
      margin: '0 auto',
      '@media (min-width: 96rem)': {
        maxWidth: `${config.containerWidth}px!important`,
      },
    },
  }),
  ...(config.mode === 'fullwidth' && {
    '& .container': {
      maxWidth: '100%!important',
      width: '100%!important',
    },
  }),
}));

type Layout1Props = {
  children?: ReactNode;
};

/**
 * The layout 1.
 */
function Layout1(props: Layout1Props) {
  const { children } = props;
  const settings = useFuseLayoutSettings();
  const config = settings.config as Layout1ConfigDefaultsType;
  const { data: user } = useUser();
  const navigate = useNavigate();

  const { data: configs } = useGetConfigsQuery('key=ALLDO_STATUS', {
    skip: !user?.uid || !user?.role.includes('user'),
    refetchOnMountOrArgChange: true,
  });

  const { data: userSubscriptions, isFetching: isFetchingUserSubscriptions } = useGetUserSubscriptionsQuery(undefined, {
    skip: !user?.uid || (!user?.role.includes('collaborator') && !user?.role.includes('user')),
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const shouldEnableReminders = Boolean(user?.uid && (user?.role?.includes('user') || user?.role?.includes('collaborator')));

  const { isModalOpen, pendingReminder, closeModal, handleReminderSnoozed } = useReminderNotifications(shouldEnableReminders);

  const [openDialog, setOpenDialog] = useState(false);

  // Se o usuário não tem assinatura ativa ou tem assinatura expirada, joga para a página de assinatura
  useEffect(() => {
    if (user?.role?.includes('user') && !isFetchingUserSubscriptions) {
      const subscriptionActive = userSubscriptions?.data?.some((sub) => sub.status === 'ACTIVE' || sub.status === 'TRIAL');

      if (!subscriptionActive) {
        navigate('/subscriptions');
      }
    }
  }, [user, userSubscriptions, isFetchingUserSubscriptions, navigate]);

  useEffect(() => {
    // Só abre o modal se ainda não viu e o status for PENDING ou CONFIGURATION
    if (!sessionStorage.getItem('alldo_has_seen_config_modal') && (configs?.data?.value === 'PENDING' || configs?.data?.value === 'CONFIGURATION')) {
      setOpenDialog(true);
    } else {
      setOpenDialog(false);
    }
  }, [configs]);

  const handleCloseDialog = (callback?: () => void) => {
    setOpenDialog(false);
    sessionStorage.setItem('alldo_has_seen_config_modal', 'true');

    if (callback) callback();
  };

  return (
    <Root id="fuse-layout" config={config} className="flex flex-auto w-full">
      {config.leftSidePanel.display && <LeftSideLayout1 />}

      <div className="flex min-w-0 flex-auto">
        {config.navbar.display && config.navbar.position === 'left' && <NavbarWrapperLayout1 />}

        <main id="fuse-main" className="relative z-10 flex min-h-full min-w-0 flex-auto flex-col">
          {config.toolbar.display && <ToolbarLayout1 className={config.toolbar.style === 'fixed' ? 'sticky top-0' : ''} />}

          <div className="relative z-10 flex min-h-0 flex-auto flex-col">
            <Suspense>
              <FuseDialog />
            </Suspense>
            <Outlet />
            {children}
          </div>

          {config.footer.display && <FooterLayout1 className={config.footer.style === 'fixed' ? 'sticky bottom-0' : ''} />}
        </main>

        {config.navbar.display && config.navbar.position === 'right' && <NavbarWrapperLayout1 />}
      </div>

      {config.rightSidePanel.display && <RightSideLayout1 />}
      <FuseMessage />

      {configs?.data?.value === 'PENDING' && (
        <DefaultConfirmModal
          open={openDialog}
          title="Sua conta está sendo preparada"
          message={
            <>
              Sua conta está sendo configurada para uso. Isso pode levar um tempinho.
              <br />
              <br />
              Enquanto isso, você já pode se familiarizar com o sistema, navegar pelas telas e conhecer as funcionalidades. Assim que tudo estiver
              pronto, você poderá utilizar normalmente o sistema.
            </>
          }
          confirmText="Entendi, explorar o sistema"
          onConfirm={() => handleCloseDialog()}
          hideCancel
        />
      )}

      {configs?.data?.value === 'CONFIGURATION' && (
        <DefaultConfirmModal
          open={openDialog}
          title="Necessário configurar sua conta"
          message={
            <>
              Sua conta ainda não está totalmente configurada. Para garantir que você tenha a melhor experiência, é necessário completar algumas
              configurações iniciais.
              <br />
              <br />
              Por favor, acesse as configurações e complete os passos necessários. Assim que tudo estiver pronto, iremos finalizar a configuração da
              sua conta, ai você poderá utilizar normalmente o sistema.
            </>
          }
          confirmText="Configurar agora"
          onConfirm={() => handleCloseDialog(() => navigate('/configs/status'))}
          hideCancel
        />
      )}

      {shouldEnableReminders && (
        <ReminderNotificationModal open={isModalOpen} reminder={pendingReminder} onClose={closeModal} onReminderSnoozed={handleReminderSnoozed} />
      )}
    </Root>
  );
}

export default memo(Layout1);
