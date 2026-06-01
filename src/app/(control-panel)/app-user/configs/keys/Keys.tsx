import { styled, Typography, LinearProgress, Button } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useEffect, useState } from 'react';
import { useCreateConfigMutation, useGetConfigsQuery } from '../../../../../store/api/configsApi';
import KeysHeader from './KeysHeader';
import GoogleIcon from '@mui/icons-material/Google';
import { useN8nMutation } from '@/store/api/n8nApi';
import useUser from '@auth/useUser';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

function Keys() {
  const [localLoading, setLocalLoading] = useState(false);
  const [credencialGoogle, setCrecialGoogle] = useState<string>('');
  const [n8n, { isLoading: isLoadingN8n }] = useN8nMutation();
  const user = useUser();

  const {
    data: configGoogle,
    isLoading: isLoadingGoogle,
    refetch: refetchGoogle,
  } = useGetConfigsQuery('key=GOOGLE-CREDENTIAL', { refetchOnMountOrArgChange: true });

  const [createConfig, { isLoading: isLoadingCreate }] = useCreateConfigMutation();

  useEffect(() => {
    if (configGoogle) {
      setCrecialGoogle(configGoogle?.data?.value || '');
    }
  }, [configGoogle]);

  useEffect(() => {
    if (credencialGoogle) {
    }
  }, [credencialGoogle, n8n]);

  const handleGoogleOAuth = () => {
    if (!credencialGoogle) {
      n8n({
        url: '/api/v1/credentials',
        method: 'POST',
        data: {
          name: user?.data?.data?.email,
          type: 'googleCalendarOAuth2Api',
        },
      })
        .unwrap()
        .then((response) => {
          createConfig({
            key: 'GOOGLE-CREDENTIAL',
            value: response?.data?.id || '',
            name: 'Credential n8n para Google Calendar',
          })
            .unwrap()
            .then(() => {
              n8n({
                url: `/rest/oauth2-credential/auth?id=${response?.data?.id}&redirectAfterAuth=https://n8n.alldohost.com.br/success`,
                method: 'FETCH',
              })
                .unwrap()
                .then((response) => {
                  window.open(response?.data?.data, '_blank', 'width=500,height=700');
                })
                .catch((error) => {
                  console.error('Error during Google OAuth:', error);
                });
              refetchGoogle();
            })
            .catch((error) => console.error('Error creating Google Credential:', error));
        })
        .catch((error) => {
          console.error('N8N Error:', error);
        });
    } else {
      n8n({
        url: `/rest/oauth2-credential/auth?id=${credencialGoogle}&redirectAfterAuth=https://n8n.alldohost.com.br/success`,
        method: 'FETCH',
      })
        .unwrap()
        .then((response) => {
          window.open(response?.data?.data, '_blank', 'width=500,height=700');
        })
        .catch((error) => {
          console.error('Error during Google OAuth:', error);
        });
    }
  };

  return (
    <Root
      header={<KeysHeader setLoading={setLocalLoading} />}
      content={
        <div className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full">
          {(isLoadingN8n || localLoading || isLoadingGoogle) && (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          )}

          <>
            <div className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full p-8 max-w-2xl">
              <Typography className="mb-4" variant="h5">
                <strong>Google Calendar</strong> - Conecte sua conta Google para sincronizar eventos na sua agenda.
              </Typography>

              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleOAuth}
                  disabled={isLoadingCreate || isLoadingN8n || localLoading || isLoadingGoogle}
                >
                  Conectar com Google
                </Button>
              </>
            </div>
          </>
        </div>
      }
    />
  );
}

export default Keys;
