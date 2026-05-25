import { Controller, useForm } from 'react-hook-form';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useEffect, useState, MouseEvent } from 'react';
import _ from 'lodash';
import Box from '@mui/material/Box';
import { darken } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrumboardList, useDeleteStepMutation, useUpdateStepNameMutation } from '../../ScrumboardApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { removeStep, renameStep } from '../boardSlice';
import Tooltip from '@mui/material/Tooltip';
import MessageTemplateAutocomplete from '../../../scheduled-messages/components/MessageTemplateAutocomplete';
import WhatsAppPreview from '@/components/WhatsAppPreview';
import { MessageTemplateType, useGetMessageTemplatesQuery } from '../../../message-templates/messageTemplatesApi';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';

/**
 * Form Validation Schema
 */
const schema = z.object({
  title: z.string().nonempty('You must enter a title'),
});

type FormType = z.infer<typeof schema>;

type BoardListHeaderProps = {
  list: ScrumboardList;
  boardId: string;
  totalCards: number;
  handleProps: DraggableProvidedDragHandleProps | null | undefined;
  className?: string;
  refetch?: () => void;
  setLoading?: (loading: boolean) => void;
  messageTemplateUid?: string | null;
  messageSend?: boolean;
  sendMessageAt?: string;
};

/**
 * The board list header component.
 */
