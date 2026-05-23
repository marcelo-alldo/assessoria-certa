import React, { useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Button,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MicIcon from '@mui/icons-material/Mic';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export default function Orcamento() {
  const cardRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(false);

  const handleGeneratePDF = async () => {
    if (!cardRef.current || !featuresRef.current) return;

    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Captura o card inteiro em alta resolução
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasToMm = pdfWidth / canvas.width;

      // Calcula o ponto de corte exato onde a seção de Funcionalidades começa
      const cardRect = cardRef.current.getBoundingClientRect();
      const featuresRect = featuresRef.current.getBoundingClientRect();
      const breakRatio = (featuresRect.top - cardRect.top) / cardRect.height;
      const breakPx = Math.floor(breakRatio * canvas.height);

      // Função para recortar uma fatia do canvas
      const sliceCanvas = (fromPx: number, toPx: number): string => {
        const sliceHeight = toPx - fromPx;
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width;
        tmp.height = sliceHeight;
        const ctx = tmp.getContext('2d')!;
        ctx.drawImage(canvas, 0, fromPx, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        return tmp.toDataURL('image/png');
      };

      // Página 1: do início até o começo de Funcionalidades
      const page1Img = sliceCanvas(0, breakPx);
      const page1HeightMm = breakPx * canvasToMm;
      pdf.addImage(page1Img, 'PNG', 0, 0, pdfWidth, page1HeightMm);

      // Página 2: de Funcionalidades até o final
      pdf.addPage();
      const page2Img = sliceCanvas(breakPx, canvas.height);
      const page2HeightMm = (canvas.height - breakPx) * canvasToMm;
      pdf.addImage(page2Img, 'PNG', 0, 0, pdfWidth, page2HeightMm);

      pdf.save('orcamento-alldo.pdf');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        {/* BOTÃO GERAR PDF - fora do card para não aparecer no PDF */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
            onClick={handleGeneratePDF}
            disabled={loading}
            sx={{
              backgroundColor: '#222',
              color: '#fff',
              fontWeight: 'bold',
              px: 3,
              py: 1.2,
              '&:hover': { backgroundColor: '#444' },
            }}
          >
            {loading ? 'Gerando...' : 'Baixar PDF'}
          </Button>
        </Box>

        <Card ref={cardRef} elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* HEADER */}
          <Box
            sx={{
              backgroundColor: '#FFD400',
              textAlign: 'center',
              py: 4,
            }}
          >
            <img
              src="/assets/images/logo/alldo-sem-fundo.png" // coloque sua logo na pasta public
              alt="Alldo Logo"
              style={{ maxWidth: 220 }}
            />
          </Box>

          {/* CONTENT */}
          <CardContent sx={{ p: 5, backgroundColor: '#fff' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Orçamento - Assinatura Customizada
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={3}>
              Prezado Neo Optical,
              <br />É com grande satisfação que apresentamos nossa proposta personalizada para automatizar, escalar e melhorar o processo dos seus
              representantes com o uso de inteligência artificial. Nossa solução é projetada para atender às necessidades específicas do seu negócio,
              proporcionando uma experiência de atendimento excepcional e impulsionando o crescimento da sua empresa.
            </Typography>

            {/* PREÇO */}
            <Box
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                textAlign: 'center',
                borderRadius: 3,
                py: 4,
                my: 4,
              }}
            >
              <Typography variant="h3" fontWeight="bold">
                R$ 699 / mês
              </Typography>
            </Box>

            {/* LISTA DE BENEFÍCIOS */}
            <List>
              {[
                'Até 5.000 Leads / Contatos ativos',
                'Fluxo de cadastro e atualização inteligente por voz',
                'Uso de Inteligência Artificial',
                'Até 20 Atendentes representantes',
                'Fluxos 100% personalizados',
                'Atendimento via WhatsApp API Oficial',
                'Funções avançadas e automações estratégicas',
                'Relatórios de desempenho e métricas',
                'Suporte técnico prioritário',
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#FFD400' }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                  {index !== 9 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {/* FUNCIONALIDADES PRINCIPAIS */}
            <Box ref={featuresRef} mt={5} mb={2}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Funcionalidades em Destaque
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Conheça os recursos exclusivos desenvolvidos para transformar a operação dos seus representantes e da sua equipe comercial.
              </Typography>

              <Grid container spacing={3}>
                {/* CARD 1 - CADASTRO POR ÁUDIO */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      border: '2px solid #FFD400',
                      borderRadius: 3,
                      p: 3,
                      height: '100%',
                      backgroundColor: '#fffdf0',
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2} gap={1}>
                      <MicIcon sx={{ color: '#FFD400', fontSize: 32 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Cadastro Inteligente por Voz
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Seus representantes não precisam parar o que estão fazendo para preencher formulários. Basta enviar uma mensagem de áudio pelo
                      pelo po WhatsApp e nossa Inteligência Artificial interpreta, estrutura e registra automaticamente todas as informações do do
                      ente — nome, contato, segmento e observações — em segundos, sem digitar uma única letra.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1.5}>
                      O resultado é agilidade em campo, redução de erros e dados sempre atualizados no sistema, independente de onde o representante
                      representante sa
                    </Typography>
                  </Box>
                </Grid>

                {/* CARD 2 - CRM PARA SDR */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      border: '2px solid #000',
                      borderRadius: 3,
                      p: 3,
                      height: '100%',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2} gap={1}>
                      <DashboardIcon sx={{ color: '#000', fontSize: 32 }} />
                      <Typography variant="h6" fontWeight="bold">
                        CRM Integrado para o SDR
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Dê ao seu time de pré-vendas uma visão completa da jornada de cada lead. Com o CRM integrado ao Alldo, o SDR acompanha em tempo
                      atatus de cada oportunidade — desde o primeiro contato até a qualificação final — com histórico de interaçõ tarefas e próximos
                      pas sos organizados em um único lugar.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1.5}>
                      Mais controle, menos oportunidades perdidas e um processo de vendas estruturado para escalar com previsibilidade.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* MENSAGEM */}
            <Box
              sx={{
                backgroundColor: '#fafafa',
                borderLeft: '6px solid #FFD400',
                p: 3,
                borderRadius: 2,
                mt: 4,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Mensagem Especial
              </Typography>
              <Typography variant="body2" paragraph>
                Ter você como parceiro é extremamente importante para nós. Acreditamos que grandes resultados são construídos com tecnologia,
                estratégia e relacionamento de confiança.
              </Typography>
              <Typography variant="body2" paragraph>
                Estamos comprometidos em entregar não apenas uma ferramenta, mas uma solução que realmente gere crescimento, organização e aumento de
                conversões para o seu negócio.
              </Typography>
              <Typography variant="body2">Conte conosco para evoluir seu atendimento e levar sua empresa para o próximo nível.</Typography>
            </Box>
          </CardContent>

          {/* FOOTER */}
          <Box
            sx={{
              backgroundColor: '#222',
              color: '#fff',
              textAlign: 'center',
              py: 3,
            }}
          >
            <Typography variant="body2">
              <strong>Alldo Tecnologia Ltda</strong>
            </Typography>
            <Typography variant="body2">CNPJ: 57.804.074/0001-06</Typography>
            <Typography variant="body2">marcelo@alldohost.com.br | (51) 98440-6522</Typography>
            <Typography variant="caption">© 2026 Alldo - Todos os direitos reservados</Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
