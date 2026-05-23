import { Controller, useForm } from 'react-hook-form';
import { darken } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useEffect, useState, MouseEvent } from 'react';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateStepMutation } from '../../ScrumboardApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { addStep } from '../boardSlice';
// type FormType = {
// 	title: ScrumboardList['title'];
// };

const defaultValues = {
  title: '',
};

/**
 * Form Validation Schema
 */
const schema = z.object({
  title: z.string().min(1, 'Você deve inserir um título').nonempty('Você deve inserir um título'),
});

type FormType = z.infer<typeof schema>;

/**
 * The board add list component.
 */

interface BoardAddListProps {
  setLoading: (loading: boolean) => void;
  refetch: () => void;
  type: 'clients' | 'leads';
}

function BoardAddList({ setLoading, refetch, type }: BoardAddListProps) {
  const dispatch = useAppDispatch();
  const stepsSelector = useAppSelector((state) => state.boardSlice.steps);

  const [createStep, { isLoading: isLoadingCreate }] = useCreateStepMutation();

  useEffect(() => {
    setLoading(isLoadingCreate);
  }, [isLoadingCreate]);

  const [formOpen, setFormOpen] = useState(false);

  const { control, formState, handleSubmit, reset } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields } = formState;

  useEffect(() => {
    if (!formOpen) {
      reset(defaultValues);
    }
  }, [formOpen, reset]);

  function handleOpenForm(ev: MouseEvent<HTMLButtonElement>) {
    ev.stopPropagation();
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
  }

  function onSubmit(data: FormType) {
    // Usa o stepsSelector do Redux para pegar a última posição
    const steps = stepsSelector.length ? Math.max(...stepsSelector.filter((step) => step.type !== 'DEFAULT').map((s) => s.position)) : -1;
    const lastPosition = steps >= 3 ? steps + 1 : 3;

    const newStep = {
      uid: crypto.randomUUID(),
      name: data.title,
      position: lastPosition,
      userUid: null,
      type: 'USER',
      description: null,
      enable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leads: [],
      clients: [],
      stepType: type === 'clients' ? 'CLIENT' : 'LEAD',
    };
    dispatch(addStep(newStep));
    handleCloseForm();
    setLoading(true);
    createStep({ name: data.title, type })
      .then((res) => {
        let msg = 'Etapa criada com sucesso!';

        if (res && typeof res === 'object' && 'data' in res && res.data && typeof res.data === 'object' && 'msg' in res.data) {
          msg = res.data.msg || msg;
        }

        refetch();
        dispatch(
          showMessage({
            message: msg,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      })
      .catch((err) => {
        let msg = 'Erro ao criar etapa';

        if (err && typeof err === 'object' && err !== null) {
          if ('data' in err && err.data && typeof err.data === 'object' && 'msg' in err.data) {
            msg = err.data.msg || msg;
          } else if ('message' in err && typeof err.message === 'string') {
            msg = err.message;
          }
        }

        dispatch(
          showMessage({
            message: msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
        refetch();
      });
  }

  return (
    <div>
      <Card
        className="w-80 mx-2 sm:mx-3 rounded-lg shadow-0"
        square
        sx={{
          backgroundColor: (theme) => darken(theme.palette.background.default, theme.palette.mode === 'light' ? 0.03 : 0.25),
        }}
      >
        {formOpen ? (
          <ClickAwayListener onClickAway={handleCloseForm}>
            <form className="p-3" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-2"
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="Título da etapa*"
                    autoFocus
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleCloseForm} size="small">
                              <FuseSvgIcon size={18}>heroicons-outline:x-mark</FuseSvgIcon>
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  disabled={isLoadingCreate || _.isEmpty(dirtyFields) || !isValid}
                  size="small"
                >
                  Adicionar
                </Button>
              </div>
            </form>
          </ClickAwayListener>
        ) : (
          <Button
            onClick={handleOpenForm}
            classes={{
              root: 'font-medium w-full rounded-lg p-6 justify-start',
            }}
            startIcon={<FuseSvgIcon>heroicons-outline:plus-circle</FuseSvgIcon>}
            sx={{
              backgroundColor: 'divider',
              '&:hover, &:focus': {
                backgroundColor: (theme) => `rgba(${theme.vars.palette.dividerChannel} / 0.8)`,
              },
              color: 'text.secondary',
            }}
          >
            Adicionar etapa
          </Button>
        )}
      </Card>
    </div>
  );
}

export default BoardAddList;
