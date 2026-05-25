import { LinearProgress, styled, Box, Paper, Typography, Chip, useTheme, Avatar, Tooltip, Grid } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useParams, useNavigate } from 'react-router';
import { useGetScheduledMessageQuery, RecipientsType } from '../scheduledMessagesApi';
import ReportScheduledMessageHeader from './ReportScheduledMessageHeader';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WhatsAppPreview from '@/components/WhatsAppPreview';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.default,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

/**
 * The ReportScheduledMessage.
 */

function ReportScheduledMessage() {
  const { uid } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();

  const { data: messageResponse, isLoading: isLoadingMessage } = useGetScheduledMessageQuery(`uid=${uid}&recipients=true`, {
    refetchOnMountOrArgChange: true,
    skip: uid === 'new',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const msg = (messageResponse as Record<string, any>)?.data?.[0];

  const recipients: RecipientsType[] = msg?.recipients || [];

  const totalRecipients = recipients.length;
  const totalSent = recipients.filter((r) => r.status === 'SENT').length;
  const totalFailed = recipients.filter((r) => r.status === 'FAILED').length;
  const totalPending = recipients.filter((r) => r.status === 'PENDING').length;

  const statusColor = {
    SENT: theme.palette.success.main,
    FAILED: theme.palette.error.main,
    PENDING: theme.palette.warning.main,
  };

  const statusLabel = {
    SENT: 'Enviado',
    FAILED: 'Falhou',
    PENDING: 'Pendente',
  };

  const statCards = [
    {
      label: 'Total de destinatários',
      value: totalRecipients,
      color: theme.palette.primary.main,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
    },
    {
      label: 'Enviados',
      value: totalSent,
      color: theme.palette.success.main,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      ),
    },
    {
      label: 'Falharam',
      value: totalFailed,
      color: theme.palette.error.main,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
        </svg>
      ),
    },
    {
      label: 'Pendentes',
      value: totalPending,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
    },
  ];

  return (
    <Root
      scroll="content"
      header={
        <>
          {isLoadingMessage && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress color="secondary" />
            </Box>
          )}
          {!isLoadingMessage && <ReportScheduledMessageHeader title={msg?.title || 'Relatório de Mensagem Agendada'} />}
        </>
      }
      content={
        <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', backgroundColor: 'background.default' }}>
          {!isLoadingMessage && msg && (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Cards de resumo */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
                {statCards.map((card) => (
                  <Paper
                    key={card.label}
                    sx={{
                      p: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      borderRadius: 3,
                      boxShadow: 2,
                    }}
                  >
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                    <Typography variant="h3" fontWeight={700} sx={{ color: card.color, lineHeight: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {card.label}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                  {/* Detalhes do disparo */}
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={2}>
                      Detalhes do disparo
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: 3 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Título
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {msg.title}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Data de envio
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {msg.sendAt ? format(new Date(msg.sendAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Box mt={0.5}>
                            <Chip
                              size="small"
                              label={statusLabel[msg.status as keyof typeof statusLabel] || msg.status}
                              sx={{
                                backgroundColor: `${statusColor[msg.status as keyof typeof statusColor]}20`,
                                color: statusColor[msg.status as keyof typeof statusColor],
                                fontWeight: 600,
                                fontSize: 11,
                              }}
                            />
                          </Box>
                        </Box>
                        {msg.messageTemplate?.name && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Template
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {msg.messageTemplate.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <Box>
                    <WhatsAppPreview message={msg.message} image={msg.messageTemplate?.imageUrl || null} />
                  </Box>
                </Grid>
              </Grid>

              {/* Lista de destinatários */}
              <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Destinatários ({totalRecipients})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {totalSent > 0 && (
                      <Chip
                        size="small"
                        label={`${totalSent} enviados`}
                        sx={{ backgroundColor: `${theme.palette.success.main}20`, color: theme.palette.success.main, fontWeight: 600, fontSize: 11 }}
                      />
                    )}
                    {totalFailed > 0 && (
                      <Chip
                        size="small"
                        label={`${totalFailed} falharam`}
                        sx={{ backgroundColor: `${theme.palette.error.main}20`, color: theme.palette.error.main, fontWeight: 600, fontSize: 11 }}
                      />
                    )}
                    {totalPending > 0 && (
                      <Chip
                        size="small"
                        label={`${totalPending} pendentes`}
                        sx={{ backgroundColor: `${theme.palette.warning.main}20`, color: theme.palette.warning.main, fontWeight: 600, fontSize: 11 }}
                      />
                    )}
                  </Box>
                </Box>

                <Box>
                  {recipients.map((recipient, index) => {
                    const color = statusColor[recipient.status as keyof typeof statusColor] || theme.palette.grey[500];
                    const label = statusLabel[recipient.status as keyof typeof statusLabel] || recipient.status;
                    const phone = recipient.remoteJid?.replace('@s.whatsapp.net', '').replace('@c.us', '') || '-';
                    const isLead = !!recipient.leadUid;
                    const isClient = !!recipient.clientUid;
                    const typeLabel = isLead ? 'Eleitor' : isClient ? 'Apoiador' : 'Número';
                    const recipientName = recipient.name;

                    const navigateTo = isClient
                      ? () => navigate(`/clients/${recipient.clientUid}`, { state: { isView: true } })
                      : isLead
                        ? () => navigate(`/leads/${recipient.leadUid}`, { state: { isView: true } })
                        : undefined;

                    return (
                      <Box
                        key={recipient.uid}
                        onClick={navigateTo}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          px: 3,
                          py: 1.5,
                          borderBottom: index < recipients.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                          cursor: navigateTo ? 'pointer' : 'default',
                          '&:hover': { backgroundColor: navigateTo ? 'action.selected' : 'action.hover' },
                          transition: 'background 0.15s',
                        }}
                      >
                        <Avatar sx={{ width: 36, height: 36, fontSize: 14, backgroundColor: `${color}20`, color }}>
                          {recipientName?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {recipientName || '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {phone}
                          </Typography>
                        </Box>
                        <Tooltip title={typeLabel}>
                          <Chip
                            size="small"
                            label={typeLabel}
                            sx={{ fontSize: 10, height: 20, backgroundColor: 'action.selected', color: 'text.secondary' }}
                          />
                        </Tooltip>
                        <Chip
                          size="small"
                          label={label}
                          sx={{
                            backgroundColor: `${color}20`,
                            color,
                            fontWeight: 600,
                            fontSize: 11,
                            minWidth: 72,
                          }}
                        />
                        {navigateTo && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.4, flexShrink: 0 }}>
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                          </svg>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      }
    />
  );
}

export default ReportScheduledMessage;
