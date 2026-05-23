import { TextField, Typography, useTheme } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { useLocation } from 'react-router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import MessageTemplateAutocomplete from '../../components/MessageTemplateAutocomplete';
import { MessageTemplateType } from '../../../message-templates/messageTemplatesApi';
import WhatsAppPreview from '../../../../../../components/WhatsAppPreview';

function BasicInfosTab() {
  const { control, setValue, watch } = useFormContext();
  const { state } = useLocation();
  const theme = useTheme();

  const selectedTemplate = watch('selectedTemplate');
  const messageContent = watch('message');
  const imageUrl = watch('imageUrl');

  // Sempre que qualquer campo for alterado, seta profileUpdate para true
  const handleFieldChange = (fieldOnChange) => (value) => {
    setValue('profileUpdate', true, { shouldDirty: false });
    fieldOnChange(value);
  };

  const handleTemplateSelect = (template: MessageTemplateType | null) => {
    setValue('selectedTemplate', template, { shouldDirty: true });

    if (template) {
      setValue('message', template.message, { shouldDirty: true });
      setValue('messageTemplateUid', template.uid, { shouldDirty: true });
      setValue('imageUrl', template.image || '', { shouldDirty: true });
      setValue('imageUrl', template.imageUrl || '', { shouldDirty: true });
    } else {
      setValue('title', '', { shouldDirty: true });
      setValue('message', '', { shouldDirty: true });
      setValue('messageTemplateUid', '', { shouldDirty: true });
      setValue('imageUrl', '', { shouldDirty: true });
    }

    setValue('profileUpdate', true, { shouldDirty: false });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl">
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="flex flex-col gap-4">
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
              Informações da Mensagem Agendada
            </Typography>

            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Título da campanha / mensagem"
                  {...field}
                  onChange={(e) => handleFieldChange(field.onChange)(e.target.value)}
                  disabled={state?.isView}
                />
              )}
            />

            <MessageTemplateAutocomplete
              value={selectedTemplate}
              onChange={handleTemplateSelect}
              disabled={state?.isView}
              label="Selecionar Template"
            />

            <Controller
              name="sentAt"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DateTimePicker
                    label="Data e Hora de Envio"
                    value={field.value ? (typeof field.value === 'string' ? (field.value ? new Date(field.value) : null) : field.value) : null}
                    onChange={(date) => {
                      // Converte para string yyyy-MM-dd HH:mm ou ''
                      const str = date instanceof Date && !isNaN(date.getTime()) ? format(date, 'yyyy-MM-dd HH:mm') : '';
                      handleFieldChange(field.onChange)(str);
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                    disabled={state?.isView}
                  />
                </LocalizationProvider>
              )}
            />
          </div>
        </div>
      </div>

      <div className="lg:w-96 lg:sticky lg:top-6 lg:self-start">
        <div className="mb-4">
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
            Preview da Mensagem
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Veja como sua mensagem aparecerá no WhatsApp
          </Typography>
        </div>
        <WhatsAppPreview message={messageContent} image={imageUrl} />
      </div>
    </div>
  );
}

export default BasicInfosTab;
