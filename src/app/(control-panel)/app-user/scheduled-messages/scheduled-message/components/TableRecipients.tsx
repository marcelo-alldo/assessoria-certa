import { Box, ButtonBase, Paper, Tooltip, Typography, TextField, Button } from '@mui/material';
import DefaultTable from '@/components/DefaultTable';
import { useParams } from 'react-router';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useEffect, useState } from 'react';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { RecipientsType, useGetRecipientsQuery } from '../../scheduledMessagesApi';
import { phoneToRemoteJid, remoteJidToPhoneNew } from '@/utils/remoteJidToPhone';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { IMaskInput } from 'react-imask';
import { useFormContext } from 'react-hook-form';

/**
 * The Recipients.
 */

interface TableRecipientsProps {
  changeRecipients?: (change: boolean) => void;
  page: number;
  setPage: (page: number) => void;
}

function TableRecipients({ changeRecipients, page, setPage }: TableRecipientsProps) {
  const { uid } = useParams();
  const { setValue, getValues } = useFormContext();
  const [search, setSearch] = useState('');

  // Usa o search na query da API

  const { data, isLoading } = useGetRecipientsQuery(`page=${page}&message=${uid}&search=${search}`, {
    refetchOnMountOrArgChange: true,
  });

  const [recepients, setRecepients] = useState([]);

  // Sempre que data mudar, atualizar selectedsRecipients mantendo os antigos e adicionando novos ativos sem duplicar
  useEffect(() => {
    if (data?.data?.length > 0) {
      setRecepients(data.data);

      // Obter selectedsRecipients atuais
      const currentSelectedRecipients = getValues('selectedsRecipients') || [];

      // Filtrar apenas recipientes que têm scheduledMessageRecipients preenchido (ativos)
      const activeRecipients = data.data;

      // Mapear para o formato esperado em selectedsRecipients
      const activeRecipientsToAdd = activeRecipients.map((recipient) => ({
        uid: recipient.uid,
        remoteJid: recipient.remoteJid,
        name: recipient.name,
      }));

      // Filtrar novos recipients que ainda não estão em selectedsRecipients
      const newActiveRecipients = activeRecipientsToAdd.filter(
        (newRecipient) => !currentSelectedRecipients.some((existing) => existing.remoteJid === newRecipient.remoteJid),
      );

      // Combinar antigos com novos (se houver novos)
      if (newActiveRecipients.length > 0) {
        setValue('selectedsRecipients', [...currentSelectedRecipients, ...newActiveRecipients]);
      }
    }
  }, [data, setValue, getValues]);

  const [openDeleteRecipientModal, setOpenDeleteRecipientModal] = useState(false);
  const [openNewRecipientModal, setOpenNewRecipientModal] = useState(false);
  const [recipientToDelete, setRecipientToDelete] = useState(null);

  // Estados para o formulário de novo contato
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const handleOpenDeleteRecipientModal = (recipient) => {
    setRecipientToDelete(recipient);
    setOpenDeleteRecipientModal(true);
  };

  const handleDelete = () => {
    if (!recipientToDelete) return;

    // Remover do estado local da tabela
    setRecepients((prev) => prev.filter((recipient) => recipient.remoteJid !== recipientToDelete.remoteJid));

    // Para mensagens novas (uid === 'new'), gerenciar apenas newRecipients
    if (uid === 'new') {
      const currentNewRecipients = getValues('newRecipients') || [];
      const updatedNewRecipients = currentNewRecipients.filter((recipient) => recipient.remoteJid !== recipientToDelete.remoteJid);
      setValue('newRecipients', updatedNewRecipients);
    } else {
      // Para mensagens existentes, remover apenas do newRecipients e adicionar ao unselected
      // Adicionar ao removedRecipients (se tiver uid)
      if (recipientToDelete.uid) {
        const currentUnselected = getValues('removedRecipients') || [];
        setValue('removedRecipients', [...currentUnselected, recipientToDelete.uid]);
      }

      // Remover do newRecipients se estiver lá
      const currentNewRecipients = getValues('newRecipients') || [];
      const updatedNewRecipients = currentNewRecipients.filter((recipient) => recipient.remoteJid !== recipientToDelete.remoteJid);
      setValue('newRecipients', updatedNewRecipients);
    }

    // Atualizar contador - diminuir
    const currentCount = getValues('recipientsCount') || 0;
    setValue('recipientsCount', Math.max(0, currentCount - 1));

    // Resetar e fechar modal
    setRecipientToDelete(null);
    changeRecipients?.(true);
    setOpenDeleteRecipientModal(false);
  };

  const handleAddNewContact = () => {
    const newRecipient = {
      remoteJid: phoneToRemoteJid(newContactPhone),
      name: newContactName,
      uid: `temp-${Date.now()}`, // UID temporário para o novo contato
      scheduledMessageRecipients: [{ remoteJid: phoneToRemoteJid(newContactPhone) }], // Já marcado como selecionado
    };

    changeRecipients?.(true);

    // Objeto para adicionar ao selectedsRecipients
    const recipientToAdd = {
      remoteJid: phoneToRemoteJid(newContactPhone),
      name: newContactName,
    };

    // Para mensagens novas (uid === 'new'), adicionar apenas ao newRecipients
    if (uid === 'new') {
      const currentNewRecipients = getValues('newRecipients') || [];

      // Verificar se o recipient já não está em newRecipients
      const alreadyExists = currentNewRecipients.some((recipient) => recipient.remoteJid === recipientToAdd.remoteJid);

      if (!alreadyExists) {
        setValue('newRecipients', [...currentNewRecipients, recipientToAdd]);
      }
    } else {
      // Para mensagens existentes, adicionar apenas ao newRecipients (não aos arrays específicos)
      const currentNewRecipients = getValues('newRecipients') || [];
      const alreadyExists = currentNewRecipients.some((recipient) => recipient.remoteJid === recipientToAdd.remoteJid);

      if (!alreadyExists) {
        setValue('newRecipients', [...currentNewRecipients, recipientToAdd]);
      }
    }

    // Adicionar ao estado local da tabela para aparecer imediatamente
    setRecepients((prev) => [...prev, newRecipient]);

    // Atualizar contador - aumentar
    const currentCount = getValues('recipientsCount') || 0;
    setValue('recipientsCount', currentCount + 1);

    // Resetar os campos e fechar o modal
    setNewContactName('');
    setNewContactPhone('');
    setOpenNewRecipientModal(false);
  };

  const handleCancelNewContact = () => {
    // Resetar os campos e fechar o modal
    setNewContactName('');
    setNewContactPhone('');
    setOpenNewRecipientModal(false);
  };

  const columns = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Nome',
      size: 250,
    },
    {
      id: 'phone',
      accessorKey: 'remoteJid',
      header: 'Telefone',
      size: 250,
      accessorFn: (row: RecipientsType) => remoteJidToPhoneNew(row.remoteJid),
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: 'Adicionar/Remover',
      accessorFn: (row: RecipientsType) => (
        <Box>
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            // disabled={isLoadingDelete}
            onClick={() => handleOpenDeleteRecipientModal(row)}
          >
            <Tooltip title="Excluir">
              <DeleteOutlineOutlinedIcon color="error" fontSize="medium" />
            </Tooltip>
          </ButtonBase>
        </Box>
      ),
    },
  ];

  return (
    <Paper className="w-full h-full flex flex-col p-2">
      <Box className="p-4 flex justify-between items-center">
        <Typography variant="h6">Contatos - {getValues('recipientsCount')} participando</Typography>
        <Button
          variant="contained"
          className="whitespace-nowrap"
          color="secondary"
          // disabled={_.isEmpty(dirtyFields) || !isValid || isLoadingCreate}
          onClick={() => setOpenNewRecipientModal(true)}
        >
          <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
          <span className="hidden sm:flex mx-2">Adicionar contato</span>
        </Button>
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
        {!isLoading && (
          <>
            <DefaultTable
              data={recepients}
              columns={columns}
              page={page}
              totalPages={data?.totalPages || 0}
              onPageChange={(newPage) => setPage(newPage)}
              globalFilter={search}
              onGlobalFilterChange={setSearch}
            />
          </>
        )}

        <DefaultConfirmModal
          onCancel={handleCancelNewContact}
          onConfirm={handleAddNewContact}
          open={openNewRecipientModal}
          title="Adicionar contato"
          message={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Preencha os dados do novo contato:
              </Typography>
              <TextField
                label="Nome"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Digite o nome do contato"
              />
              <TextField
                label="Telefone"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="(11) 99999-9999"
                InputProps={{
                  inputComponent: IMaskInput,
                  inputProps: {
                    mask: ['(00) 0000-0000', '(00) 00000-0000'],
                  },
                }}
                onBlur={(e) => {
                  // Força a máscara correta ao sair do campo
                  const onlyDigits = e.target.value.replace(/\D/g, '');

                  if (onlyDigits.length === 11) {
                    // Garante que o valor não será truncado
                    const ddd = onlyDigits.slice(0, 2);
                    const part1 = onlyDigits.slice(2, 7);
                    const part2 = onlyDigits.slice(7);
                    const formatted = `(${ddd}) ${part1}-${part2}`;
                    setNewContactPhone(formatted);
                  } else if (onlyDigits.length === 10) {
                    const ddd = onlyDigits.slice(0, 2);
                    const part1 = onlyDigits.slice(2, 6);
                    const part2 = onlyDigits.slice(6);
                    const formatted = `(${ddd}) ${part1}-${part2}`;
                    setNewContactPhone(formatted);
                  } else {
                    setNewContactPhone(e.target.value);
                  }
                }}
              />
            </Box>
          }
          confirmText="Adicionar"
          cancelText="Cancelar"
          confirmColor="primary"
          confirmDisabled={!newContactName || !newContactPhone}
          // loading={isLoadingDelete}
        />
        <DefaultConfirmModal
          onCancel={() => {
            setRecipientToDelete(null);
            setOpenDeleteRecipientModal(false);
          }}
          onConfirm={handleDelete}
          open={openDeleteRecipientModal}
          title="Excluir contato"
          message={`Tem certeza que deseja excluir o contato "${recipientToDelete?.name || 'N/A'}"? Esta ação não poderá ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          confirmColor="error"
          // loading={isLoadingDelete}
        />
      </Box>
    </Paper>
  );
}

export default TableRecipients;
