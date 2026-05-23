import {
  Autocomplete,
  Button,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import DefaultTable from '@/components/DefaultTable';
import { useCallback, useEffect, useState } from 'react';
import { RecipientsType, useGetRecipientsQuery, useLazyGetRecipientsQuery } from '../../scheduledMessagesApi';
import { useFormContext } from 'react-hook-form';
import { phoneToRemoteJid } from '@/utils/remoteJidToPhone';
import { useParams } from 'react-router';
import { useGetTagsQuery } from '@/store/api/tagsApi';
import { useGetStepsQuery } from '../../../scrumboard/ScrumboardApi';

/**
 * The Clients.
 */

interface TableClientsProps {
  changeRecipients: (change: boolean) => void;
  page: number;
  setPage: (page: number) => void;
}

function TableClients({ changeRecipients, page, setPage }: TableClientsProps) {
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
  const [clients, setClients] = useState<RecipientsType[]>([]);

  const [search, setSearch] = useState('');
  const [selectedStepUid, setSelectedStepUid] = useState('');
  const [selectedTagUids, setSelectedTagUids] = useState<string[]>([]);
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [birthdayWeek, setBirthdayWeek] = useState(false);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const [isUnselectingAll, setIsUnselectingAll] = useState(false);

  const { data: tagsResponse, isLoading: isLoadingTags } = useGetTagsQuery();
  const { data: stepsResponse, isLoading: isLoadingSteps } = useGetStepsQuery('clients=true', {
    refetchOnMountOrArgChange: true,
  });

  const selectedTags = (tagsResponse?.data || []).filter((tag) => selectedTagUids.includes(tag.uid));
  const [getRecipientsLazy] = useLazyGetRecipientsQuery();

  const buildRecipientsQuery = useCallback(
    (targetPage: number, targetPageSize: number, includeAll = false) => {
      const params = new URLSearchParams({
        clients: 'true',
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

  // Usa filtros na query da API
  const { data, isLoading: isLoadingClients } = useGetRecipientsQuery(buildRecipientsQuery(page, 10), {
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

  async function handleSelectAllClients() {
    if (!uid) return;

    setIsSelectingAll(true);

    try {
      const allClients: RecipientsType[] = [];
      let targetPage = 1;
      const pageSize = 100;
      let totalPages = 1;

      do {
        const response = await getRecipientsLazy(buildRecipientsQuery(targetPage, pageSize, true)).unwrap();
        allClients.push(...(response?.data || []));
        totalPages = response?.totalPages || 1;
        targetPage += 1;
      } while (targetPage <= totalPages);

      const currentSelectedRecipients = getValues('selectedsRecipients') || [];
      const currentNewRecipients = getValues('newRecipients') || [];
      const currentRemovedRecipients = getValues('removedRecipients') || [];

      const selectedByClientUid = new Map<string, { remoteJid: string; name: string; clientUid: string }>();

      currentSelectedRecipients.forEach((recipient) => {
        if (recipient?.clientUid) {
          selectedByClientUid.set(recipient.clientUid, recipient);
        }
      });

      allClients.forEach((client) => {
        selectedByClientUid.set(client.uid, {
          remoteJid: client.clientProfile.phone ? phoneToRemoteJid(client.clientProfile.phone) : client.clientProfile.phone || '',
          name: client.clientProfile.name || '',
          clientUid: client.uid,
        });
      });

      const newRecipientsByClientUid = new Map<string, { remoteJid: string; name: string; clientUid: string }>();

      currentNewRecipients.forEach((recipient) => {
        if (recipient?.clientUid) {
          newRecipientsByClientUid.set(recipient.clientUid, recipient);
        }
      });

      allClients.forEach((client) => {
        const alreadyActive = client?.scheduledMessageRecipients && client.scheduledMessageRecipients.length > 0;

        if (!alreadyActive) {
          newRecipientsByClientUid.set(client.uid, {
            remoteJid: client.clientProfile.phone ? phoneToRemoteJid(client.clientProfile.phone) : client.clientProfile.phone || '',
            name: client.clientProfile.name || '',
            clientUid: client.uid,
          });
        }
      });

      const selectedClientUidSet = new Set(Array.from(selectedByClientUid.keys()));
      const activeRecipientUids = allClients.flatMap((client) => client?.scheduledMessageRecipients?.map((recipient) => recipient.uid) || []);

      setValue(
        'removedRecipients',
        currentRemovedRecipients.filter((recipientUid) => !activeRecipientUids.includes(recipientUid) && !selectedClientUidSet.has(recipientUid)),
      );
      setValue('selectedsRecipients', Array.from(selectedByClientUid.values()));
      setValue('newRecipients', Array.from(newRecipientsByClientUid.values()));
      setValue('clientsRecipientsCount', selectedByClientUid.size);
      setValue('recipientsUpdate', true);

      setClients((prev) =>
        prev.map((client) => {
          const hasServerSelection = client?.scheduledMessageRecipients && client.scheduledMessageRecipients.length > 0;
          const hasSelected = selectedClientUidSet.has(client.uid);

          if (hasServerSelection || hasSelected) {
            return {
              ...client,
              scheduledMessageRecipients: hasServerSelection ? client.scheduledMessageRecipients : [{ uid: client.uid }],
            };
          }

          return {
            ...client,
            scheduledMessageRecipients: [],
          };
        }),
      );

      changeRecipients(true);
    } finally {
      setIsSelectingAll(false);
    }
  }

  async function handleUnselectAllClients() {
    if (!uid) return;

    setIsUnselectingAll(true);

    try {
      const allClients: RecipientsType[] = [];
      let targetPage = 1;
      const pageSize = 100;
      let totalPages = 1;

      do {
        const response = await getRecipientsLazy(buildRecipientsQuery(targetPage, pageSize, true)).unwrap();
        allClients.push(...(response?.data || []));
        totalPages = response?.totalPages || 1;
        targetPage += 1;
      } while (targetPage <= totalPages);

      const filteredClientUidSet = new Set(allClients.map((client) => client.uid));
      const activeRecipientUids = allClients.flatMap((client) => client?.scheduledMessageRecipients?.map((recipient) => recipient.uid) || []);

      const currentSelectedRecipients = getValues('selectedsRecipients') || [];
      const currentNewRecipients = getValues('newRecipients') || [];
      const currentRemovedRecipients = getValues('removedRecipients') || [];

      const updatedSelectedRecipients = currentSelectedRecipients.filter((recipient) => !filteredClientUidSet.has(recipient?.clientUid));
      const updatedNewRecipients = currentNewRecipients.filter((recipient) => !filteredClientUidSet.has(recipient?.clientUid));
      const updatedRemovedRecipients = Array.from(new Set([...currentRemovedRecipients, ...activeRecipientUids]));

      const remainingClientUidSet = new Set<string>([
        ...updatedSelectedRecipients.map((recipient) => recipient?.clientUid).filter(Boolean),
        ...updatedNewRecipients.map((recipient) => recipient?.clientUid).filter(Boolean),
      ]);

      setValue('selectedsRecipients', updatedSelectedRecipients);
      setValue('newRecipients', updatedNewRecipients);
      setValue('removedRecipients', updatedRemovedRecipients);
      setValue('clientsRecipientsCount', remainingClientUidSet.size);
      setValue('recipientsUpdate', true);

      setClients((prev) =>
        prev.map((client) =>
          filteredClientUidSet.has(client.uid)
            ? {
                ...client,
                scheduledMessageRecipients: [],
              }
            : client,
        ),
      );

      changeRecipients(true);
    } finally {
      setIsUnselectingAll(false);
    }
  }

  const getBirthDate = (row: RecipientsType) => row?.clientProfile?.birthDate || row?.birthDate || null;

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
    if (!data?.data) return;

    const currentSelectedRecipients = getValues('selectedsRecipients') || [];
    const currentNewRecipients = getValues('newRecipients') || [];
    const selectedClientUidSet = new Set<string>([
      ...currentSelectedRecipients.map((recipient) => recipient?.clientUid).filter(Boolean),
      ...currentNewRecipients.map((recipient) => recipient?.clientUid).filter(Boolean),
    ]);

    const pageDataWithSelection = data.data.map((client) => {
      const hasServerSelection = client?.scheduledMessageRecipients && client.scheduledMessageRecipients.length > 0;
      const hasSelected = selectedClientUidSet.has(client.uid);

      if (hasServerSelection || hasSelected) {
        return {
          ...client,
          scheduledMessageRecipients: hasServerSelection ? client.scheduledMessageRecipients : [{ uid: client.uid }],
        };
      }

      return {
        ...client,
        scheduledMessageRecipients: [],
      };
    });

    setClients(pageDataWithSelection);

    if (data?.data?.length > 0) {
      // Filtrar apenas clients que têm scheduledMessageRecipients preenchido (ativos)
      const activeClients = data.data.filter((client) => client?.scheduledMessageRecipients && client.scheduledMessageRecipients.length > 0);

      // Mapear para o formato esperado em selectedsRecipients
      const activeRecipientsToAdd = activeClients.map((client) => ({
        remoteJid: client.clientProfile.phone ? phoneToRemoteJid(client.clientProfile.phone) : client.clientProfile.phone || '',
        name: client.clientProfile.name || '',
        clientUid: client.uid,
      }));

      // Filtrar novos recipients que ainda não estão em selectedsRecipients
      const newActiveRecipients = activeRecipientsToAdd.filter(
        (newRecipient) =>
          !currentSelectedRecipients.some(
            (existing) => existing.clientUid === newRecipient.clientUid || existing.remoteJid === newRecipient.remoteJid,
          ),
      );

      // Combinar antigos com novos (se houver novos)
      if (newActiveRecipients.length > 0) {
        setValue('selectedsRecipients', [...currentSelectedRecipients, ...newActiveRecipients]);
      }
    }
  }, [data, setValue, getValues]);

  // Função para ativar/desativar
  function handleToggleEnableClient(uid: string) {
    const clientFind = clients.find((client) => client.uid === uid);

    if (!clientFind) return;

    // Verifica se o client já está ativo (tem scheduledMessageRecipients)
    const isActive = clientFind.scheduledMessageRecipients && clientFind.scheduledMessageRecipients.length > 0;

    if (isActive) {
      // DESATIVAR: Remover da scheduledMessageRecipients e lidar com removedRecipients/newRecipients
      setClients((prev) => prev.map((client) => (client.uid === uid ? { ...client, scheduledMessageRecipients: [] } : client)));

      // Obter valores atuais
      const currentNewRecipients = getValues('newRecipients') || [];
      const currentRemovedRecipients = getValues('removedRecipients') || [];

      // Remover de newRecipients se estiver lá
      const updatedNewRecipients = currentNewRecipients.filter((recipient) => recipient.clientUid !== uid);
      setValue('newRecipients', updatedNewRecipients);

      // Adicionar a removedRecipients se não estiver lá
      const recipientUid = clientFind.scheduledMessageRecipients?.[0]?.uid;

      if (recipientUid && recipientUid !== uid && !currentRemovedRecipients.includes(recipientUid)) {
        setValue('removedRecipients', [...currentRemovedRecipients, recipientUid]);
      }

      // Atualizar contador
      const currentCount = getValues('clientsRecipientsCount') || 0;
      setValue('clientsRecipientsCount', Math.max(0, currentCount - 1));
    } else {
      // ATIVAR: Adicionar scheduledMessageRecipients e lidar com newRecipients/removedRecipients
      setClients((prev) => prev.map((client) => (client.uid === uid ? { ...client, scheduledMessageRecipients: [{ uid }] } : client)));

      // Obter valores atuais
      const currentNewRecipients = getValues('newRecipients') || [];
      const currentRemovedRecipients = getValues('removedRecipients') || [];

      // Remover de removedRecipients se estiver lá
      setValue(
        'removedRecipients',
        currentRemovedRecipients.filter((recipientUid) => recipientUid !== uid),
      );

      // Adicionar a newRecipients se não estiver lá
      const clientToAdd = {
        remoteJid: clientFind.clientProfile.phone ? phoneToRemoteJid(clientFind.clientProfile.phone) : clientFind.clientProfile.phone || '',
        name: clientFind.clientProfile.name || '',
        clientUid: clientFind.uid,
      };

      const alreadyInNew = currentNewRecipients.some((recipient) => recipient.clientUid === uid);

      if (!alreadyInNew) {
        setValue('newRecipients', [...currentNewRecipients, clientToAdd]);
      }

      // Atualizar contador
      const currentCount = getValues('clientsRecipientsCount') || 0;
      setValue('clientsRecipientsCount', currentCount + 1);
    }

    setValue('recipientsUpdate', true);
    changeRecipients(true);
  }

  const columns = [
    {
      id: 'clientProfile.name',
      accessorKey: 'clientProfile.name',
      header: 'Nome',
      size: 250,
    },
    {
      id: 'clientProfile.phone',
      accessorKey: 'clientProfile.phone',
      header: 'Telefone',
      size: 250,
    },
    {
      id: 'clientProfile.email',
      accessorKey: 'clientProfile.email',
      header: 'E-mail',
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
      accessorKey: 'clientTags',
      header: 'Tags',
      size: 260,
      accessorFn: (row) => {
        if (!row?.clientTags || row.clientTags.length === 0) {
          return '-';
        }

        return (
          <Box display="flex" gap="8px" flexWrap="wrap">
            {row.clientTags.map((clientTag) => (
              <Chip
                key={clientTag.uid}
                label={clientTag.tag?.name}
                size="small"
                sx={{
                  backgroundColor: clientTag.tag?.color || '#e0e0e0',
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
      accessorKey: 'clientProfile.birthDate',
      header: 'Aniversário Mês',
      size: 160,
      accessorFn: (row) => {
        const month = getBirthMonth(getBirthDate(row));
        return month ? String(month) : '-';
      },
    },
    {
      id: 'birthdayWeek',
      accessorKey: 'birthdayWeek',
      header: 'Aniversário na semana',
      size: 200,
      accessorFn: (row) => {
        const inCurrentWeek = isBirthdayThisWeek(getBirthDate(row));
        return inCurrentWeek ? 'Sim' : 'Não';
      },
    },
    {
      id: 'enable',
      accessorKey: 'enable',
      header: 'Status do cliente',
      size: 250,
      accessorFn: (row) => (
        <Chip
          label={row?.enable ? 'Ativo' : 'Inativo'}
          color={row?.enable ? 'success' : 'error'}
          size="small"
          icon={row?.enable ? <CheckCircleOutlineIcon /> : <BlockIcon />}
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: 'Adicionar/Remover',
      accessorFn: (row) => (
        <Box>
          {/* <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            onClick={() => navigate(`/clients/${row.uid}`, { state: { isView: true } })}
          >
            <Tooltip title="Visualizar">
              <VisibilityOutlinedIcon fontSize="medium" color="primary" />
            </Tooltip>
          </ButtonBase> */}
          <Tooltip title={row?.scheduledMessageRecipients && row.scheduledMessageRecipients.length > 0 ? 'Remover da lista' : 'Adicionar à lista'}>
            <Switch
              checked={row?.scheduledMessageRecipients && row.scheduledMessageRecipients.length > 0}
              color={row?.scheduledMessageRecipients && row.scheduledMessageRecipients.length > 0 ? 'success' : 'error'}
              onChange={() => handleToggleEnableClient(row?.uid)}
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
        Clientes - {getValues('clientsRecipientsCount')} participando
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
            onClick={handleUnselectAllClients}
            disabled={isUnselectingAll || isSelectingAll || filteredTotal === 0}
          >
            {isUnselectingAll ? 'Desmarcando...' : 'Desmarcar todos'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleSelectAllClients}
            disabled={isSelectingAll || isUnselectingAll || filteredTotal === 0}
          >
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
          <InputLabel id="clients-step-filter-label">Etapa</InputLabel>
          <Select
            labelId="clients-step-filter-label"
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
          <InputLabel id="clients-birthday-month-filter-label">Aniversário Mês</InputLabel>
          <Select
            labelId="clients-birthday-month-filter-label"
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
        {!isLoadingClients && (
          <DefaultTable
            data={clients || []}
            columns={columns}
            page={page}
            totalPages={data?.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            showGlobalFilter={false}
          />
        )}
      </Box>
    </Paper>
  );
}

export default TableClients;
