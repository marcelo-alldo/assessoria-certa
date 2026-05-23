import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { CircularProgress, Typography } from '@mui/material';
import { useAuthActivationEmailMutation, useAuthUpdateActivationEmailMutation } from '@/store/api/authApi';
import { useParams } from 'react-router';
import Link from '@fuse/core/Link';

/**
 * Form Validation Schema
 */

function ConfirmAccountTab() {
  const { token } = useParams<string>();
  const [disabledButton, setDisabledButton] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);

  const [activationEmail, resPost] = useAuthActivationEmailMutation();
  const [updateActivationCode, resUpdate] = useAuthUpdateActivationEmailMutation();

  useEffect(() => {
    activationEmail(token);
  }, []);

  useEffect(() => {
    if (resUpdate.isSuccess) {
      setDisabledButton(true);
      setTime(60);
    }
  }, [resUpdate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (disabledButton && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setDisabledButton(false);
    }

    return () => clearInterval(timer);
  }, [disabledButton, time]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes} minuto${minutes > 1 ? 's' : ''} e ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`
      : `${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;
  };

  return (
    <>
      {resPost?.isLoading && (
        <div className="flex h-full w-full items-center justify-center">
          <CircularProgress />
        </div>
      )}
      {resPost?.isError && (
        <>
          <Typography className="mt-12 text-center text-4xl font-extrabold leading-tight tracking-tight">Codigo invalido ou expirado</Typography>
          <Button
            variant="contained"
            color="primary"
            disabled={disabledButton || resUpdate?.isLoading}
            fullWidth
            sx={{ marginTop: '3rem' }}
            onClick={() => updateActivationCode(token)}
          >
            {resUpdate?.isLoading ? <CircularProgress size={24} /> : 'Reenviar e-mail de verificação'}
          </Button>
          {disabledButton && (
            <Typography variant="body2" textAlign="center" marginTop="1rem">
              {`Aguarde ${formatTime(time)} para reenviar novamente`}
            </Typography>
          )}
        </>
      )}
      {!resPost?.isLoading && !resPost?.isError && resPost?.isSuccess && (
        <>
          <Typography className="mt-12 text-center text-4xl font-extrabold leading-tight tracking-tight">conta confirmada com sucesso!</Typography>
          <Link className="mt-12 block font-normal" to="/sign-in">
            Voltar para o login
          </Link>
        </>
      )}
    </>
  );
}

export default ConfirmAccountTab;
