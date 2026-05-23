import {
  Autocomplete,
  Button,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DefaultTable from '@/components/DefaultTable';
import { useCallback, useEffect, useState } from 'react';
import { RecipientsType, useGetRecipientsQuery, useLazyGetRecipientsQuery } from '../../scheduledMessagesApi';
import { useFormContext } from 'react-hook-form';
import { phoneToRemoteJid } from '@/utils/remoteJidToPhone';
import { useParams } from 'react-router';
import SearchIcon from '@mui/icons-material/Search';
import { useGetTagsQuery } from '@/store/api/tagsApi';
import { useGetStepsQuery } from '../../../scrumboard/ScrumboardApi';

/**
 * The leads.
 */
interface TableLeadsProps {
  changeRecipients: (change: boolean) => void;
  page: number;
  setPage: (page: number) => void;
}

function TableLeads({ changeRecipients, page, setPage }: TableLeadsProps) {
  const monthOptions = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Marco' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const { uid } = useParams();
  const { setValue, getValues } = useFormContext();
  const [leads, setLeads] = useState<RecipientsType[]>([]);

  const [search, setSearch] = useState('');
  const [selectedStepUid, setSelectedStepUid] = useState('');
  const [selectedTagUids, setSelectedTagUids] = useState<string[]>([]);
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [birthdayWeek, setBirthdayWeek] = useState(false);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const [isUnselectingAll, setIsUnselectingAll] = useState(false);

  const { data: tagsResponse, isLoading: isLoadingTags } = useGetTagsQuery();
  const { data: stepsResponse, isLoading: isLoadingSteps } = useGetStepsQuery('leads=true', {
    refetchOnMountOrArgChange: true,
  });

  const selectedTags = (tagsResponse?.data || []).filter((tag) => selectedTagUids.includes(tag.uid));
  const [getRecipientsLazy] = useLazyGetRecipientsQuery();

  const buildRecipientsQuery = useCallback(
    (targetPage: number, targetPageSize: number, includeAll = false) => {
      const params = new URLSearchParams({
        leads: 'true',
        message: uid || '',
        page: String(targetPage),
        pageSize: String(targetPageSize),
      });

      if (includeAll) {
        params.set('all', 'true');
      }

      if (search.trim()) {
        params.set('search', search.trim());
      }

      if (selectedStepUid) {
        params.set('stepUid', selectedStepUid);
      }

      if (selectedTagUids.length > 0) {
        params.set('tags', selectedTagUids.join(','));
      }

      if (birthdayMonth) {
        params.set('birthdayMonth', birthdayMonth);
      }

      if (birthdayWeek) {
        params.set('birthdayWeek', 'true');
      }

      return params.toString();
    },
    [uid, search, selectedStepUid, selectedTagUids, birthdayMonth, birthdayWeek],
  );

  // Atualiza a query string para manter estado dos filtros na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const filterEntries = [
      ['search', search],
      ['stepUid', selectedStepUid],
      ['birthdayMonth', birthdayMonth],
      ['birthdayWeek', birthdayWeek ? 'true' : ''],
      ['tags', selectedTagUids.join(',')],
    ];

    filterEntries.forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [search, selectedStepUid, birthdayMonth, birthdayWeek, selectedTagUids]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedStepUid, selectedTagUids, birthdayMonth, birthdayWeek, setPage]);

  const { data, isLoading: isLoadingLeads } = useGetRecipientsQuery(buildRecipientsQuery(page, 10), {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchFilteredTotal() {
      if (!uid) {
        if (isMounted) {
          setFilteredTotal(0);
        }

        return;
      }

      let totalCount = 0;
      let targetPage = 1;
      const pageSize = 100;
      let totalPages = 1;

      do {
        const response = await getRecipientsLazy(buildRecipientsQuery(targetPage, pageSize, true)).unwrap();
        totalCount += response?.data?.length || 0;
        totalPages = response?.totalPages || 1;
        targetPage += 1;
      } while (targetPage <= totalPages);

      if (isMounted) {
        setFilteredTotal(totalCount);
      }
    }

    fetchFilteredTotal().catch(() => {
      if (isMounted) {
        setFilteredTotal(0);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [uid, buildRecipientsQuery, getRecipientsLazy]);

  async function handleSelectAllLeads() {
    if (!uid) return;

    setIsSelectingAll(true);

    try {
      const allLeads: RecipientsType[] = [];
      let targetPage = 1;
      const pageSize = 100;
      let totalPages = 1;

      do {
        const response = await getRecipientsLazy(buildRecipientsQuery(targetPage, pageSize, true)).unwrap();
        allLeads.push(...(response?.data || []));
        totalPages = response?.totalPages || 1;
        targetPage += 1;
      } while (targetPage <= totalPages);

      const currentSelectedRecipients = getValues('selectedsRecipients') || [];
      const currentNewRecipients = getValues('newRecipients') || [];
      const currentRemovedRecipients = getValues('removedRecipients') || [];

      const selectedByLeadUid = new Map<string, { remoteJid: string; name: string; leadUid: string }>();

      currentSelectedRecipients.forEach((recipient) => {
        if (recipient?.leadUid) {
          selectedByLeadUid.set(recipient.leadUid, recipient);
        }
      });

      allLeads.forEach((lead) => {
        selectedByLeadUid.set(lead.uid, {
          remoteJid: lead.phone ? phoneToRemoteJid(lead.phone) : lead.phone || '',
          name: lead.name || '',
          leadUid: lead.uid,
        });
      });

      const newRecipientsByLeadUid = new Map<string, { remoteJid: string; name: string; leadUid: string }>();

      currentNewRecipients.forEach((recipient) => {
        if (recipient?.leadUid) {
          newRecipientsByLeadUid.set(recipient.leadUid, recipient);
        }
      });

      allLeads.forEach((lead) => {
        const alreadyActive = lead?.scheduledMessageRecipients && lead.scheduledMessageRecipients.length > 0;

        if (!alreadyActive) {
          newRecipientsByLeadUid.set(lead.uid, {
            remoteJid: lead.phone ? phoneToRemoteJid(lead.phone) : lead.phone || '',
            name: lead.name || '',
            leadUid: lead.uid,
          });
        }
      });

      const selectedLeadUidSet = new Set(Array.from(selectedByLeadUid.keys()));
      const activeRecipientUids = allLeads.flatMap((lead) => lead?.scheduledMessageRecipients?.map((recipient) => recipient.uid) || []);

      setValue(
        'removedRecipients',
        currentRemovedRecipients.filter((recipientUid) => !activeRecipientUids.includes(recipientUid) && !selectedLeadUidSet.has(recipientUid)),
      );
      setValue('selectedsRecipients', Array.from(selectedByLeadUid.values()));
      setValue('newRecipients', Array.from(newRecipientsByLeadUid.values()));
      setValue('leadsRecipientsCount', selectedLeadUidSet.size);
      setValue('recipientsUpdate', true);

      setLeads((prev) =>
        prev.map((lead) => {
          const hasServerSelection = lead?.scheduledMessageRecipients && lead.scheduledMessageRecipients.length > 0;
          const hasSelected = selectedLeadUidSet.has(lead.uid);

          if (hasServerSelection || hasSelected) {
            return {
              ...lead,
              scheduledMessageRecipients: hasServerSelection ? lead.scheduledMessageRecipients : [{ uid: lead.uid }],
            };
          }

          return {
            ...lead,
            scheduledMessageRecipients: [],
          };
        }),
      );

      changeRecipients(true);
    } finally {
      setIsSelectingAll(false);
    }
  }

  async function handleUnselectAllLeads() {
    if (!uid) return;

    setIsUnselectingAll(true);

    try {
      const allLeads: RecipientsType[] = [];
      let targetPage = 1;
      const pageSize = 100;
      let totalPages = 1;

      do {
        const response = await getRecipientsLazy(buildRecipientsQuery(targetPage, pageSize, true)).unwrap();
        allLeads.push(...(response?.data || []));
        totalPages = response?.totalPages || 1;
        targetPage += 1;
      } while (targetPage <= totalPages);

      const filteredLeadUidSet = new Set(allLeads.map((lead) => lead.uid));
      const activeRecipientUids = allLeads.flatMap((lead) => lead?.scheduledMessageRecipients?.map((recipient) => recipient.uid) || []);

      const currentSelectedRecipients = getValues('selectedsRecipients') || [];
      const currentNewRecipients = getValues('newRecipients') || [];
      const currentRemovedRecipients = getValues('removedRecipients') || [];

      const updatedSelectedRecipients = currentSelectedRecipients.filter((recipient) => !filteredLeadUidSet.has(recipient?.leadUid));
      const updatedNewRecipients = currentNewRecipients.filter((recipient) => !filteredLeadUidSet.has(recipient?.leadUid));
      const updatedRemovedRecipients = Array.from(new Set([...currentRemovedRecipients, ...activeRecipientUids]));

      const remainingLeadUidSet = new Set<string>([
        ...updatedSelectedRecipients.map((recipient) => recipient?.leadUid).filter(Boolean),
        ...updatedNewRecipients.map((recipient) => recipient?.leadUid).filter(Boolean),
      ]);

      setValue('selectedsRecipients', updatedSelectedRecipients);
      setValue('newRecipients', updatedNewRecipients);
      setValue('removedRecipients', updatedRemovedRecipients);
      setValue('leadsRecipientsCount', remainingLeadUidSet.size);
      setValue('recipientsUpdate', true);

      setLeads((prev) =>
        prev.map((lead) =>
          filteredLeadUidSet.has(lead.uid)
            ? {
                ...lead,
                scheduledMessageRecipients: [],
              }
            : lead,
        ),
      );

      changeRecipients(true);
    } finally {
      setIsUnselectingAll(false);
    }
  }

  const getBirthDate = (row: RecipientsType) => row?.birthDate || null;

  const getBirthMonth = (birthDate: string | null) => {
    if (!birthDate) return null;

    const date = new Date(birthDate);

    if (Number.isNaN(date.getTime())) return null;

    return date.getMonth() + 1;
  };

  const isBirthdayThisWeek = (birthDate: string | null) => {
    if (!birthDate) return false;

    const parsedBirthDate = new Date(birthDate);

    if (Number.isNaN(parsedBirthDate.getTime())) {
      return false;
    }

    const today = new Date();
    const currentYearBirthday = new Date(today.getFullYear(), parsedBirthDate.getMonth(), parsedBirthDate.getDate());

    const monday = new Date(today);
    const dayOfWeek = monday.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    monday.setDate(today.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return currentYearBirthday >= monday && currentYearBirthday <= sunday;
  };

  // Sempre que data mudar, atualizar selectedsRecipients mantendo os antigos e adicionando novos ativos sem duplicar
  useEffect(() => {
    if (data?.data) {
      const currentSelectedRecipients = getValues('selectedsRecipients') || [];
      const currentNewRecipients = getValues('newRecipients') || [];
      const selectedLeadUidSet = new Set<string>([
        ...currentSelectedRecipients.map((recipient) => recipient?.leadUid).filter(Boolean),
        ...currentNewRecipients.map((recipient) => recipient?.leadUid).filter(Boolean),
      ]);

      const pageDataWithSelection = data.data.map((lead) => {
        const hasServerSelection = lead?.scheduledMessageRecipients && lead.scheduledMessageRecipients.length > 0;
        const hasSelected = selectedLeadUidSet.has(lead.uid);

        if (hasServerSelection || hasSelected) {
          return {
            ...lead,
            scheduledMessageRecipients: hasServerSelection ? lead.scheduledMessageRecipients : [{ uid: lead.uid }],
          };
        }

        return {
          ...lead,
          scheduledMessageRecipients: [],
        };
      });

      setLeads(pageDataWithSelection);

      if (data.data.length > 0) {
        // Obter selectedsRecipients atuais
        const currentSelectedRecipients = getValues('selectedsRecipients') || [];

        // Filtrar apenas leads que têm scheduledMessageRecipients preenchido (ativos)
        const activeLeads = data.data.filter((lead) => lead?.scheduledMessageRecipients && lead.scheduledMessageRecipients.length > 0);

        // Mapear para o formato esperado em selectedsRecipients
        const activeRecipientsToAdd = activeLeads.map((lead) => ({
          remoteJid: lead.phone ? phoneToRemoteJid(lead.phone) : lead.phone || '',
          name: lead.name || '',
          leadUid: lead.uid,
        }));

        // Filtrar novos recipients que ainda não estão em selectedsRecipients
        const newActiveRecipients = activeRecipientsToAdd.filter(
          (newRecipient) =>
            !currentSelectedRecipients.some((existing) => existing.leadUid === newRecipient.leadUid || existing.remoteJid === newRecipient.remoteJid),
        );

        // Combinar antigos com novos (se houver novos)
        if (newActiveRecipients.length > 0) {
          setValue('selectedsRecipients', [...currentSelectedRecipients, ...newActiveRecipients]);
        }
      }
    }
  }, [data, setValue, getValues, isLoadingLeads]);

  // Função para ativar/desativar
  function handleToggleEnableLead(uid: string) {
    const leadFind = leads.find((lead) => lead.uid === uid);

    if (!leadFind) return;

    // Verifica se o lead já está ativo (tem scheduledMessageRecipients)
    const isActive = leadFind.scheduledMessageRecipients && leadFind.scheduledMessageRecipients.length > 0;

    if (isActive) {
      // DESATIVAR: Remover da scheduledMessageRecipients e lidar com removedRecipients/newRecipients
      setLeads((prev) => prev.map((lead) => (lead.uid === uid ? { ...lead, scheduledMessageRecipients: [] } : lead)));

      // Obter valores atuais
      const currentNewRecipients = getValues('newRecipients') || [];
      const currentRemovedRecipients = getValues('removedRecipients') || [];

      // Remover de newRecipients se estiver lá
      const updatedNewRecipients = currentNewRecipients.filter((recipient) => recipient.leadUid !== uid);
      setValue('newRecipients', updatedNewRecipients);

      // Adicionar a removedRecipients se não estiver lá
      const recipientUid = leadFind.scheduledMessageRecipients?.[0]?.uid;

      if (recipientUid && recipientUid !== uid && !currentRemovedRecipients.includes(recipientUid)) {
        setValue('removedRecipients', [...currentRemovedRecipients, recipientUid]);
      }

      // Atualizar contador
      const currentCount = getValues('leadsRecipientsCount') || 0;
      setValue('leadsRecipientsCount', Math.max(0, currentCount - 1));
    } else {
      // ATIVAR: Adicionar scheduledMessageRecipients e lidar com newRecipients/removedRecipients
      setLeads((prev) => prev.map((lead) => (lead.uid === uid ? { ...lead, scheduledMessageRecipients: [{ uid }] } : lead)));

      // Obter valores atuais
      const currentNewRecipients = getValues('newRecipients') || [];
      const currentRemovedRecipients = getValues('removedRecipients') || [];

      // Remover de removedRecipients se estiver lá
      setValue(
        'removedRecipients',
        currentRemovedRecipients.filter((recipientUid) => recipientUid !== uid),
      );

      // Adicionar a newRecipients se não estiver lá
      const leadToAdd = {
        remoteJid: leadFind.phone ? phoneToRemoteJid(leadFind.phone) : leadFind.phone || '',
        name: leadFind.name || '',
        leadUid: leadFind.uid,
      };

      const alreadyInNew = currentNewRecipients.some((recipient) => recipient.leadUid === uid);

      if (!alreadyInNew) {
        setValue('newRecipients', [...currentNewRecipients, leadToAdd]);
      }

      // Atualizar contador
      const currentCount = getValues('leadsRecipientsCount') || 0;
      setValue('leadsRecipientsCount', currentCount + 1);
    }

    setValue('recipientsUpdate', true);
    changeRecipients(true);
  }

  const columns = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Nome',
      size: 450,
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'Telefone',
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'E-mail',
    },
    {
      id: 'alldo-service',
      accessorFn: (row) => {
        const stepUid = row.step?.uid;

        if (stepUid === import.meta.env.VITE_APP_START_CONVERSATION_UID) {
          return (
            <Box display="flex" justifyContent="space-between">
              <Chip
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/assets/images/logo/alldo-sem-fundo-face.png" alt="logo Alldo" width={20} style={{ display: 'block' }} />
                    <span>Em atendimento</span>
                  </div>
                }
                color="secondary"
                variant="filled"
                size="small"
              />
            </Box>
          );
        }

        return (
          <Box display="flex" justifyContent="space-between" width="70px">
            <Chip label="Não" color="default" variant="outlined" size="small" />
          </Box>
        );
      },
      header: 'Atendimento Alldo',
      size: 250,
    },
    {
      id: 'step',
      accessorKey: 'step.name',
      header: 'Etapa',
      size: 180,
      accessorFn: (row) => row?.step?.name || '-',
    },
    {
      id: 'tags',
      accessorKey: 'leadTags',
      header: 'Tags',
      size: 260,
      accessorFn: (row) => {
        if (!row?.leadTags || row.leadTags.length === 0) {
          return '-';
        }

        return (
          <Box display="flex" gap="8px" flexWrap="wrap">
            {row.leadTags.map((leadTag) => (
              <Chip
                key={leadTag.uid}
                label={leadTag.tag?.name}
                size="small"
                sx={{
                  backgroundColor: leadTag.tag?.color || '#e0e0e0',
                  color: '#fff',
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        );
      },
    },
    {
      id: 'birthdayMonth',
      accessorKey: 'birthDate',
      header: 'Aniversario Mes',
      size: 160,
      accessorFn: (row) => {
        const month = getBirthMonth(getBirthDate(row));
        return month ? String(month) : '-';
      },
    },
    {
      id: 'birthdayWeek',
      accessorKey: 'birthdayWeek',
      header: 'Aniversario na semana',
      size: 200,
      accessorFn: (row) => {
        const inCurrentWeek = isBirthdayThisWeek(getBirthDate(row));
        return inCurrentWeek ? 'Sim' : 'Nao';
      },
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: 'Adicionar/Remover',
      accessorFn: (row) => (
        <Box>
          {/* <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            onClick={() => navigate(`/leads/${row.uid}`, { state: { isView: true } })}
          >
            <Tooltip title="Visualizar">
              <VisibilityOutlinedIcon fontSize="medium" color="primary" />
            </Tooltip>
          </ButtonBase> */}
          <Tooltip title={row?.scheduledMessageRecipients && row.scheduledMessageRecipients.length > 0 ? 'Remover da lista' : 'Adicionar à lista'}>
            <Switch
              checked={row?.scheduledMessageRecipients && row.scheduledMessageRecipients.length > 0}
              color={row?.scheduledMessageRecipients && row.scheduledMessageRecipients.length > 0 ? 'success' : 'error'}
              onChange={() => handleToggleEnableLead(row?.uid)}
              inputProps={{ 'aria-label': row?.enable ? 'Remover' : 'Adicionar' }}
              size="small"
            />
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Paper className="w-full h-full flex flex-col p-2">
      <Typography variant="h6" className="p-4">
        Leads - {getValues('leadsRecipientsCount')} participando
      </Typography>
      <Box className="px-4 pb-3" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Total encontrado: {filteredTotal}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={handleUnselectAllLeads}
            disabled={isUnselectingAll || isSelectingAll || filteredTotal === 0}
          >
            {isUnselectingAll ? 'Desmarcando...' : 'Desmarcar todos'}
          </Button>
          <Button variant="outlined" size="small" onClick={handleSelectAllLeads} disabled={isSelectingAll || isUnselectingAll || filteredTotal === 0}>
            {isSelectingAll ? 'Selecionando...' : 'Selecionar todos'}
          </Button>
        </Box>
      </Box>
      <Box
        className="px-4 pb-4"
        sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <TextField
          label="Busca"
          placeholder="Buscar por nome"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" fullWidth>
          <InputLabel id="leads-step-filter-label">Etapa</InputLabel>
          <Select
            labelId="leads-step-filter-label"
            label="Etapa"
            value={selectedStepUid}
            onChange={(event) => setSelectedStepUid(event.target.value)}
            disabled={isLoadingSteps}
          >
            <MenuItem value="">Todas</MenuItem>
            {(stepsResponse?.data || []).map((step) => (
              <MenuItem key={step.uid} value={step.uid}>
                {step.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel id="leads-birthday-month-filter-label">Aniversário Mês</InputLabel>
          <Select
            labelId="leads-birthday-month-filter-label"
            label="Aniversário Mês"
            value={birthdayMonth}
            onChange={(event) => setBirthdayMonth(event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {monthOptions.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          multiple
          options={tagsResponse?.data || []}
          loading={isLoadingTags}
          disableCloseOnSelect
          value={selectedTags}
          onChange={(_, newValue) => setSelectedTagUids(newValue.map((tag) => tag.uid))}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.uid === value.uid}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              minHeight: 30,
              height: 'auto !important',
              py: 0.5,
              pr: '40px !important',
            },
            '& .MuiAutocomplete-tag': {
              maxWidth: 'calc(100% - 6px)',
              my: 0.25,
            },
            '& .MuiAutocomplete-endAdornment': {
              top: '50%',
              transform: 'translateY(-50%)',
            },
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip {...getTagProps({ index })} key={option.uid} size="small" label={option.name} />)
          }
          renderInput={(params) => <TextField {...params} label="Tags" placeholder={selectedTags.length ? '' : 'Selecione tags'} size="small" />}
        />

        <FormControlLabel
          control={<Switch checked={birthdayWeek} onChange={(_, checked) => setBirthdayWeek(checked)} />}
          label="Aniversário na semana"
          sx={{ whiteSpace: 'nowrap', ml: 0.5 }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          overflowX: 'auto',
          overflowY: 'hidden',
          height: '100%',
          backgroundColor: 'background.default',
        }}
      >
        {!isLoadingLeads && (
          <>
            <DefaultTable
              data={leads || []}
              columns={columns}
              page={page}
              totalPages={data?.totalPages || 0}
              onPageChange={(newPage) => setPage(newPage)}
              showGlobalFilter={false}
            />
          </>
        )}
      </Box>
    </Paper>
  );
}

export default TableLeads;
