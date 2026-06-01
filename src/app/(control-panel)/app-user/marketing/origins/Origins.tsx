import { Autocomplete, Box, Button, Chip, Container, LinearProgress, styled, TextField, Typography } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import OriginsHeader from './OriginsHeader';
import { useDeleteOriginMutation, useGetOriginsQuery } from '../../../../../store/api/originsApi';
import { useGetTagsQuery, useUpdateTagMutation } from '../../../../../store/api/tagsApi';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import ItemOrigin from './components/ItemOrigin';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useAppDispatch } from '../../../../../store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

/**
 * The Origins.
 */

const schema = z.object({
  name: z.string(),
  key: z.string(),
  tagUid: z.string(),
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
  name: '',
  key: '',
  tagUid: '',
};

const DEFAULT_NEW_TAG_COLOR = '#4ECDC4';

function Origins() {
  const { data, isLoading, isFetching, refetch: refetchOrigins } = useGetOriginsQuery('', { refetchOnMountOrArgChange: true });
  const { data: tagsData, isLoading: isLoadingTags, refetch: refetchTags } = useGetTagsQuery();
  const [updateTag, { isLoading: isCreatingTag }] = useUpdateTagMutation();
  const [deleteOrigin, { isLoading: isDeletingOrigin }] = useDeleteOriginMutation();
  const dispatch = useAppDispatch();
  const [hasChanges, setHasChanges] = useState(false);
  const [, setLocalLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [isUpdated, setIsUpdated] = useState(false);
  const [updateUid, setUpdateUid] = useState<string | null>(null);
  const [deleteUid, setDeleteUid] = useState<string | null>(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const methods = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });
  const { control, formState, watch } = methods;
  const { errors } = formState;

  const watchedName = watch('name');
  const watchedKey = watch('key');
  const watchedTagUid = watch('tagUid');

  useEffect(() => {
    const isFormFilled = Boolean(watchedName?.trim() && watchedKey?.trim() && watchedTagUid?.trim());
    setHasChanges(showForm && isFormFilled);
  }, [watchedName, watchedKey, watchedTagUid, showForm]);

  const createTagFromInput = async (tagName: string) => {
    const trimmedTagName = tagName.trim();

    if (!trimmedTagName) {
      return null;
    }

    const existingTag = (tagsData?.data || []).find((tag) => tag.name.trim().toLowerCase() === trimmedTagName.toLowerCase());

    if (existingTag) {
      return existingTag;
    }

    try {
      const response = await updateTag({
        name: trimmedTagName,
        color: DEFAULT_NEW_TAG_COLOR,
      }).unwrap();

      await refetchTags();

      dispatch(
        showMessage({
          message: response?.msg || 'Tag criada com sucesso!',
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );

      return response?.data || null;
    } catch (error) {
      dispatch(
        showMessage({
          message: error?.data?.msg || 'Erro ao criar tag',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );

      return null;
    }
  };

  const handleUpdateOrigin = (uid: string) => {
    const originUpdate = data?.data?.find((origin) => origin.uid === uid);

    if (!originUpdate) {
      dispatch(
        showMessage({
          message: 'Origem não encontrada',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
      return;
    }

    setShowForm(true);
    setIsUpdated(true);
    setUpdateUid(uid);
    methods.reset({
      name: originUpdate.name,
      key: originUpdate.key,
      tagUid: originUpdate.tagUid || '',
    });
  };

  const handleCancelUpdate = () => {
    setShowForm(false);
    setIsUpdated(false);
    setUpdateUid(null);
    methods.reset(defaultValues);
  };

  const handleDeleteOrigin = (uid: string) => {
    setDeleteUid(uid);
    setOpenModalDelete(true);
  };

  const confirmDeleteOrigin = () => {
    if (!deleteUid) return;

    deleteOrigin(deleteUid)
      .unwrap()
      .then((response) => {
        refetchOrigins();
        setOpenModalDelete(false);
        setDeleteUid(null);
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
            message: error?.data?.msg || 'Erro ao excluir origem',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
  };

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={
          <>
            {isFetching && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}
            {!isLoading && (
              <OriginsHeader
                setLoading={setLocalLoading}
                refetch={refetchOrigins}
                hasChanges={hasChanges}
                setHasChanges={setHasChanges}
                uid={updateUid || ''}
                showForm={setShowForm}
              />
            )}
          </>
        }
        content={
          <div className="flex flex-1 flex-col">
            <Container maxWidth="xl">
              {!isLoading && (
                <>
                  <Box className="flex flex-col pl-6 pb-6 mt-4">
                    <Typography variant="subtitle1" color="text.secondary">
                      Cadastre as origens dos seus contatos para saber exatamente de onde eles vieram, como anúncios, redes sociais ou indicações.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <br />
                      Para identificar cada origem, utilize uma palavra ou frase específica nos seus anúncios direcionados ao WhatsApp.
                      <br />
                      Quando o contato enviar essa mensagem, o Alldo Assistente reconhece automaticamente a origem do lead.
                    </Typography>
                  </Box>

                  <Box className="flex flex-col pl-6 pb-4 max-w-2xl">
                    {data?.data?.map((origin) => (
                      <ItemOrigin key={origin.uid} data={origin} updateOrigin={handleUpdateOrigin} openModalDelete={handleDeleteOrigin} />
                    ))}
                  </Box>
                  {showForm && (
                    <Box className="flex flex-col pl-6 pb-4 mt-4 max-w-2xl">
                      <Controller
                        name={`name`}
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Nome da origem" className="mb-2" required fullWidth helperText={errors.name?.message} />
                        )}
                      />

                      <Controller
                        name={`key`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Chave da origem ou frase"
                            className="mb-2"
                            required
                            fullWidth
                            helperText={errors.key?.message}
                          />
                        )}
                      />

                      <Controller
                        name={`tagUid`}
                        control={control}
                        render={({ field }) => {
                          const selectedTag = (tagsData?.data || []).find((tag) => tag.uid === field.value) || null;

                          return (
                            <Autocomplete
                              options={tagsData?.data || []}
                              loading={isLoadingTags || isCreatingTag}
                              noOptionsText="Tag não encontrada, digite Enter para criar uma nova tag."
                              value={selectedTag}
                              inputValue={tagSearch}
                              onInputChange={(_, newInputValue) => setTagSearch(newInputValue)}
                              onChange={(_, newSelectedTag) => {
                                field.onChange(newSelectedTag?.uid || '');
                                setTagSearch('');
                              }}
                              getOptionLabel={(option) => option.name}
                              isOptionEqualToValue={(option, value) => option.uid === value.uid}
                              renderOption={(props, option) => (
                                <Box component="li" {...props} key={option.uid}>
                                  <Chip
                                    label={option.name}
                                    size="small"
                                    sx={{
                                      backgroundColor: option.color,
                                      color: '#fff',
                                      fontWeight: 500,
                                      // width: '100%',
                                      justifyContent: 'flex-start',
                                      '& .MuiChip-label': {
                                        width: '100%',
                                      },
                                    }}
                                  />
                                </Box>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Tag associada"
                                  className="mb-2"
                                  required
                                  fullWidth
                                  error={!!errors.tagUid}
                                  helperText={errors.tagUid?.message || 'Digite o nome e pressione Enter para criar uma nova tag.'}
                                  onKeyDown={async (event) => {
                                    if (event.key !== 'Enter' || selectedTag || !tagSearch.trim()) {
                                      return;
                                    }

                                    event.preventDefault();

                                    const createdTag = await createTagFromInput(tagSearch);

                                    if (createdTag?.uid) {
                                      field.onChange(createdTag.uid);
                                      setTagSearch('');
                                    }
                                  }}
                                  inputProps={{
                                    ...params.inputProps,
                                    readOnly: Boolean(selectedTag),
                                  }}
                                  sx={{
                                    '& .MuiAutocomplete-input': {
                                      width: selectedTag ? '0 !important' : undefined,
                                      minWidth: selectedTag ? '0 !important' : undefined,
                                      opacity: selectedTag ? 0 : 1,
                                    },
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: selectedTag ? (
                                      <Chip
                                        label={selectedTag.name}
                                        size="small"
                                        onDelete={() => {
                                          field.onChange('');
                                          setTagSearch('');
                                        }}
                                        sx={{
                                          backgroundColor: selectedTag.color,
                                          color: '#fff',
                                          fontWeight: 500,
                                          '& .MuiChip-deleteIcon': {
                                            color: 'rgba(255,255,255,0.9)',
                                          },
                                        }}
                                      />
                                    ) : (
                                      params.InputProps.startAdornment
                                    ),
                                  }}
                                />
                              )}
                            />
                          );
                        }}
                      />
                    </Box>
                  )}

                  <Box className="flex flex-col pl-6 pb-6">
                    {!isUpdated && (
                      <div>
                        <Button variant="contained" className="whitespace-nowrap" color="primary" onClick={() => setShowForm(!showForm)}>
                          <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
                          <span className="hidden sm:flex mx-2">Adicionar nova origem</span>
                        </Button>
                      </div>
                    )}

                    {isUpdated && (
                      <div>
                        <Button variant="outlined" className="whitespace-nowrap" color="primary" onClick={() => handleCancelUpdate()}>
                          <span className="hidden sm:flex mx-2">Cancelar</span>
                        </Button>
                      </div>
                    )}
                  </Box>
                </>
              )}
            </Container>
          </div>
        }
      />
      <DefaultConfirmModal
        open={openModalDelete}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir esta origem? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
        onCancel={() => setOpenModalDelete(false)}
        onConfirm={confirmDeleteOrigin}
        loading={isDeletingOrigin}
      />
    </FormProvider>
  );
}

export default Origins;
