import { useState, useEffect } from 'react';
// import { MessageCircle, Calendar, Users, Shield, Zap, CheckCircle, XCircle, Award, BarChart, Sparkles, Star } from 'lucide-react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import MapsUgcOutlinedIcon from '@mui/icons-material/MapsUgcOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router';
import { useGetSubscriptionsQuery } from '@/store/api/subscriptionApi';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import TablePricingPage from '@/components/checkout-subscriptions/TablePricingPage';
import { TableDataItemType } from '@/components/checkout-subscriptions/TablePricingTable';

export default function Preview() {
  const [activeTab, setActiveTab] = useState('anual');
  const [scrolled, setScrolled] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<{
    period: 'month' | 'year';
    title: string;
    price: string;
    priceYearly: string;
    uid: string;
  }>({ period: 'year', title: '', price: '', priceYearly: '', uid: '' });

  const navigate = useNavigate();

  const contact1Formatted = import.meta.env.VITE_APP_CONTACT_1 ? '55' + import.meta.env.VITE_APP_CONTACT_1.replace(/\D/g, '') : '';
  const contact2Formatted = import.meta.env.VITE_APP_CONTACT_2 ? '55' + import.meta.env.VITE_APP_CONTACT_2.replace(/\D/g, '') : '';

  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } = useGetSubscriptionsQuery('type=DEFAULT', {
    refetchOnMountOrArgChange: true,
  });

  const [tableData, setTableData] = useState<TableDataItemType[]>([
    {
      monthlyPrice: '-',
      yearlyPrice: '-',
      title: 'Atendimento',
      buttonTitle: 'Assinar',
      isPopular: false,
      features: {
        leadsContacts: 'até 1000',
        flows: '0',
        ai: 'Sem',
        attendants: 'até 5',
        whatsapp: 'WhatsApp API Oficial',
        functions: 'Padrões',
      },
    },
    {
      monthlyPrice: '-',
      yearlyPrice: '-',
      title: 'Padrão',
      buttonTitle: 'Assinar',
      isPopular: true,
      features: {
        leadsContacts: 'até 2.000',
        flows: '1',
        ai: 'Com',
        attendants: 'até 10',
        flowType: 'Fluxo padrão',
        calendar: 'Google Calendar',
        whatsapp: 'WhatsApp API Oficial',
        functions: 'Padrões',
      },
    },
    {
      monthlyPrice: '-',
      yearlyPrice: '-',
      title: 'Customizada',
      buttonTitle: 'Assinar',
      isPopular: false,
      features: {
        leadsContacts: 'até 5.000',
        flows: 'até 3',
        ai: 'Com',
        attendants: 'até 20',
        flowType: 'Fluxo personalizado',
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
          const subscription = subscriptionsData.data.find((sub) => sub?.name === item?.title);

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

  const features = [
    {
      icon: <MapsUgcOutlinedIcon sx={{ fontSize: 40 }} />,
      title: 'Chat Centralizado',
      description: 'Todos os atendimentos em uma única plataforma. Todos os colaboradores em um único lugar.',
    },
    {
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 40 }} />,
      title: 'Mensagens Agendadas',
      description: 'Programe campanhas, lembretes e follow-ups. Envie no momento perfeito para cada cliente.',
    },
    {
      icon: <GroupOutlinedIcon sx={{ fontSize: 40 }} />,
      title: 'Gestão Completa de Contatos',
      description: 'Segmentação avançada, tags personalizadas e histórico completo de interações em tempo real.',
    },
    {
      icon: <SmartToyOutlinedIcon sx={{ fontSize: 40 }} />,
      title: 'Respostas Automáticas',
      description: 'Chatbot inteligente com IA responde 24/7. Configure templates e aumente produtividade em 400%.',
    },
    {
      icon: <InsertChartOutlinedIcon sx={{ fontSize: 40 }} />,
      title: 'Analytics Avançado',
      description: 'Dashboard completo com métricas de conversão, tempo de resposta, ROI e performance da equipe.',
    },
    {
      icon: <GppGoodOutlinedIcon sx={{ fontSize: 40 }} />,
      title: 'Segurança Máxima',
      description: 'API Oficial WhatsApp com criptografia de ponta a ponta.',
    },
  ];

  const handleSelectPlan = (title: string) => {
    const selectedPlan = subscriptionsData?.data.find((sub) => sub.name === title);

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
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-md shadow-2xl' : 'bg-transparent'}`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/assets/images/logo/alldo-amarelo.png" alt="Alldo Logo" className="h-16 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/sign-in')} color="secondary" className="px-6 py-2 rounded-full font-bold transition">
                Entrar
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/sign-up')}
                color="secondary"
                className="px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition hidden md:block"
              >
                Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-400/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-2 mb-6">
              <VerifiedOutlinedIcon color="secondary" />
              <Typography component={'span'} color="secondary" className=" text-sm font-semibold">
                Integração Oficial WhatsApp Business API
              </Typography>
            </div>

            <Typography component={'p'} className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transforme Seu{' '}
              <Typography component={'span'} color="secondary" className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Atendimento
              </Typography>{' '}
              com IA
            </Typography>
            <Typography component={'p'} className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              CRM integrado oficialmente ao WhatsApp, automatize mensagens e potencialize suas vendas em até 300%
            </Typography>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/sign-up')}
                className="p-8 rounded-full font-bold text-lg hover:bg-yellow-300 transition transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
              >
                <RocketLaunchOutlinedIcon sx={{ fontSize: '24px' }} />
                Começar Agora - Grátis
              </Button>
              <Link
                style={{ all: 'unset' }}
                target="_blank"
                to={`https://wa.me/${contact1Formatted}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o Alldo Assistente.')}`}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  className="border-2 p-8 rounded-full font-bold text-lg hover:bg-yellow-400/10 transition"
                >
                  Agendar Demonstração
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { icon: <GroupOutlinedIcon sx={{ fontSize: '32px' }} />, value: '+5', label: 'Clientes Ativos' },
                { icon: <MapsUgcOutlinedIcon sx={{ fontSize: '32px' }} />, value: '+200K', label: 'Mensagens Enviadas' },
                { icon: <StarBorderOutlinedIcon sx={{ fontSize: '32px' }} />, value: '4.9/5', label: 'Avaliação' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-yellow-400 mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-3xl font-bold text-yellow-400">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Recursos que <span className="text-yellow-400">Impulsionam</span> Seu Negócio
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Tudo que você precisa para automatizar, gerenciar e crescer</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 hover:from-yellow-400/10 hover:to-yellow-400/5 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-400/20"
              >
                <div className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-400 transition">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Comparison Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Por que utilizar a API <span className="text-yellow-400">Oficial</span> do Whatsapp?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Tecnologia certificada para proteger dados, clientes e reputação.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* API Oficial */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl p-8 border-2 border-green-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <TaskAltOutlinedIcon sx={{ fontSize: 40 }} className="text-green-500" />
                    <h3 className="text-3xl font-bold text-green-500">API Oficial</h3>
                  </div>
                  <WorkspacePremiumOutlinedIcon sx={{ fontSize: '32px' }} className="text-green-500" />
                </div>

                <ul className="space-y-4">
                  {[
                    'Certificado oficial Meta Business Partner',
                    '100% seguro contra banimentos permanentes',
                    'Suporte técnico 24/7 do WhatsApp',
                    'Recursos premium e atualizações automáticas',
                    'Criptografia de ponta a ponta garantida',
                    'Conformidade total com LGPD',
                    'Proteção da reputação da sua marca',
                    'Continuidade do negócio sem interrupções',
                    'Integração estável com SLA de 99.9%',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckOutlinedIcon sx={{ fontSize: '20px' }} className="text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* API Ilegal */}
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-2xl p-8 border-2 border-red-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <CancelOutlinedIcon sx={{ fontSize: 40 }} className="text-red-500" />
                  <h3 className="text-3xl font-bold text-red-500">API Não Oficial</h3>
                </div>

                <ul className="space-y-4">
                  {[
                    'Alto risco de banimento permanente',
                    'Viola os termos de serviço do WhatsApp',
                    'Sem suporte técnico ou garantias',
                    'Instabilidade e quedas frequentes',
                    'Dados não criptografados e vulneráveis',
                    'Problemas legais e multas pesadas',
                    'Perda total de base de contatos',
                    'Interrupção completa do negócio',
                    'Danos irreparáveis à reputação',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CloseOutlinedIcon sx={{ fontSize: '20px' }} className="text-red-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <GppBadOutlinedIcon sx={{ fontSize: 48 }} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-red-500">⚠️ ATENÇÃO: Risco Real de Perder Tudo</h3>
            <p className="text-gray-300 text-lg">
              Empresas que usam APIs não oficiais perdem em média <strong className="text-yellow-400">R$ 150.000</strong> ao serem banidas. Não
              arrisque seu negócio! Use apenas a API Oficial certificada pelo WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha o Plano <span className="text-yellow-400">Ideal</span> Para Você
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">Planos flexíveis com a melhor tecnologia do mercado</p>

            <div className="inline-flex items-center bg-gray-800 rounded-full p-1 mb-12">
              <Button
                onClick={() => setActiveTab('mensal')}
                className={`px-8 py-5 rounded-full font-bold transition ${
                  activeTab === 'mensal' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Mensal
              </Button>
              <Button
                onClick={() => setActiveTab('anual')}
                className={`px-8 py-5 rounded-full font-bold transition ${
                  activeTab === 'anual' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Anual
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">-20%</span>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {isLoadingSubscriptions
              ? [1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border relative animate-pulse flex items-center justify-center"
                  >
                    <CircularProgress color="secondary" className="mx-auto" />
                  </div>
                ))
              : tableData.map((item, idx) => {
                  const displayPrice = activeTab === 'mensal' ? item.monthlyPrice : item.yearlyPrice !== '-' ? Number(item.yearlyPrice) / 12 : '-';

                  const savings =
                    activeTab === 'anual' && item.monthlyPrice !== '-' && item.yearlyPrice !== '-'
                      ? Number(item.monthlyPrice) * 12 - Number(item.yearlyPrice)
                      : null;

                  const featureList = item.features
                    ? (Object.entries(item.features) as [string, string][])
                        .filter(([, v]) => v)
                        .map(([k, v]) => {
                          if (k === 'leadsContacts') return `${v} Leads / Contatos ativos`;

                          if (k === 'flows') return `${v} Fluxo de atendimento`;

                          if (k === 'ai') return `${v} Inteligência Artificial`;

                          if (k === 'attendants') return `${v} Atendentes`;

                          if (k === 'whatsapp') return `Atendimento via ${v}`;

                          if (k === 'functions') return `Funções ${v}`;

                          return v;
                        })
                    : [];

                  return (
                    <div
                      key={idx}
                      className={`bg-gradient-to-br rounded-2xl p-8 border relative transform transition-all duration-300 hover:-translate-y-2 ${
                        item.isPopular
                          ? 'from-yellow-400/20 to-yellow-400/5 border-yellow-400 border-2 scale-105 shadow-2xl shadow-yellow-400/20'
                          : 'from-gray-800 to-gray-900 border-gray-700 hover:border-yellow-400/50'
                      }`}
                    >
                      {item.isPopular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold text-sm">MAIS VENDIDO</span>
                        </div>
                      )}

                      {savings !== null && savings > 0 && (
                        <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                          ECONOMIZE R$ {savings}
                        </div>
                      )}

                      <div className={item.isPopular ? 'mt-4' : ''}>
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <div className="flex items-baseline mb-1">
                          <span className="text-5xl font-bold text-yellow-400">R$ {displayPrice}</span>
                          <span className="text-gray-400 ml-2">/ mês</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                          R$ {activeTab === 'mensal' ? Number(item.monthlyPrice) * 12 : item.yearlyPrice} pago por ano
                        </p>

                        <div className="border-t border-gray-700 my-6"></div>

                        <ul className="space-y-4 mb-8">
                          {featureList.map((feature, fidx) => (
                            <li key={fidx} className="flex items-start space-x-3">
                              <CheckOutlinedIcon sx={{ fontSize: '20px' }} className="text-yellow-400 flex-shrink-0 mt-1" />
                              <span className="text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => handleSelectPlan(item.title)}
                          variant="contained"
                          color="secondary"
                          className="w-full py-5 rounded-full font-bold hover:bg-yellow-300 transition"
                        >
                          Começar Agora
                        </Button>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <Box className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-black/20 rounded-full px-6 py-2 mb-6">
              <WhatsAppIcon sx={{ fontSize: 20 }} className="text-black" />
              <span className="text-black font-bold">Meta Business Partner Oficial</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-black mb-6">Pronto Para Decolar?</h2>
            <p className="text-2xl text-black/80 mb-8 max-w-2xl mx-auto">Junte-se a +10.000 empresas que confiam na API Oficial do WhatsApp</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/sign-up')}
                className="bg-black text-yellow-400 px-12 p-8 rounded-full font-bold text-xl hover:bg-gray-900 transition transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-2"
              >
                <RocketLaunchOutlinedIcon sx={{ fontSize: 28 }} />
                <span>Começar Teste Gratuito</span>
              </Button>
              <Link
                style={{ all: 'unset' }}
                target="_blank"
                to={`https://wa.me/${contact1Formatted}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o Alldo Assistente.')}`}
              >
                <Button className="bg-white text-black px-12 py-8 rounded-full font-bold text-xl hover:bg-gray-100 transition transform hover:scale-105 shadow-2xl">
                  Falar com Especialista
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-black/70 text-sm">✓ Sem cartão de crédito &nbsp; ✓ Teste por 7 dias &nbsp; ✓ Suporte em português</p>
          </div>
        </div>
      </Box>

      {/* Footer */}
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
      <DefaultConfirmModal
        open={openModal}
        title={''}
        message={<TablePricingPage selectedPlanData={selectedPlanData} tableData={tableData} mode="DEFAULT" />}
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
