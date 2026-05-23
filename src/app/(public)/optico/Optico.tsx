import { useState, useEffect } from 'react';
// import { MessageCircle, Calendar, Users, Shield, Zap, CheckCircle, XCircle, Award, BarChart, Sparkles, Star } from 'lucide-react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import PaidIcon from '@mui/icons-material/Paid';
import GppGoodIcon from '@mui/icons-material/GppGood';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CancelOutlinedIcon from '@mui/icons-material/Close';
import { Box, Button, Grid, IconButton, Typography, TextField, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IMaskInput } from 'react-imask';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { TableDataItemType } from '@/components/checkout-subscriptions/TablePricingTable';
import { useGetSubscriptionsQuery } from '@/store/api/subscriptionApi';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import TablePricingPage from '@/components/checkout-subscriptions/TablePricingPage';

const submitPublicLead = async (data: ContactFormType) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'}/public/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      source: 'OPTICO_LANDING_PAGE',
      leadType: 'CONTACT_FORM',
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao enviar formulário';

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Se não conseguir parsear JSON, usa mensagem padrão baseada no status
      switch (response.status) {
        case 429:
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
          break;
        case 400:
          errorMessage = 'Dados inválidos. Verifique as informações preenchidas.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

// Schema de validação do formulário
const contactFormSchema = z.object({
  companyName: z.string().nonempty('Nome da empresa é obrigatório'),
  responsibleName: z.string().nonempty('Nome do responsável é obrigatório'),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').nonempty('E-mail é obrigatório'),
});

type ContactFormType = z.infer<typeof contactFormSchema>;

const contactFormDefaults = {
  companyName: '',
  responsibleName: '',
  phone: '',
  email: '',
};

export default function Optico() {
  const [activeTab, setActiveTab] = useState('anual');
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<{
    period: 'month' | 'year';
    title: string;
    price: string;
    priceYearly: string;
    uid: string;
  }>({ period: 'year', title: '', price: '', priceYearly: '', uid: '' });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Form para contato
  const { control, handleSubmit, formState, reset } = useForm<ContactFormType>({
    mode: 'onChange',
    defaultValues: contactFormDefaults,
    resolver: zodResolver(contactFormSchema),
  });

  const { errors, isValid } = formState;

  const onSubmitContactForm = async (data: ContactFormType) => {
    setIsSubmitting(true);
    try {
      await submitPublicLead(data);

      dispatch(
        showMessage({
          message: 'Formulário enviado com sucesso. Nossa equipe entrará em contato em breve.',
          autoHideDuration: 6000,
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
      reset();

      // Opcional: Redirecionar para página de obrigado
      // navigate('/obrigado');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);

      dispatch(
        showMessage({
          message: `Erro ao enviar formulário. Tente novamente.`,
          autoHideDuration: 8000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contact1Formatted = import.meta.env.VITE_APP_CONTACT_1 ? '55' + import.meta.env.VITE_APP_CONTACT_1.replace(/\D/g, '') : '';
  const contact2Formatted = import.meta.env.VITE_APP_CONTACT_2 ? '55' + import.meta.env.VITE_APP_CONTACT_2.replace(/\D/g, '') : '';

  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } = useGetSubscriptionsQuery('type=OPTICO', {
    refetchOnMountOrArgChange: true,
  });

  const [tableData, setTableData] = useState<TableDataItemType[]>([
    {
      monthlyPrice: '-',
      yearlyPrice: '-',
      title: 'Plano básico',
      buttonTitle: 'Assinar',
      isPopular: false,
      features: {
        leadsContacts: 'até 1000',
        flows: '0',
        ai: 'Sem',
        attendants: 'até 5',
        calendar: 'Google Calendar',
        whatsapp: 'WhatsApp API Oficial',
        functions: 'Padrões',
      },
    },
    {
      monthlyPrice: '-',
      yearlyPrice: '-',
      title: 'Plano intermediário',
      buttonTitle: 'Assinar',
      isPopular: true,
      features: {
        leadsContacts: 'até 2.000',
        flows: '1',
        ai: 'Com',
        attendants: 'até 10',
        flowType: 'Período de adaptação',
        calendar: 'Google Calendar',
        whatsapp: 'WhatsApp API Oficial',
        functions: 'Padrões',
      },
    },
    {
      monthlyPrice: '-',
      yearlyPrice: '-',
      title: 'Plano completo',
      buttonTitle: 'Assinar',
      isPopular: false,
      features: {
        leadsContacts: 'até 5.000',
        flows: '3',
        ai: 'Com',
        attendants: 'até 20',
        flowType: 'Período de adaptação, Atendimento e Estratégia de vendas',
        calendar: 'Google Calendar',
        whatsapp: 'WhatsApp API Oficial',
        functions: 'Avançadas',
      },
    },
  ]);

  useEffect(() => {
    if (subscriptionsData?.data?.length) {
      setTableData((prev) =>
        prev.map((item) => {
          const subscription = subscriptionsData.data.find((sub) => (sub?.name).replace('Óptico - ', '') === item?.title);

          if (subscription) {
            return {
              ...item,
              monthlyPrice: subscription.price,
              yearlyPrice: subscription.priceYearly,
            };
          }

          return item;
        }),
      );
    }
  }, [subscriptionsData]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const problems = [
    {
      icon: (
        <Typography variant="h4" color="primary">
          01
        </Typography>
      ),
      title: 'Clientes que esquecem de buscar os óculos na loja',
      description: '',
    },
    {
      icon: (
        <Typography variant="h4" color="primary">
          02
        </Typography>
      ),
      title: 'Falta de acompanhamento e relacionamento após a venda',
      description: '',
    },
    {
      icon: (
        <Typography variant="h4" color="primary">
          03
        </Typography>
      ),
      title: 'Perda constante de oportunidades de recompra',
      description: '',
    },
    {
      icon: (
        <Typography variant="h4" color="primary">
          04
        </Typography>
      ),
      title: 'Falta de organização e controle no processo de produção',
      description: '',
    },
  ];

  const planInfos = [
    {
      name: 'Plano básico',
      subTitle: 'Automação e Controle de Produção',
      price: 187,
      features: [
        'Envio automático de mensagens durante controle de produção',
        'Automação de mensagens conforme etapa do CRM',
        'Avisos e promoções manuais',
        'Controle leads e multiatendimento',
        'Até 5 atendentes',
        'Até 1000 Leads/Contatos ativos',
        'Sem inteligência artificial',
        'Atendimento via WhatsApp API Oficial',
      ],
      popular: false,
      subscriptionUid: '687b7d91-532d-499b-9726-60491699a482',
    },
    {
      name: 'Plano intermediário',
      subTitle: 'Fidelização e satisfação',
      price: 397,
      features: [
        'Com inteligência artificial',
        'Realização de pesquisa técnica e de satisfação do produto (7 dias)',
        'Acompanhamento de pós-venda estruturado sobre dúvidas frequentes',
        'Controle de leads e multiatendimento',
        'Até 2000 Leads/Contatos ativos',
        'Até 10 atendentes',
        'Atendimento via WhatsApp API Oficial',
        'Funções Padrões',
      ],
      popular: true,
      subscriptionUid: 'e553bc78-f594-4144-9197-ba6b0ad36d0d',
    },
    {
      name: 'Plano completo',
      subTitle: 'Crescimento de faturamento c/ recompra',
      price: 697,
      features: [
        'Com inteligência artificial',
        'Estratégias de aumento de vendas direto na base',
        'Avisos estratégicos de recompra após 1 ano',
        'Recuperação de clientes e orçamentos perdidos (manual)',
        'Até 5000 Leads/Contatos ativos',
        'Até 20 atendentes',
        'Atendimento via WhatsApp API Oficial',
        'Funções Avançadas',
      ],
      popular: false,
      subscriptionUid: '6b3a31f5-03f8-42e2-84cc-5fae43467010',
    },
  ];

  const handleSelectPlan = (title: string) => {
    const selectedPlan = subscriptionsData?.data.find((sub) => sub.name.replace('Óptico - ', '') === title);

    if (selectedPlan) {
      setOpenModal(true);
      setSelectedPlanData({
        period: activeTab === 'anual' ? 'month' : 'year',
        title: selectedPlan.name,
        price: selectedPlan.price,
        priceYearly: selectedPlan.priceYearly,
        uid: selectedPlan.uid,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gradient-to-r from-[#E9EDEF] via-[#E9EDEF] to-[#F7F7F700] backdrop-blur-md shadow-2xl' : 'bg-gradient-to-r from-[#E9EDEF] via-[#E9EDEF] to-[#F7F7F700]'}`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/assets/images/logo/logo-optico.svg" alt="Alldo Logo" style={{ height: '53px' }} />
            </div>
            <div className="hidden md:flex">
              <Button onClick={() => handlePosition('inicio')} color="inherit" className="px-6 py-2 text-black rounded-full transition">
                Início
              </Button>
              <Button onClick={() => handlePosition('solucoes')} color="inherit" className="px-6 py-2 text-black rounded-full transition">
                Soluções
              </Button>
              <Button onClick={() => handlePosition('recursos')} color="inherit" className="px-6 py-2 text-black rounded-full transition">
                Recursos
              </Button>
              <Button onClick={() => handlePosition('planos')} color="inherit" className="px-6 py-2 text-black rounded-full transition">
                Planos
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/sign-in')} color="inherit" className="px-6 py-2 text-black rounded-full transition hidden md:block">
                Entrar
              </Button>
              <Button
                variant="contained"
                onClick={() =>
                  window.open(
                    `https://wa.me/${contact1Formatted}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o Alldo Óptico.')}`,
                    '_blank',
                  )
                }
                className="rounded-full text-black bg-white px-4 py-2 text-sm md:px-6 md:py-2 md:text-base"
              >
                Fale Conosco
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E9EDEF] via-[#E9EDEF] to-[#F7F7F7]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 mb-6">
              <Box
                sx={{
                  backgroundColor: 'secondary.main',
                  paddingX: '6px',
                  paddingY: '2px',
                  display: 'flex',
                  borderRadius: '1rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VisibilityIcon color="primary" />
              </Box>
              <Typography component={'span'} id="inicio" color="primary" className=" text-lg">
                Transforme o atendimento da sua ótica
              </Typography>
            </div>

            <Typography color="primary" className="text-6xl md:text-10xl font-semibold">
              Enxergue o futuro
            </Typography>
            <Typography color="primary" className="text-6xl md:text-10xl font-semibold">
              do atendimento
            </Typography>

            <Typography color="primary" variant="h5" style={{ color: '#000000B8' }} className=" mt-6 mb-12">
              Transforme o Whatsapp da sua ótica em um canal
              <br /> estruturado de captação, pós-venda e recompra.
            </Typography>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/sign-up?mode=OPTICO&subscription=687b7d91-532d-499b-9726-60491699a482')}
                className="p-8 rounded-full text-2xl hover:bg-yellow-300 transition transform hover:scale-105 shadow-xl flex items-center justify-center"
              >
                Garanta seu teste
              </Button>

              <Button
                variant="contained"
                onClick={() => handlePosition('planos')}
                className="p-8 bg-white text-black rounded-full text-2xl hover:bg-yellow-400/10 transition"
              >
                Ver planos &rarr;
              </Button>
            </div>

            <div className="flex flex-col w-full sm:flex-row gap-4 justify-center">
              <img src="/assets/images/optico/banner.jpg" alt="banner" className="rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-[#F7F7F7] via-[#E9EDEF] to-[#E9EDEF]">
        <div className="container mx-auto px-6">
          <Grid container spacing={4} alignItems="center" justifyContent={'space-between'} className="mb-16">
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography color="primary" component={'p'} className=" mb-4 text-3xl">
                Transforme o WhatsApp <span style={{ color: '#0000007A' }}>da sua ótica</span>
                <br /> <span style={{ color: '#0000007A' }}>em um canal estruturado de</span> captação,
                <br /> pós-venda e recompra.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography style={{ color: '#000000B8' }} component={'p'} className=" mb-4 text-2xl">
                O Alldo Óptico é um CRM inteligente desenvolvido exclusivamente para o mercado óptico
              </Typography>
            </Grid>
          </Grid>
          <div
            className="text-center mb-16 py-16 rounded-2xl flex flex-col items-center justify-between relative"
            style={{
              backgroundSize: 'cover, cover',
              background:
                'url(/assets/images/optico/women-phone.jpg) no-repeat top center, linear-gradient(180deg, rgba(120, 164, 210, 0) 85.55%, rgba(120, 164, 210, 0.64) 92.74%, #78A4D2 100%)',
              minHeight: '1000px',
            }}
          >
            <div style={{ position: 'absolute', top: '45%', left: '20px', right: '20px', bottom: 0, pointerEvents: 'none' }}>
              {/* Notificação Produção */}
              <Box
                sx={{
                  backgroundColor: '#FFFFFF8F',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  gap: '12px',
                  marginBottom: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  maxWidth: '340px',
                  marginLeft: { xs: '0px', md: '0px' },
                }}
              >
                <Box
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src="/assets/images/optico/icone-amarelo.svg" alt="Produção" />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Box>
                    <Typography variant="body2" textAlign={'left'} color="black" sx={{ fontSize: '16px', lineHeight: '16px' }}>
                      Produção
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" textAlign={'left'} sx={{ fontSize: '13px', lineHeight: '14px', color: '#000000A3' }}>
                      Pedido #4821 → Em produção
                    </Typography>
                  </Box>
                </Box>
                <Box display={'flex'} flexDirection={'row'} alignItems={'flex-start'} justifyContent={'flex-end'}>
                  <Typography variant="caption" color="#999" sx={{ fontSize: '11px', marginLeft: 'auto', minHeight: '60px' }}>
                    Agora
                  </Typography>
                </Box>
              </Box>

              {/* Notificação Pós-venda */}
              <Box
                sx={{
                  backgroundColor: '#FFFFFF8F',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  gap: '12px',
                  marginLeft: { xs: '0px', md: '40px' },
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  maxWidth: '340px',
                  marginBottom: '16px',
                }}
              >
                <Box
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src="/assets/images/optico/icone-amarelo.svg" alt="Pós-venda" />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Box>
                    <Typography variant="body2" textAlign={'left'} color="black" sx={{ fontSize: '16px', lineHeight: '16px' }}>
                      Pós-venda
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" textAlign={'left'} sx={{ fontSize: '13px', lineHeight: '14px', color: '#000000A3' }}>
                      Canal de suporte ativado
                    </Typography>
                  </Box>
                </Box>
                <Box display={'flex'} flexDirection={'row'} alignItems={'flex-start'} justifyContent={'flex-end'}>
                  <Typography variant="caption" color="#999" sx={{ fontSize: '11px', marginLeft: 'auto', minHeight: '60px' }}>
                    há 4 min
                  </Typography>
                </Box>
              </Box>

              {/* Notificação Expansão */}
              <Box
                sx={{
                  backgroundColor: '#FFFFFF8F',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  gap: '12px',
                  marginLeft: { xs: '0px', md: '80px' },
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  maxWidth: '340px',
                  marginBottom: '16px',
                }}
              >
                <Box
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src="/assets/images/optico/icone-amarelo.svg" alt="Expansão" />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Box>
                    <Typography variant="body2" textAlign={'left'} color="black" sx={{ fontSize: '16px', lineHeight: '16px' }}>
                      Expansão
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" textAlign={'left'} sx={{ fontSize: '13px', lineHeight: '14px', color: '#000000A3' }}>
                      Nova oportunidade detectada
                    </Typography>
                  </Box>
                </Box>
                <Box display={'flex'} flexDirection={'row'} alignItems={'flex-start'} justifyContent={'flex-end'}>
                  <Typography variant="caption" color="#999" sx={{ fontSize: '11px', marginLeft: 'auto', minHeight: '60px' }}>
                    há 15 min
                  </Typography>
                </Box>
              </Box>
            </div>
            <p className="text-4xl md:text-5xl mb-4">
              Ele automatiza o seu atendimento,
              <br />
              o acompanhamento da produção e
              <br />o pós-venda pelo WhatsApp.
            </p>
            <p className="text-xl max-w-2xl mx-auto">
              Com o Alldo Óptico, você garante mais clientes retornando, mais organização no seu processo e o aumento do faturamento da sua ótica.
            </p>
          </div>

          <Box display={'flex'} justifyContent={'center'} alignItems={'center'} marginBottom={4} marginTop={16}>
            <div className="inline-flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2">
              <Box
                sx={{
                  backgroundColor: 'secondary.main',
                  paddingX: '6px',
                  paddingY: '2px',
                  display: 'flex',
                  borderRadius: '1rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WarningIcon color="primary" />
              </Box>
              <Typography component={'span'} color="primary" className=" text-lg">
                Gargalos comuns no atendimento
              </Typography>
            </div>
          </Box>

          <Box marginBottom={8}>
            <Typography color="primary" component={'p'} className="text-5xl md:text-7xl mb-4 text-center">
              Você reconhece esses
              <br /> problemas na sua ótica?
            </Typography>
          </Box>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {problems.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white text-black rounded-2xl p-4 hover:from-black-400/10 hover:to-black-400/5  hover:border-black-400/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-black-400/20"
              >
                <Box
                  sx={{ backgroundColor: 'secondary.main' }}
                  className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-300 items-center justify-center w-12 h-10 p-1 rounded-lg
                  "
                >
                  {feature.icon}
                </Box>
                <Typography className="text-xl mb-3 transition" style={{ color: '#0000008F ' }}>
                  {feature.title}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Comparison Section */}
      <section className="py-20 bg-[#FFF]">
        <div className="container mx-auto px-6">
          <Grid container spacing={4} alignItems="center" justifyContent={'space-between'} className="mb-16">
            <Grid size={{ xs: 12, md: 7 }}>
              <Box display={'flex'} justifyContent={'flex-start'} alignItems={'flex-start'} mb={3}>
                <div className="inline-flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2" id="solucoes">
                  <Box
                    sx={{
                      backgroundColor: 'secondary.main',
                      paddingX: '6px',
                      paddingY: '2px',
                      display: 'flex',
                      borderRadius: '1rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AutoAwesomeIcon color="primary" />
                  </Box>
                  <Typography component={'span'} color="primary" className=" text-lg">
                    Como funciona?
                  </Typography>
                </div>
              </Box>
              <Box>
                <Typography color="primary" component={'p'} className="text-5xl md:text-7xl mb-4 text-left">
                  Como o Alldo
                  <br /> Óptico resolve isso
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} justifyContent={'flex-end'} alignItems={'flex-start'} display={'flex'}>
              <Box mt={{ xs: 0, md: 8 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/sign-up?mode=OPTICO&subscription=687b7d91-532d-499b-9726-60491699a482')}
                  className="p-6 rounded-full hover:bg-yellow-300 transition transform hover:scale-105 shadow-xl flex items-center justify-center"
                >
                  Garanta seu teste
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2} className="mb-16">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box mb={2}>
                <img src="/assets/images/optico/how-1.jpg" alt="Como funciona 1" className="rounded-2xl" />
              </Box>
              <Box>
                <Typography color="primary" variant="h5" className=" mb-2 text-left">
                  Avisos automáticos
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-left"
                >
                  O sistema envia atualizações de status e avisa quando está pronto para retirada ou entrega.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box mb={2}>
                <img src="/assets/images/optico/how-2.jpg" alt="Como funciona 2" className="rounded-2xl" />
              </Box>
              <Box>
                <Typography color="primary" variant="h5" className=" mb-2 text-left">
                  Fidelização e recompra
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-left"
                >
                  Acompanhamento automático após 1 ano com avisos de recompra para trazer o cliente de volta.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box mb={2}>
                <img src="/assets/images/optico/how-3.jpg" alt="Como funciona 3" className="rounded-2xl" />
              </Box>
              <Box>
                <Typography color="primary" variant="h5" className=" mb-2 text-left">
                  Pós venda estruturado
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-left"
                >
                  Acompanhamento da adaptação e relacionamento contínuo, mantendo o vínculo sem ser invasivo.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2} className="mb-16">
            <Grid size={{ xs: 12 }} display={'flex'} flexDirection={'column'}>
              <Box display={'flex'} style={{ width: '100% ' }} justifyContent={'center'} id="recursos">
                <div className="inline-flex items-center space-x-2 border-1 rounded-full px-4 py-2 mb-6">
                  <Box
                    sx={{
                      backgroundColor: 'secondary.main',
                      paddingX: '6px',
                      paddingY: '2px',
                      display: 'flex',
                      borderRadius: '1rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <VisibilityIcon color="primary" />
                  </Box>
                  <Typography component={'span'} color="primary" className=" text-lg">
                    Nossos recursos
                  </Typography>
                </div>
              </Box>
              <Box>
                <Typography color="primary" className="text-5xl md:text-7xl mb-2 text-center">
                  Transforme cada venda em
                  <br /> um relacionamento lucrativo
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-center"
                >
                  Sem aumentar o trabalho da sua equipe!
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ backgroundColor: '#E9EDEF7A', borderRadius: '1rem' }}>
              <Box px={4} py={2}>
                <img src="/assets/images/optico/r-1.jpg" alt="Como funciona 1" className="rounded-2xl" />
              </Box>
              <Box px={4} py={2}>
                <Typography color="primary" variant="h5" className=" mb-2 text-left">
                  Gestão centralizada e FAQ inteligente
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-left"
                >
                  Alldo Óptico conta com uma base de dados estruturada com informações de dúvidas frequentes para resolver as objeções dos clientes na
                  hora.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ backgroundColor: '#E9EDEF7A', borderRadius: '1rem' }}>
              <Box px={4} py={2}>
                <img src="/assets/images/optico/r-2.jpg" alt="Como funciona 2" className="rounded-2xl" />
              </Box>
              <Box px={4} py={2}>
                <Typography color="primary" variant="h5" className=" mb-2 text-left">
                  Fim da ansiedade na produção
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-left"
                >
                  {' '}
                  Atualizações automáticas de status (estilo grandes e-commerces), evitando que o cliente precise ligar para saber se os óculos estão
                  prontos.{' '}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }} sx={{ backgroundColor: '#E9EDEF7A', borderRadius: '1rem' }}>
              <Box px={4} py={2}>
                <img src="/assets/images/optico/r-3.jpg" alt="Como funciona 3" className="rounded-2xl" />
              </Box>
              <Box px={4} py={2}>
                <Typography color="primary" variant="h5" className=" mb-2 text-left">
                  Adaptação técnica à prova de crises
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-left"
                >
                  O Alldo acompanha os primeiros dias de uso; em caso de problemas alerta a equipe, se não, envia instruções de cuidado.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ backgroundColor: '#E9EDEF7A', borderRadius: '1rem' }}>
              <Box px={4} py={2}>
                <img src="/assets/images/optico/r-4.jpg" alt="Como funciona 4" className="rounded-2xl" />
              </Box>
              <Box px={4} py={2}>
                <Typography color="primary" variant="h5" className=" mb-2 text-left">
                  Entrega que gera confiança
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-left"
                >
                  Após a retirada, o cliente recebe agradecimento e acesso ao suporte, eliminando a insegurança pós-compra.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }} sx={{ backgroundColor: '#E9EDEF7A', borderRadius: '1rem' }}>
              <Box px={4} py={2}>
                <img src="/assets/images/optico/r-5.jpg" alt="Como funciona 5" className="rounded-2xl" />
              </Box>
              <Box px={4} py={2}>
                <Typography color="primary" variant="h5" className=" mb-2 text-left">
                  Expansão Familiar (Após 3 meses)
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-left"
                >
                  Após a adaptação, o Alldo verifica a satisfação e identifica novas oportunidades de venda na família.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} sx={{ backgroundColor: '#E9EDEF7A', borderRadius: '1rem' }}>
              <Box px={4} py={2}>
                <img src="/assets/images/optico/r-6.jpg" alt="Como funciona 6" className="rounded-2xl" />
              </Box>
              <Box px={4} py={2}>
                <Typography color="primary" variant="h5" className=" mb-2 text-left">
                  Relacionamento e recompra garantida
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-left"
                >
                  Sua ótica não cai no esquecimento: o sistema envia campanhas por datas, convida para ajustes/limpeza e incentiva a revisão de grau
                  no momento certo.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="pb-20 bg-gradient-to-b from-[#FFF] via-[#F7F7F7] to-[#E9EDEF]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Box display={'flex'} style={{ width: '100% ' }} justifyContent={'center'}>
              <div className="inline-flex items-center space-x-2 border-1 rounded-full px-4 py-2 mb-6" id="planos">
                <Box
                  sx={{
                    backgroundColor: 'secondary.main',
                    paddingX: '6px',
                    paddingY: '2px',
                    display: 'flex',
                    borderRadius: '1rem',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PaidIcon color="primary" />
                </Box>
                <Typography component={'span'} color="primary" className=" text-lg">
                  Nossos planos / Preços
                </Typography>
              </div>
            </Box>
            <Box>
              <Typography color="primary" className="text-5xl md:text-7xl mb-2 text-center">
                Nossos planos
              </Typography>
              <Typography
                color="primary"
                component={'p'}
                style={{ color: '#0000008F', fontSize: '16px' }}
                variant="body2"
                className=" mb-4 text-center"
              >
                Escolha a estrutura ideal para o momento da sua ótica:
              </Typography>
            </Box>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {isLoadingSubscriptions
              ? [1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-white to-gray-200 rounded-2xl p-8 border-black-400/50 relative animate-pulse flex items-center justify-center"
                  >
                    <CircularProgress color="secondary" className="mx-auto" />
                  </div>
                ))
              : ''}
            {tableData.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-8 relative transform transition-all duration-300 hover:-translate-y-2 ${' hover:border-black-400/50'}`}
              >
                <div>
                  <h3 className="text-5xl text-black mb-2">{plan.title}</h3>
                  <h5 className="text-1xl text-[#000000B8] mb-4">{planInfos[idx].subTitle}</h5>

                  <div className="flex items-baseline mb-1">
                    <span className="text-8xl font-semibold text-black">R$ {plan.monthlyPrice}</span>
                    <span className="text-[#000000B8] ml-2 text-2xl"> Mês</span>
                  </div>

                  <Button
                    variant="contained"
                    color={planInfos[idx].popular ? 'secondary' : 'inherit'}
                    onClick={() => handleSelectPlan(plan.title)}
                    className="p-6 mt-8 w-full text-black rounded-full transition transform hover:scale-105 flex items-center justify-center"
                  >
                    COMEÇAR AGORA
                  </Button>

                  {idx === 0 && <hr className="border w-full border-gray-700 my-6" />}
                  {idx === 1 && (
                    <Box display={'flex'} alignItems={'center'}>
                      <span className="text-black w-full">Tudo do plano básico</span>
                      <hr className="border w-full border-gray-700 my-6" />
                    </Box>
                  )}
                  {idx === 2 && (
                    <Box display={'flex'} alignItems={'center'}>
                      <span className="text-black w-full">Tudo do plano intermediário</span>
                      <hr className="border w-2/4 border-gray-700 my-6" />
                    </Box>
                  )}
                  <ul className="space-y-4">
                    {planInfos[idx].features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start space-x-3">
                        <CheckOutlinedIcon sx={{ fontSize: '20px' }} className="text-yellow-400 flex-shrink-0 mt-1" />
                        <span className="text-[#000000B8]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API OFICIAL */}
      <section className="pt-20 pb-10 bg-gradient-to-b from-[#E9EDEF] via-[#F7F7F7] to-[#E9EDEF]">
        <div className="container mx-auto px-6">
          <Grid container spacing={2} className="mb-16">
            <Grid size={{ xs: 12 }} display={'flex'} flexDirection={'column'}>
              <Box display={'flex'} style={{ width: '100% ' }} justifyContent={'center'}>
                <div className="inline-flex items-center space-x-2 border-1 rounded-full px-4 py-2 mb-6">
                  <Box
                    sx={{
                      backgroundColor: 'secondary.main',
                      paddingX: '6px',
                      paddingY: '2px',
                      display: 'flex',
                      borderRadius: '1rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GppGoodIcon color="primary" />
                  </Box>
                  <Typography component={'span'} color="primary" className=" text-lg">
                    API Oficial
                  </Typography>
                </div>
              </Box>
              <Box>
                <Typography color="primary" className="text-5xl md:text-7xl mb-2 text-center">
                  O Alldo Óptico usa a API
                  <br /> oficial do WhatsApp
                </Typography>
                <Typography
                  color="primary"
                  component={'p'}
                  style={{ color: '#0000008F', fontSize: '16px' }}
                  variant="body2"
                  className=" mb-4 text-center"
                >
                  É tecnologia certificada para proteger dados, clientes e reputação.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ backgroundColor: '#FFF', borderRadius: '1rem' }}>
                <Box px={4} py={2} sx={{ position: 'relative ' }}>
                  <Box
                    sx={{
                      backgroundColor: 'secondary.main',
                      padding: '6px',
                      position: 'absolute',
                      top: '30px',
                      left: '50px',
                      borderRadius: '8px',
                    }}
                  >
                    <ThumbUpIcon color="primary" />
                  </Box>
                  <img src="/assets/images/optico/api-1.jpg" alt="Como funciona 2" className="rounded-2xl" />
                </Box>
                <Box px={4} py={2}>
                  <Typography color="primary" variant="h5" className=" mb-2 text-left">
                    API Oficial
                  </Typography>
                  <Typography
                    color="primary"
                    component={'p'}
                    style={{ color: '#0000008F', fontSize: '16px' }}
                    variant="body2"
                    className=" mb-4 text-left"
                  >
                    Segurança, estabilidade e conformidade para escalar seu atendimento sem riscos.
                  </Typography>
                </Box>
              </Box>
              <Box py={4} display={'flex'} gap={1}>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  gap={1}
                  sx={{ borderRight: '1px solid ', borderColor: '#0000008F' }}
                >
                  <CheckOutlinedIcon sx={{ fontSize: '20px' }} className="text-yellow-400 flex-shrink-0 mt-1" />
                  <span className="text-[#0000008F]">Integração estável com SLA de 99.9%</span>
                </Box>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  gap={1}
                  sx={{ borderRight: '1px solid ', borderColor: '#0000008F' }}
                >
                  <CheckOutlinedIcon sx={{ fontSize: '20px' }} className="text-yellow-400 flex-shrink-0 mt-1" />
                  <span className="text-[#0000008F]">Criptografia de ponta a ponta</span>
                </Box>
                <Box display={'flex'} alignItems={'center'} justifyContent={'center'} gap={1}>
                  <CheckOutlinedIcon sx={{ fontSize: '20px' }} className="text-yellow-400 flex-shrink-0 mt-1" />
                  <span className="text-[#0000008F]">100% seguro contra banimentos permanentes</span>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ backgroundColor: '#FFF', borderRadius: '1rem' }}>
                <Box px={4} py={2} sx={{ position: 'relative ' }}>
                  <Box
                    sx={{
                      backgroundColor: 'secondary.main',
                      padding: '6px',
                      position: 'absolute',
                      top: '30px',
                      left: '50px',
                      borderRadius: '8px',
                    }}
                  >
                    <ThumbDownAltIcon color="primary" />
                  </Box>
                  <img src="/assets/images/optico/api-2.jpg" alt="Como funciona 2" className="rounded-2xl" />
                </Box>
                <Box px={4} py={2}>
                  <Typography color="primary" variant="h5" className=" mb-2 text-left">
                    API não oficial
                  </Typography>
                  <Typography
                    color="primary"
                    component={'p'}
                    style={{ color: '#0000008F', fontSize: '16px' }}
                    variant="body2"
                    className=" mb-4 text-left"
                  >
                    Uma solução instável e arriscada, que pode comprometer sua operação, seus dados e sua reputação.
                  </Typography>
                </Box>
              </Box>
              <Box py={4} display={'flex'} gap={1}>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  gap={1}
                  sx={{ borderRight: '1px solid ', borderColor: '#0000008F' }}
                >
                  <CancelOutlinedIcon sx={{ fontSize: '20px' }} className="text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-[#0000008F]">Alto risco de banimento permanente</span>
                </Box>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  gap={1}
                  sx={{ borderRight: '1px solid ', borderColor: '#0000008F' }}
                >
                  <CancelOutlinedIcon sx={{ fontSize: '20px' }} className="text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-[#0000008F]">Dados não criptografados</span>
                </Box>
                <Box display={'flex'} alignItems={'center'} justifyContent={'center'} gap={1}>
                  <CancelOutlinedIcon sx={{ fontSize: '20px' }} className="text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-[#0000008F]">Interrupção completa do negócio</span>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </div>
      </section>

      {/* API Comparison Section */}
      <section className="pb-20 bg-gradient-to-b from-[#E9EDEF] via-[#F7F7F7] to-[#E9EDEF]">
        <div className="container mx-auto px-6">
          <Grid container spacing={4} alignItems="center" justifyContent={'space-between'} className="mb-16">
            <Grid size={{ xs: 12, md: 7 }}>
              <Box display={'flex'} justifyContent={'flex-start'} alignItems={'flex-start'} mb={3}>
                <div className="inline-flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2">
                  <Box
                    sx={{
                      backgroundColor: 'secondary.main',
                      paddingX: '6px',
                      paddingY: '2px',
                      display: 'flex',
                      borderRadius: '1rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayArrowIcon color="primary" />
                  </Box>
                  <Typography component={'span'} color="primary" className=" text-lg">
                    Garanta seu teste grátis
                  </Typography>
                </div>
              </Box>
              <Box>
                <Typography color="primary" component={'p'} className="text-5xl md:text-7xl mb-4 text-left">
                  Garanta seu
                  <br /> teste hoje mesmo
                </Typography>
              </Box>
              <Box sx={{ height: '100%' }} mt={4}>
                <img src="/assets/images/optico/woman-note.jpg" alt="CTA" className="rounded-2xl mt-4" />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box mb={4} pt={17}>
                <Box>
                  <Typography style={{ color: '#000000B8 ' }} component={'p'} className="text-2xl mb-4 text-left">
                    Preencha as informações e dê o primeiro passo para multiplicar as vendas da sua ótica
                  </Typography>
                </Box>
              </Box>
              <Box className="bg-white rounded-2xl p-8">
                <Typography color="primary" variant="h5" className="mb-6 text-center">
                  Preencha o formulário abaixo
                </Typography>

                <Box component="form" className="space-y-6" onSubmit={handleSubmit(onSubmitContactForm)}>
                  <Box>
                    <Typography color="primary" variant="body1" className="mb-1">
                      Nome da empresa
                    </Typography>
                    <Controller
                      name="companyName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="Insira o nome da empresa"
                          variant="outlined"
                          error={!!errors.companyName}
                          helperText={errors.companyName?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '4px',
                              '& fieldset': {
                                borderColor: '#E9EDEF',
                              },
                              '&:hover fieldset': {
                                borderColor: '#78A4D2',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#78A4D2',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <Typography color="primary" variant="body1" className="mb-1">
                      Nome do responsável
                    </Typography>
                    <Controller
                      name="responsibleName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="Insira o nome do responsável"
                          variant="outlined"
                          error={!!errors.responsibleName}
                          helperText={errors.responsibleName?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '4px',
                              '& fieldset': {
                                borderColor: '#E9EDEF',
                              },
                              '&:hover fieldset': {
                                borderColor: '#78A4D2',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#78A4D2',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <Typography color="primary" variant="body1" className="mb-1">
                      Telefone (Whatsapp)
                    </Typography>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          InputProps={{
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            inputComponent: IMaskInput as any,
                            inputProps: {
                              mask: ['(00) 0000-0000', '(00) 00000-0000'],
                              overwrite: true,
                            },
                          }}
                          fullWidth
                          placeholder="Insira o seu número de Whatsapp"
                          variant="outlined"
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '4px',
                              '& fieldset': {
                                borderColor: '#E9EDEF',
                              },
                              '&:hover fieldset': {
                                borderColor: '#78A4D2',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#78A4D2',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <Typography color="primary" variant="body1" className="mb-1">
                      E-mail
                    </Typography>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="email"
                          placeholder="Insira o seu e-mail"
                          variant="outlined"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '4px',
                              '& fieldset': {
                                borderColor: '#E9EDEF',
                              },
                              '&:hover fieldset': {
                                borderColor: '#78A4D2',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#78A4D2',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box className="pt-4">
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      size="large"
                      className="py-4 rounded-full font-bold text-lg"
                      type="submit"
                      disabled={!isValid || isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Enviar'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 border-t" style={{ backgroundColor: '#E9EDEF' }}>
        <div className="container mx-auto px-6">
          <Grid container spacing={4} className="mb-8">
            {/* Logo e Descrição */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="mb-6 border-r">
                <img src="/assets/images/optico/logo-full-optico.svg" alt="Alldo Óptico" style={{ height: '80px', marginBottom: '20px' }} />
                <Typography color="primary" className=" text-2xl text-gray-600 mb-6" style={{ lineHeight: '1.6' }}>
                  O Alldo Óptico é um CRM inteligente desenvolvido exclusivamente para o mercado óptico.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  className="p-6 mt-8 text-black rounded-full transition transform hover:scale-105 flex items-center justify-center"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${contact1Formatted}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o Alldo Óptico.')}`,
                      '_blank',
                    )
                  }
                >
                  {' '}
                  Falar com especialista
                </Button>
              </Box>
            </Grid>

            {/* Links de Navegação */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={4}>
                {/* Explorar */}
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="h6" color="primary" className="font-bold mb-4">
                    Explorar
                  </Typography>
                  <Box className="space-y-2">
                    <Typography
                      onClick={() => handlePosition('inicio')}
                      color="primary"
                      className="cursor-pointer hover:text-yellow-500 transition block"
                    >
                      Início
                    </Typography>
                    <Typography
                      onClick={() => handlePosition('solucoes')}
                      color="primary"
                      className="cursor-pointer hover:text-yellow-500 transition block"
                    >
                      Soluções
                    </Typography>
                    <Typography
                      onClick={() => handlePosition('recursos')}
                      color="primary"
                      className="cursor-pointer hover:text-yellow-500 transition block"
                    >
                      Recursos
                    </Typography>
                    <Typography
                      onClick={() => handlePosition('planos')}
                      color="primary"
                      className="cursor-pointer hover:text-yellow-500 transition block"
                    >
                      Planos
                    </Typography>
                  </Box>
                </Grid>

                {/* Suporte */}
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="h6" color="primary" className="font-bold mb-4">
                    Suporte
                  </Typography>
                  <Typography
                    color="primary"
                    className="cursor-pointer hover:text-yellow-500 transition"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${contact1Formatted}?text=${encodeURIComponent('Olá! Preciso de suporte com o Alldo Óptico.')}`,
                        '_blank',
                      )
                    }
                  >
                    Fale conosco
                  </Typography>
                </Grid>

                {/* Siga nas redes */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" color="primary" className="font-bold mb-4">
                    Siga nas redes
                  </Typography>
                  <Box className="flex space-x-3">
                    <Box
                      className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-500 transition"
                      onClick={() => window.open('https://instagram.com/alldotecnologia', '_blank')}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                          fill="black"
                        />
                      </svg>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Linha divisória */}
          <Box className="border-t border-gray-300 pt-6">
            <Grid container spacing={2} alignItems="center">
              {/* Copyright */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography className="text-gray-500 text-sm">© 2026 Alldo Óptico. Todos os direitos reservados.</Typography>
              </Grid>

              {/* Site Seguro & Política */}
              <Grid size={{ xs: 12, md: 4 }} className="text-center">
                <Box className="flex items-center justify-center space-x-4">
                  <Box className="flex items-center space-x-1 bg-gray-200 px-3 py-1 rounded-full">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.1 7 14 7.9 14 9S13.1 11 12 11 10 10.1 10 9 10.9 7 12 7ZM12 17C10.34 17 8.93 16.16 8.16 14.86C8.16 13.1 11.67 12.1 12 12.1S15.84 13.1 15.84 14.86C15.07 16.16 13.66 17 12 17Z"
                        fill="#666"
                      />
                    </svg>
                    <Typography className="text-gray-600 text-sm font-medium">Site 100% seguro</Typography>
                  </Box>
                  <Typography
                    className="text-gray-600 text-sm cursor-pointer hover:text-yellow-500 transition"
                    onClick={() => navigate('/terms-privacy')}
                  >
                    Política de privacidade
                  </Typography>
                </Box>
              </Grid>

              {/* Voltar ao topo & Design by */}
              <Grid size={{ xs: 12, md: 4 }} className="text-right">
                <Box className="flex items-center justify-end space-x-4">
                  <Typography className="text-gray-500 text-sm">
                    <strong>Design by: Eagles</strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </div>
      </footer>
      <ScrollToTopButton />
      <DefaultConfirmModal
        open={openModal}
        title={''}
        message={<TablePricingPage selectedPlanData={selectedPlanData} tableData={tableData} mode="OPTICO" />}
        cancelText="Cancelar"
        onCancel={() => setOpenModal(false)}
        confirmColor="primary"
        maxWidth="md"
        removeConfirm
        hideCancel
      />
    </div>
  );
}