function BoardListHeader(props: BoardListHeaderProps) {
  const { list, totalCards, className, handleProps, refetch, setLoading, messageTemplateUid, messageSend, sendMessageAt } = props;
  const { control, formState, handleSubmit, reset } = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      title: list.title,
    },
    resolver: zodResolver(schema),
  });

  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateType | null>(null);
  const [openTemplateModal, setOpenTemplateModal] = useState(false);
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [timeValues, setTimeValues] = useState({
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 1,
  });

  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [deleteStep, { isLoading: isLoadingDelete }] = useDeleteStepMutation();
  const [updateStepName, { isLoading: isLoadingStep }] = useUpdateStepNameMutation();
  const { data: messageTemplates } = useGetMessageTemplatesQuery(`uid=${messageTemplateUid}`, {
    refetchOnMountOrArgChange: true,
    skip: !messageTemplateUid,
  });
  const { isValid, dirtyFields } = formState;

  useEffect(() => {
    setLoading(isLoadingStep);
  }, [isLoadingStep]);

  useEffect(() => {
    setLoading(isLoadingDelete);
  }, [isLoadingDelete]);

  useEffect(() => {
    if (!formOpen) {
      reset({
        title: list.title,
      });
    }
  }, [formOpen, reset, list.title]);

  useEffect(() => {
    if (formOpen && anchorEl) {
      setAnchorEl(null);
    }
  }, [anchorEl, formOpen]);

  // Carregar valores existentes quando o modal for aberto
  useEffect(() => {
    if (openTemplateModal && messageTemplateUid && messageTemplates?.data) {
      const existingTemplate = messageTemplates.data.find((template) => template.uid === messageTemplateUid);

      if (existingTemplate) {
        setSelectedTemplate(existingTemplate);
      }
    }

    if (openTemplateModal && typeof messageSend === 'boolean') {
      setAutoSendEnabled(messageSend);
    }

    if (openTemplateModal && sendMessageAt) {
      //EXEMPLO VALOR SALVO: 1 month 2 weeks
      const parseTimeString = (timeStr: string) => {
        const result = { years: 0, months: 0, weeks: 0, days: 0, hours: 0 };
        const parts = timeStr.split(' ');

        for (let i = 0; i < parts.length; i += 2) {
          const value = parseInt(parts[i]) || 0;
          const unit = parts[i + 1];

          if (unit?.includes('year')) result.years = value;
          else if (unit?.includes('month')) result.months = value;
          else if (unit?.includes('week')) result.weeks = value;
          else if (unit?.includes('day')) result.days = value;
          else if (unit?.includes('hour')) result.hours = value;
        }

        return result;
      };

      setTimeValues(parseTimeString(sendMessageAt));
    }
  }, [openTemplateModal, messageTemplateUid, messageSend, sendMessageAt, messageTemplates]);

  // Função para gerar string legível e valor do tempo
  const formatTimeString = () => {
    const labelParts = [];
    const valueParts = [];

    if (timeValues.years > 0) {
      labelParts.push(`${timeValues.years} ano${timeValues.years > 1 ? 's' : ''}`);
      valueParts.push(`${timeValues.years} year${timeValues.years > 1 ? 's' : ''}`);
    }

    if (timeValues.months > 0) {
      labelParts.push(`${timeValues.months} mês${timeValues.months > 1 ? 'es' : ''}`);
      valueParts.push(`${timeValues.months} month${timeValues.months > 1 ? 's' : ''}`);
    }

    if (timeValues.weeks > 0) {
      labelParts.push(`${timeValues.weeks} semana${timeValues.weeks > 1 ? 's' : ''}`);
      valueParts.push(`${timeValues.weeks} week${timeValues.weeks > 1 ? 's' : ''}`);
    }

    if (timeValues.days > 0) {
      labelParts.push(`${timeValues.days} dia${timeValues.days > 1 ? 's' : ''}`);
      valueParts.push(`${timeValues.days} day${timeValues.days > 1 ? 's' : ''}`);
    }

    if (timeValues.hours > 0) {
      labelParts.push(`${timeValues.hours} hora${timeValues.hours > 1 ? 's' : ''}`);
      valueParts.push(`${timeValues.hours} hour${timeValues.hours > 1 ? 's' : ''}`);
    }

    return {
      label: labelParts.length > 0 ? labelParts.join(', ') : '0 horas',
      value: valueParts.length > 0 ? valueParts.join(' ') : '0 hours',
    };
  };

  function handleMenuClick(event: MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleOpenForm(ev: MouseEvent<HTMLAnchorElement | HTMLLIElement>) {
    ev.stopPropagation();
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
  }

  function handleSaveTemplate() {
    const timeFormat = formatTimeString();
    updateStepName({
      uid: list.uid,
      messageTemplateUid: selectedTemplate?.uid || null,
      messageSend: autoSendEnabled,
      sendMessageAt: timeFormat.value,
    })
      .unwrap()
      .then((response) => {
        refetch?.();
        dispatch(
          showMessage({
            message: response?.msg,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      })
      .catch((error) => {
        dispatch(
          showMessage({
            message: error?.data?.msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
    setOpenTemplateModal(false);
  }

  function onSubmit(newData: FormType) {
    dispatch(renameStep({ name: newData.title, uid: list.uid }));
    updateStepName({ name: newData.title, uid: list.uid })
      .unwrap()
      .then((response) => {
        refetch();
        dispatch(
          showMessage({
            message: response?.msg,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      })
      .catch((error) => {
        dispatch(
          showMessage({
            message: error?.data?.msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
    handleCloseForm();
  }

  function handleRemoveStep() {
    if (list?.leads && Array.isArray(list.leads) && list.leads.length > 0) {
      dispatch(
        showMessage({
          message: 'Não é possível remover a etapa, pois existem leads vinculados a ela',
          autoHideDuration: 2000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
    } else {
      setOpenRemoveModal(true);
      handleMenuClose();
    }
  }

  function handleConfirmRemoveStep() {
    dispatch(removeStep(list.uid));
    setLoading(true);
    deleteStep(list.uid)
      .unwrap()
      .then((response) => {
        refetch();
        dispatch(
          showMessage({
            message: response?.msg,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
        setOpenRemoveModal(false);
      })
      .catch((error) => {
        dispatch(
          showMessage({
            message: error?.data?.msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
        refetch();
        setOpenRemoveModal(false);
      });
  }

  return (
    <div {...handleProps}>
      <Box
        className={clsx('flex items-center justify-between h-12 sm:h-14 px-3', className)}
        sx={{
          backgroundColor: (theme) => (list.type === 'DEFAULT' || list.type === 'OPTICO' ? theme.palette.primary.main : '#FFFFF'),
        }}
      >
        <div className="flex items-center min-w-0">
          {formOpen ? (
            <ClickAwayListener onClickAway={handleCloseForm}>
              <form className="flex w-full" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="outlined"
                      margin="none"
                      autoFocus
                      size="small"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton type="submit" disabled={_.isEmpty(dirtyFields) || !isValid} size="large">
                                <FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </form>
            </ClickAwayListener>
          ) : (
            <Typography
              className={`text-base font-medium${list.type !== 'DEFAULT' && list.type !== 'OPTICO' ? ' cursor-pointer' : ''}`}
              onClick={list.type !== 'DEFAULT' && list.type !== 'OPTICO' ? handleOpenForm : undefined}
            >
              {list.name}
            </Typography>
          )}
        </div>
        <div className="flex items-center">
          <Box
            className="flex items-center justify-center min-w-6 h-6 mx-1 p-2 text-sm font-semibold leading-[2] rounded-full"
            sx={{
              backgroundColor: (theme) => darken(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.3),
              color: '#fff',
            }}
          >
            {totalCards}
          </Box>
          {list.type === 'DEFAULT' && list?.uid === import.meta.env.VITE_APP_START_CONVERSATION_UID && (
            <Tooltip title="Ao mover um Lead para esta etapa, o Alldo automaticamente iniciara uma conversa com o Lead. O Alldo só irá falar com os Lead que estão nesta etapa.">
              <IconButton size="small">
                <FuseSvgIcon size={24}>heroicons-outline:information-circle</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
          {list.type !== 'DEFAULT' && list.type !== 'OPTICO' && (
            <>
              <IconButton aria-haspopup="true" onClick={handleMenuClick} size="small">
                <FuseSvgIcon size={20}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
              </IconButton>
              <Menu id="actions-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleRemoveStep}>
                  <ListItemIcon className="min-w-9">
                    <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
                  </ListItemIcon>
                  <ListItemText primary="Remover Etapa" />
                </MenuItem>
                <MenuItem onClick={handleOpenForm}>
                  <ListItemIcon className="min-w-9">
                    <FuseSvgIcon>heroicons-outline:pencil</FuseSvgIcon>
                  </ListItemIcon>
                  <ListItemText primary="Renomear Etapa" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setOpenTemplateModal(true);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon className="min-w-9">
                    <FuseSvgIcon>heroicons-outline:paper-airplane</FuseSvgIcon>
                  </ListItemIcon>
                  <ListItemText primary="Mensagem automática" />
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </Box>
      <DefaultConfirmModal
        open={openTemplateModal}
        onCancel={() => {
          setOpenTemplateModal(false);
          setSelectedTemplate(null);
          setAutoSendEnabled(false);
          setTimeValues({ years: 0, months: 0, weeks: 0, days: 0, hours: 1 });
        }}
        onConfirm={() => handleSaveTemplate()}
        title="Salvar mensagem automática"
        confirmText="Salvar"
        confirmDisabled={!selectedTemplate}
        loading={false}
        maxWidth="sm"
        message={
          <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
            <div>
              <Typography style={{ marginBottom: '12px' }}>
                Configure uma mensagem automática que será enviada via WhatsApp quando o contato entrar nesta etapa do CRM. Configure uma mensagem
                automática que será enviada via WhatsApp quando o contato entrar nesta etapa do CRM.
              </Typography>
              <MessageTemplateAutocomplete value={selectedTemplate} onChange={setSelectedTemplate} label="Selecionar Template" />
            </div>

            <div>
              <Typography>Selecione em quanto tempo a mensagem deve ser enviada após o contato entrar na etapa.</Typography>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '12px' }}>
                <TextField
                  type="number"
                  label="Anos"
                  size="small"
                  value={timeValues.years}
                  onChange={(e) => setTimeValues((prev) => ({ ...prev, years: Math.max(0, parseInt(e.target.value) || 0) }))}
                  slotProps={{
                    htmlInput: { min: 0 },
                  }}
                />
                <TextField
                  type="number"
                  label="Meses"
                  size="small"
                  value={timeValues.months}
                  onChange={(e) => setTimeValues((prev) => ({ ...prev, months: Math.max(0, parseInt(e.target.value) || 0) }))}
                  slotProps={{
                    htmlInput: { min: 0, max: 11 },
                  }}
                />
                <TextField
                  type="number"
                  label="Semanas"
                  size="small"
                  value={timeValues.weeks}
                  onChange={(e) => setTimeValues((prev) => ({ ...prev, weeks: Math.max(0, parseInt(e.target.value) || 0) }))}
                  slotProps={{
                    htmlInput: { min: 0 },
                  }}
                />
                <TextField
                  type="number"
                  label="Dias"
                  size="small"
                  value={timeValues.days}
                  onChange={(e) => setTimeValues((prev) => ({ ...prev, days: Math.max(0, parseInt(e.target.value) || 0) }))}
                  slotProps={{
                    htmlInput: { min: 0, max: 6 },
                  }}
                />
                <TextField
                  type="number"
                  label="Horas"
                  size="small"
                  value={timeValues.hours}
                  onChange={(e) => setTimeValues((prev) => ({ ...prev, hours: Math.max(0, parseInt(e.target.value) || 0) }))}
                  slotProps={{
                    htmlInput: { min: 0, max: 23 },
                  }}
                />
              </div>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tempo selecionado: {formatTimeString().label}
              </Typography>
            </div>

            <div>
              <FormControlLabel
                control={<Switch checked={autoSendEnabled} onChange={(event) => setAutoSendEnabled(event.target.checked)} color="success" />}
                label={autoSendEnabled ? 'Envio automático habilitado' : 'Envio automático desabilitado'}
              />
            </div>

            <div>
              <WhatsAppPreview message={selectedTemplate?.message || ''} image={selectedTemplate?.imageUrl || ''} />
            </div>
          </div>
        }
      />
      <DefaultConfirmModal
        open={openRemoveModal}
        onCancel={() => setOpenRemoveModal(false)}
        onConfirm={handleConfirmRemoveStep}
        title="Confirmar exclusão"
        confirmText="Excluir"
        confirmColor="error"
        message="Tem certeza que deseja excluir esta etapa? Esta ação não pode ser desfeita."
        loading={isLoadingDelete}
      />
    </div>
  );
}

export default BoardListHeader;
