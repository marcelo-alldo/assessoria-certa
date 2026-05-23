import { styled, LinearProgress, Button } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEffect, useMemo, useState } from 'react';
import WhatsappHeader from './WhatsappHeader';
import WhatsappInstructions from './WhatsappInstructions';
import { useDispatch } from 'react-redux';
import { useAuthFacebookMutation, useMetaLogoutMutation } from '@/store/api/whatsappApi';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useGetConfigsQuery } from '@/store/api/configsApi';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { formatPhone } from '@/utils/phoneFormatter';

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: typeof FB;
  }
}

declare let FB: any;

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

/**
 * The Whatsapp.
 */

function Whatsapp() {
  const [localLoading, setLocalLoading] = useState(false);
  const [openDisconnectModal, setOpenDisconnectModal] = useState(false);
  const dispatch = useDispatch();

  const {
    data: whatsappConfig,
    isLoading: isLoadingConfig,
    refetch: refetchConfig,
    isError: isErrorConfig,
  } = useGetConfigsQuery('key=WHATSAPP,WHATSAPP-ACCOUNT-ID,WHATSAPP-BUSINESS-ID', {
    refetchOnMountOrArgChange: true,
  });

  const [authFacebook, { isLoading: isLoadingAuthFacebook }] = useAuthFacebookMutation();
  const [metaLogout, { isLoading: isLoadingMetaLogout }] = useMetaLogoutMutation();
  const [dataAuth, setDataAuth] = useState(null);
  const [codeAuth, setCodeAuth] = useState(null);
  const [localConfig, setLocalConfig] = useState(null);

  const fbLoginCallback = (response) => {
    if (response.authResponse) {
      const code = response.authResponse.code;

      if (code) {
        setCodeAuth(code);
      }
    }
  };

  const handleFacebookAuth = async (data: { code: string; data: { phone_number_id: string; waba_id: string; business_id: string } }) => {
    try {
      authFacebook(data)
        .unwrap()
        .then((response) => {
          refetchConfig();
          dispatch(
            showMessage({
              message: response?.msg,
              autoHideDuration: 3000,
              variant: 'success',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
        });
    } catch (error) {
      console.error('Erro ao autenticar com o Facebook:', error);
    }
  };

  const handleDisconnect = () => {
    setOpenDisconnectModal(true);
  };

  const handleConfirmDisconnect = () => {
    metaLogout()
      .unwrap()
      .then((response) => {
        setOpenDisconnectModal(false);
        refetchConfig();
        dispatch(
          showMessage({
            message: response?.msg || 'Desconectado com sucesso',
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      })
      .catch((error) => {
        setOpenDisconnectModal(false);
        dispatch(
          showMessage({
            message: error?.data?.msg || 'Erro ao desconectar',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
  };

  const handleCancelDisconnect = () => {
    setOpenDisconnectModal(false);
  };

  useEffect(() => {
    if (codeAuth && dataAuth) {
      handleFacebookAuth({ code: codeAuth, data: dataAuth });
    }
  }, [codeAuth, dataAuth]);

  useEffect(() => {
    if (whatsappConfig?.data) {
      setLocalConfig(whatsappConfig?.data);
    }

    if (isErrorConfig) {
      setLocalConfig(null);
    }
  }, [whatsappConfig, isErrorConfig]);

  const launchWhatsAppSignup = () => {
    // Launch Facebook login
    FB.login(fbLoginCallback, {
      config_id: '735531792212061', // configuration ID goes here
      response_type: 'code', // must be set to 'code' for System User access token
      override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
      extras: {
        version: 'v3',
        sessionInfoVersion: '3',
        featureType: 'whatsapp_business_app_onboarding',
      },
    });
  };

  useEffect(() => {
    // Load Facebook SDK if not already loaded
    if (!window.FB) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.onload = () => {
        window.fbAsyncInit && window.fbAsyncInit();
      };
      document.body.appendChild(script);
    }

    window.fbAsyncInit = function () {
      FB.init({
        appId: '750606814188946',
        cookie: true,
        xfbml: true,
        version: 'v23.0',
      });

      FB.AppEvents.logPageView();
    };

    // Session logging message event listener
    const messageHandler = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;

      try {
        const data = JSON.parse(event.data);

        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          setDataAuth(data.data);
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  const phoneMemo = useMemo(() => {
    const phone = localConfig?.find((item) => item.key === 'WHATSAPP')?.value || '';
    return formatPhone(phone);
  }, [localConfig]);

  const whatsappAccountId = useMemo(() => {
    return localConfig?.find((item) => item.key === 'WHATSAPP-ACCOUNT-ID')?.value || '';
  }, [localConfig]);

  const whatsappBusinessId = useMemo(() => {
    return localConfig?.find((item) => item.key === 'WHATSAPP-BUSINESS-ID')?.value || '';
  }, [localConfig]);

  return (
    <>
      <Root
        scroll="content"
        header={<WhatsappHeader />}
        content={
          <div className="flex flex-1 flex-col h-full">
            {localLoading || isLoadingConfig ? (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            ) : localConfig?.length ? (
              <div className="flex flex-1 flex-col h-full p-6">
                <div className="w-full max-w-md">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute inset-0 w-16 h-16 bg-green-200 rounded-full animate-ping opacity-20"></div>
                      </div>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">Conectado com sucesso</h1>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">Sua conta WhatsApp está ativa e funcionando perfeitamente</p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-8">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Número conectado</div>
                      <div className="text-lg font-semibold text-gray-800">{phoneMemo}</div>
                    </div>

                    <Button
                      LinkComponent={'a'}
                      href={`https://business.facebook.com/billing_hub/accounts/details/?asset_id=${whatsappAccountId}&business_id=${whatsappBusinessId}`}
                      target="_blank"
                      rel="noreferrer"
                      startIcon={<FuseSvgIcon size={20}>material-outline:payment</FuseSvgIcon>}
                      variant="contained"
                      fullWidth
                      sx={{ my: 1, color: 'white !important' }}
                      className="bg-green-500 hover:bg-green-600 transition-all duration-200 "
                    >
                      Configurar pagamento Whatsapp
                    </Button>

                    <Button variant="outlined" color="error" fullWidth onClick={handleDisconnect}>
                      Desconectar conta
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full p-8" style={{ maxWidth: '600px' }}>
                <WhatsappInstructions />

                <button
                  onClick={launchWhatsAppSignup}
                  className="flex items-center justify-center gap-3 bg-[#1877f2] hover:bg-[#166fe5] transition-colors duration-200 border-0 rounded-lg text-white cursor-pointer font-semibold text-base h-12 px-6 shadow-md hover:shadow-lg"
                >
                  <FuseSvgIcon size={20} className="flex-shrink-0">
                    material-solid:facebook
                  </FuseSvgIcon>
                  Login com Facebook
                </button>
              </div>
            )}
          </div>
        }
      />
      <DefaultConfirmModal
        open={openDisconnectModal}
        title="Desconectar WhatsApp"
        message={
          <>
            Tem certeza que deseja desconectar sua conta do WhatsApp?
            <br />
            <br />
            <strong>Atenção:</strong> Ao desconectar, você perderá todo o histórico de conversas deste número. Esta ação não poderá ser desfeita.
          </>
        }
        confirmText="Sim, desconectar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDisconnect}
        onCancel={handleCancelDisconnect}
        confirmColor="error"
        loading={isLoadingMetaLogout}
      />
    </>
  );
}

export default Whatsapp;
