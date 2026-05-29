import { useState, useEffect } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUp';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import AutoModeOutlinedIcon from '@mui/icons-material/AutoModeOutlined';
import { Box, Button, Chip, Container, Divider, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router';

export default function Preview() {
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();

  const contact1Formatted = import.meta.env.VITE_APP_CONTACT_1 ? '55' + import.meta.env.VITE_APP_CONTACT_1.replace(/\D/g, '') : '';

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
      icon: <SmartToyOutlinedIcon sx={{ fontSize: 44, color: '#6AABFF' }} />,
      title: 'Atendimento Automatizado Inteligente',
      description: 'Responde eleitores em tempo real, garantindo agilidade e padronização na comunicação. Disponível 24 horas, 7 dias por semana.',
    },
    {
      icon: <LocationOnOutlinedIcon sx={{ fontSize: 44, color: '#6AABFF' }} />,
      title: 'Distribuição Estratégica por Região',
      description: 'Encaminhamento automático para assessores humanos conforme a região (COREDE), otimizando o tempo da equipe.',
    },
    {
      icon: <PeopleAltOutlinedIcon sx={{ fontSize: 44, color: '#6AABFF' }} />,
      title: 'Pré-Campanha Estruturada',
      description: 'Apresentações institucionais, fortalecimento do relacionamento e preparação da base de eleitores antes do período oficial.',
    },
    {
      icon: <ImageOutlinedIcon sx={{ fontSize: 44, color: '#6AABFF' }} />,
      title: 'Engajamento com Criação de Conteúdo',
      description: 'O eleitor gera avatares personalizados e cria imagens prontas para redes sociais com a identidade visual da campanha.',
    },
    {
      icon: <SendOutlinedIcon sx={{ fontSize: 44, color: '#6AABFF' }} />,
      title: 'Automação de Materiais de Campanha',
      description: 'Gera santinhos digitais automaticamente, envia materiais personalizados e facilita o compartilhamento orgânico da campanha.',
    },
    {
      icon: <VerifiedOutlinedIcon sx={{ fontSize: 44, color: '#6AABFF' }} />,
      title: 'Integração com WhatsApp Oficial (API)',
      description: 'Comunicação segura, escalável e dentro das diretrizes da plataforma, garantindo maior taxa de entrega e confiabilidade.',
    },
  ];

  const benefits = [
    { icon: <TrendingUpOutlinedIcon />, text: 'Escala no atendimento sem aumentar equipe' },
    { icon: <AutoModeOutlinedIcon />, text: 'Resposta imediata para todos os eleitores' },
    { icon: <GroupOutlinedIcon />, text: 'Organização e inteligência na distribuição de leads' },
    { icon: <RocketLaunchOutlinedIcon />, text: 'Fortalecimento da presença digital' },
    { icon: <HubOutlinedIcon />, text: 'Aumento do engajamento e alcance da campanha' },
    { icon: <SavingsOutlinedIcon />, text: 'Redução de custos operacionais' },
  ];

  const steps = [
    {
      number: '01',
      title: 'Origem dos contatos',
      description:
        'O sistema cadastra o contato de forma automática, salvando a origem, podendo ser: redes sociais, site oficial, eventos ou outras fontes, garantindo uma base de dados organizada.',
    },
    {
      number: '02',
      title: 'Qualificação e Distribuição',
      description:
        'O assistente qualifica o contato automaticamente e direciona o eleitor para o assessor humano certo, com base na região (COREDE).',
    },
    {
      number: '03',
      title: 'Histórico e Acompanhamento',
      description: 'Mantém histórico completo das interações, garantindo continuidade no atendimento e inteligência estratégica para a campanha.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 1300,
          transition: 'all 0.3s',
          bgcolor: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          boxShadow: scrolled ? 2 : 'none',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" py={1.5}>
            <img src="/assets/images/logo/assessoria-certa.png" alt="Assessoria Certa" style={{ height: 80 }} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button onClick={() => navigate('/sign-in')} color="primary" sx={{ fontWeight: 700, borderRadius: 99 }}>
                Entrar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/sign-up')}
                sx={{ fontWeight: 700, borderRadius: 99, px: 3, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Quero Saber Mais
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 10, md: 14 },
          background: 'linear-gradient(160deg, #F4F7FE 0%, #e8eeff 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'secondary.light',
            opacity: 0.18,
            filter: 'blur(60px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            opacity: 0.12,
            filter: 'blur(50px)',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Chip
            icon={<WhatsAppIcon sx={{ color: '#25D366 !important' }} />}
            label="WhatsApp Business API Oficial"
            variant="outlined"
            sx={{ mb: 3, fontWeight: 700, fontSize: 14, borderColor: 'secondary.dark', color: 'primary.main' }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.4rem', md: '3.6rem' },
              fontWeight: 900,
              lineHeight: 1.15,
              mb: 2,
              color: 'primary.main',
            }}
          >
            Assistente Inteligente de{' '}
            <Box component="span" sx={{ color: 'primary.main', position: 'relative' }}>
              Campanha Política
            </Box>{' '}
            via WhatsApp
          </Typography>

          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 5, maxWidth: 680, mx: 'auto', fontWeight: 400, lineHeight: 1.7 }}>
            A solução baseada em inteligência artificial que transforma a comunicação entre candidatos e eleitores — seu verdadeiro{' '}
            <strong>assessor digital</strong> e chefe de gabinete automatizado.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mb={7} gap={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<RocketLaunchOutlinedIcon />}
              onClick={() => navigate('/sign-up')}
              sx={{ borderRadius: 99, px: 5, py: 1.8, fontWeight: 800, fontSize: 16 }}
            >
              Quero Começar Agora
            </Button>
            <Link
              style={{ all: 'unset' }}
              target="_blank"
              to={`https://wa.me/${contact1Formatted}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o Assistente de Campanha.')}`}
            >
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<WhatsAppIcon />}
                sx={{ borderRadius: 99, px: 5, py: 1.8, fontWeight: 800, fontSize: 16, borderWidth: 2 }}
              >
                Agendar Demonstração
              </Button>
            </Link>
          </Stack>

          <Grid container spacing={3} justifyContent="center" maxWidth={560} mx="auto">
            {[
              { value: '24/7', label: 'Atendimento Ininterrupto' },
              { value: '100%', label: 'API Oficial WhatsApp' },
              { value: 'IA', label: 'Inteligência Artificial' },
            ].map((stat) => (
              <Grid size={{ xs: 4 }} key={stat.label}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.04)', textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight={900} color="primary.main">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Como Funciona Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="overline" color="primary.main" fontWeight={800} fontSize={13} letterSpacing={2}>
              COMO FUNCIONA
            </Typography>
            <Typography variant="h3" fontWeight={900} color="primary.main" mt={1} mb={2}>
              Simples, Inteligente e Estratégico
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={560} mx="auto" fontSize={17}>
              Da captação do primeiro contato à gestão completa do relacionamento eleitoral — tudo automatizado.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {steps.map((step) => (
              <Grid size={{ xs: 12, md: 4 }} key={step.number}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    height: '100%',
                    border: '2px solid',
                    borderColor: 'divider',
                    transition: 'all 0.25s',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 4 },
                  }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 900, color: 'primary.main', opacity: 0.6, lineHeight: 1, mb: 2, fontSize: '3.5rem' }}>
                    {step.number}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="primary.main" mb={1.5}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                    {step.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Flow tags */}
          <Box mt={6} display="flex" flexWrap="wrap" gap={1.5} justifyContent="center">
            {['Qualifica o contato automaticamente', 'Direciona para assessor humano', 'Organiza por COREDEs', 'Mantém histórico completo'].map(
              (tag) => (
                <Chip
                  key={tag}
                  icon={<CheckCircleOutlineIcon sx={{ color: 'primary.main !important' }} />}
                  label={tag}
                  sx={{ fontWeight: 700, bgcolor: 'rgba(25,114,255,0.08)', border: '1px solid', borderColor: 'primary.light' }}
                />
              ),
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'secondary.main' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="overline" sx={{ color: 'primary.light' }} fontWeight={800} fontSize={13} letterSpacing={2}>
              FUNCIONALIDADES
            </Typography>
            <Typography variant="h3" fontWeight={900} color="white" mt={1} mb={2}>
              Tudo que Sua Campanha Precisa
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }} maxWidth={560} mx="auto" fontSize={17}>
              Seis pilares que transformam o relacionamento com eleitores em resultados eleitorais reais.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, idx) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.25s',
                    '&:hover': { bgcolor: 'rgba(25,114,255,0.15)', borderColor: 'primary.light', transform: 'translateY(-4px)' },
                  }}
                >
                  <Box mb={2}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={800} color="white" mb={1.5}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefícios Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="overline" color="primary.main" fontWeight={800} fontSize={13} letterSpacing={2}>
                BENEFÍCIOS
              </Typography>
              <Typography variant="h3" fontWeight={900} color="primary.main" mt={1} mb={2}>
                O que o Candidato Ganha
              </Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.9} mb={4}>
                Ao adotar o Assistente Inteligente de Campanha, o candidato passa a contar com uma estrutura digital de alta performance — sem
                precisar aumentar equipe ou custos operacionais.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<WhatsAppIcon />}
                onClick={() => {
                  window.open(
                    `https://wa.me/${contact1Formatted}?text=${encodeURIComponent('Olá! Quero saber mais sobre o Assistente de Campanha.')}`,
                    '_blank',
                  );
                }}
                sx={{ borderRadius: 99, px: 4, py: 1.6, fontWeight: 800 }}
              >
                Falar com Especialista
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2}>
                {benefits.map((benefit, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          '& svg': { fontSize: 22, color: '#fff' },
                        }}
                      >
                        {benefit.icon}
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {benefit.text}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Diferencial Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'secondary.main' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Texto principal */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="overline" sx={{ color: 'primary.light' }} fontWeight={800} fontSize={13} letterSpacing={2}>
                DIFERENCIAL ESTRATÉGICO
              </Typography>
              <Typography variant="h3" fontWeight={900} color="white" mt={1} mb={3} lineHeight={1.2}>
                Uma central de inteligência eleitoral — ativa 24h
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.9 }}>
                Enquanto a equipe dorme, o Assistente está captando, qualificando e nutrindo eleitores. Ele não apenas responde perguntas — ele
                executa a estratégia da campanha de forma autônoma, inteligente e escalável.
              </Typography>
            </Grid>

            {/* 3 pilares */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                {[
                  {
                    number: '01',
                    title: 'Inteligência Política Aplicada',
                    description:
                      'Entende o contexto eleitoral, identifica o perfil de cada eleitor e adapta a comunicação em tempo real — com precisão e consistência de mensagem.',
                  },
                  {
                    number: '02',
                    title: 'Relacionamento em Escala Real',
                    description:
                      'Atende simultaneamente centenas de eleitores com a mesma qualidade de um assessor dedicado, sem filas, sem espera e sem custo adicional de equipe.',
                  },
                  {
                    number: '03',
                    title: 'Estratégia que se Executa Sozinha',
                    description:
                      'Desde a abordagem inicial até o envio de materiais de campanha personalizados — cada etapa da jornada eleitoral é conduzida de forma autônoma.',
                  },
                ].map((pillar) => (
                  <Box
                    key={pillar.number}
                    sx={{
                      display: 'flex',
                      gap: 3,
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.25s',
                      '&:hover': { bgcolor: 'rgba(25,114,255,0.12)', borderColor: 'primary.light' },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: '2rem',
                        lineHeight: 1,
                        color: 'primary.light',
                        opacity: 0.8,
                        flexShrink: 0,
                        width: 48,
                      }}
                    >
                      {pillar.number}
                    </Typography>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800} color="white" mb={0.5}>
                        {pillar.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                        {pillar.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'primary.main', position: 'relative', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 350,
            height: 350,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.08)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.06)',
            filter: 'blur(40px)',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(0,0,0,0.1)',
              borderRadius: 99,
              px: 3,
              py: 1,
              mb: 3,
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 20 }} />
            <Typography fontWeight={700} fontSize={14}>
              WhatsApp Business API Oficial
            </Typography>
          </Box>

          <Typography variant="h2" fontWeight={900} color="white" mb={2} sx={{ fontSize: { xs: '2.2rem', md: '3rem' } }}>
            Pronto para Transformar sua Campanha?
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 5, fontWeight: 400, maxWidth: 580, mx: 'auto' }}>
            Comece agora e tenha o seu assessor digital trabalhando por você 24 horas por dia.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" gap={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RocketLaunchOutlinedIcon />}
              onClick={() => navigate('/sign-up')}
              sx={{
                borderRadius: 99,
                px: 5,
                py: 1.8,
                fontWeight: 800,
                fontSize: 16,
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
            >
              Quero Começar Agora
            </Button>
            <Link
              style={{ all: 'unset' }}
              target="_blank"
              to={`https://wa.me/${contact1Formatted}?text=${encodeURIComponent('Olá! Gostaria de agendar uma demonstração do Assistente de Campanha.')}`}
            >
              <Button
                variant="outlined"
                size="large"
                startIcon={<WhatsAppIcon />}
                sx={{
                  borderRadius: 99,
                  px: 5,
                  py: 1.8,
                  fontWeight: 800,
                  fontSize: 16,
                  borderWidth: 2,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Agendar Demonstração
              </Button>
            </Link>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'secondary.main', py: 6 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={3}>
            <Box textAlign={{ xs: 'center', md: 'left' }}>
              <img src="/assets/images/logo/assessoria-certa.png" alt="Assessoria Certa" style={{ height: 48, filter: 'brightness(0) invert(1)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5 }}>
                Assistente Inteligente de Campanha Política
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: 'white', borderRadius: 2, px: 2, py: 1 }}>
              <img src="/assets/images/logo/meta.png" alt="Meta" style={{ height: 40 }} />
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              © {new Date().getFullYear()} Assessoria Certa. Todos os direitos reservados.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => navigate('/terms-privacy')}
                size="small"
                sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}
              >
                Termos de uso
              </Button>
              <Button
                onClick={() => navigate('/terms-privacy')}
                size="small"
                sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}
              >
                Privacidade
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <ScrollToTopButton />
    </Box>
  );
}
