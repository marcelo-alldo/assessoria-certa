import { Autocomplete, TextField, CircularProgress, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { MessageTemplateType, useGetMessageTemplatesQuery } from '../../message-templates/messageTemplatesApi';

interface MessageTemplateAutocompleteProps {
  value: MessageTemplateType | null;
  onChange: (template: MessageTemplateType | null) => void;
  disabled?: boolean;
  label?: string;
}

function MessageTemplateAutocomplete({ value, onChange, disabled = false, label = 'Selecionar Template' }: MessageTemplateAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<MessageTemplateType[]>([]);

  // Construir query string para busca
  const queryString = searchTerm ? `search=${encodeURIComponent(searchTerm)}&enable=true&pageSize=50` : 'enable=true&pageSize=50';

  const { data: templatesResponse, isLoading, error } = useGetMessageTemplatesQuery(queryString);

  useEffect(() => {
    if (templatesResponse?.data) {
      setOptions(templatesResponse.data);
    }
  }, [templatesResponse]);

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setSearchTerm(newInputValue);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: MessageTemplateType | null) => {
    onChange(newValue);
  };

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      options={options}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.uid === value.uid}
      loading={isLoading}
      disabled={disabled}
      noOptionsText={error ? 'Erro ao carregar templates' : 'Nenhum template encontrado'}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.uid}>
          <div className="flex flex-col">
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {option.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
              {option.category.toLowerCase()}
            </Typography>
          </div>
        </li>
      )}
    />
  );
}

export default MessageTemplateAutocomplete;
