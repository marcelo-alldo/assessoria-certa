import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { useMediaQuery } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router';
import { TermsDefault } from '@/components/TermsDefault';

/**
 * The simple pricing page.
 */
function TermsPrivacy() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const contact1Formatted = import.meta.env.VITE_APP_CONTACT_1 ? '55' + import.meta.env.VITE_APP_CONTACT_1.replace(/\D/g, '') : '';
  const contact2Formatted = import.meta.env.VITE_APP_CONTACT_2 ? '55' + import.meta.env.VITE_APP_CONTACT_2.replace(/\D/g, '') : '';

  const handlePosition = (position: number | string) => {
    if (typeof position === 'string') {
      const el = document.getElementById(position);

      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        setVisible(window.scrollY > 200);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
      <IconButton
        onClick={() => handlePosition(0)}
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 2000,
          bgcolor: 'white',
          boxShadow: 3,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.3s',
          '&:hover': { bgcolor: 'primary.light' },
        }}
        size="large"
        aria-label="Voltar ao topo"
        className="rounded-full"
      >
        <KeyboardArrowUpIcon fontSize="inherit" />
      </IconButton>
    );
  }

  return (
    <div className="relative flex min-w-0 flex-auto flex-col overflow-hidden">
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.secondary.main,
          minHeight: '80px',
          backgroundImage: 'url(/assets/images/banner/back-banner.png)', // ajuste o caminho conforme necessário
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right top',
          backgroundSize: 'contain', // ajuste conforme o tamanho desejado
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            top: 0,
            left: 0,
            width: '100%',
            height: '80px',
            // backgroundColor: (theme) => theme.palette.secondary.main,
          }}
          className="bg-black/10"
        >
          <Box height="80%">
            <img className="h-full" src={import.meta.env.VITE_APP_LOGO}></img>
          </Box>

          <Box sx={{ marginLeft: 'auto', marginRight: '20px' }} display={'flex'} alignItems={'center'} height={'100%'}>
            <Button onClick={() => navigate('/sign-in')} variant="contained" sx={{ marginRight: '20px' }} color="secondary">
              Entrar
            </Button>
            <Button onClick={() => navigate('/sign-up')} variant="contained" color="primary">
              Criar conta
            </Button>
          </Box>
        </Box>
      </Box>

      <TermsDefault />

      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <img src="/assets/images/logo/alldo-amarelo.png" alt="Alldo Logo" className="h-16 w-auto" />
                <p className="text-gray-400 text-xs">Alldo Assistente - CRM Inteligente</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-full font-bold">
                <img src="/assets/images/logo/meta.png" alt="Logo Meta" className="h-12 w-auto" />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© 2025 Alldo Assistente - CRM Inteligente. Todos os direitos reservados.</p>
            <p className="mt-2">
              WhatsApp Business API Oficial - Certificado Meta Business Partner{' '}
              <Button onClick={() => navigate('/terms-privacy')} color="secondary">
                Termos de uso
              </Button>{' '}
              |{' '}
              <Button onClick={() => navigate('/terms-privacy')} color="secondary">
                Política de privacidade
              </Button>
            </p>
          </div>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
  );
}

export default TermsPrivacy;
