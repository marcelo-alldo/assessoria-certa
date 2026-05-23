import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import FusePageSimple from '@fuse/core/FusePageSimple';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { styled } from '@mui/material/styles';
import { useGetStepsQuery, useUpdateStepPositionMutation } from '../../scrumboard/ScrumboardApi';
import { LinearProgress } from '@mui/material';
import { changeCard, changeStep, setStep, Step } from '../../scrumboard/board/boardSlice';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import BoardList from '../../scrumboard/board/board-list/BoardList';
import BoardAddList from '../../scrumboard/board/board-list/BoardAddList';
import BoardHeader from '../../scrumboard/board/BoardHeader';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { useClientChangeOwnerMutation, UpdateClientType, useUpdateClientMutation } from '@/store/api/clientsApi';
import { useGetConfigsQuery } from '@/store/api/configsApi';
import { useAddTagToClientMutation } from '@/store/api/tagsApi';
import { useToggleArchiveMutation } from '@/store/api/archiveApi';
import TagsDropdown from '@/components/TagsDropdown';
import { TextField, Box } from '@mui/material';

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
 * The board component.
 */
function Board() {
  const dispatch = useAppDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  const [isLoading, setIsLoading] = useState(false);

  // Sistema de scroll melhorado
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastScrollPositionRef = useRef<number>(0);
  const scrollKey = 'clientsBoardScrollPosition';

  // Sistema de auto-scroll contínuo
  const scrollAnimationRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const lastScrollTimeRef = useRef<number>(0);
  const SCROLL_ZONE = 100; // px da borda para ativar auto-scroll
  const SCROLL_SPEED = 1.5; // velocidade mais lenta para melhor compatibilidade
  const SCROLL_THROTTLE = 50; // ms entre scrolls para permitir recálculo

  // Sistema de persistência do scroll
  const restoreScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const savedPosition = localStorage.getItem(scrollKey);
    const targetPosition = savedPosition ? parseInt(savedPosition, 10) : lastScrollPositionRef.current;

    if (targetPosition > 0) {
      setTimeout(() => {
        if (container) {
          container.scrollTo({ left: targetPosition, behavior: 'smooth' });
          lastScrollPositionRef.current = targetPosition;
        }
      }, 100);
    }
  }, []);

  // Auto-scroll contínuo baseado na posição do mouse
  const performAutoScroll = useCallback(() => {
    if (!isDraggingRef.current) return;

    const container = scrollContainerRef.current;

    if (!container) return;

    const now = Date.now();

    // Throttle para permitir que a biblioteca recalcule as drop zones
    if (now - lastScrollTimeRef.current < SCROLL_THROTTLE) {
      scrollAnimationRef.current = requestAnimationFrame(performAutoScroll);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const mouseX = mousePositionRef.current.x;

    let scrollDirection = 0;
    let scrollIntensity = 0;

    // Detectar se o mouse está nas zonas de scroll
    if (mouseX < containerRect.left + SCROLL_ZONE) {
      // Zona esquerda - scroll para esquerda
      scrollDirection = -1;
      scrollIntensity = Math.min(1, (containerRect.left + SCROLL_ZONE - mouseX) / SCROLL_ZONE);
    } else if (mouseX > containerRect.right - SCROLL_ZONE) {
      // Zona direita - scroll para direita
      scrollDirection = 1;
      scrollIntensity = Math.min(1, (mouseX - (containerRect.right - SCROLL_ZONE)) / SCROLL_ZONE);
    }

    // Aplicar scroll se necessário
    if (scrollDirection !== 0) {
      const scrollAmount = SCROLL_SPEED * scrollIntensity * scrollDirection;

      // Usar scrollLeft direto para controle mais preciso
      const newScrollLeft = Math.max(0, container.scrollLeft + scrollAmount);
      container.scrollLeft = newScrollLeft;

      // Salvar posição e timestamp
      lastScrollPositionRef.current = newScrollLeft;
      lastScrollTimeRef.current = now;

      // Forçar recálculo das drop zones despachando evento de scroll
      const scrollEvent = new Event('scroll', { bubbles: true });
      container.dispatchEvent(scrollEvent);
    }
  }, []);

  // Rastrear posição do mouse durante drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const startAutoScroll = useCallback(() => {
    isDraggingRef.current = true;

    // Salvar posição antes do drag
    const container = scrollContainerRef.current;

    if (container) {
      lastScrollPositionRef.current = container.scrollLeft;
      localStorage.setItem(scrollKey, String(container.scrollLeft));
    }

    // Iniciar tracking do mouse e auto-scroll contínuo
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    scrollAnimationRef.current = requestAnimationFrame(performAutoScroll);
  }, [handleMouseMove, performAutoScroll]);

  const stopAutoScroll = useCallback(() => {
    isDraggingRef.current = false;

    // Parar auto-scroll e remover listeners
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    document.removeEventListener('mousemove', handleMouseMove);

    // Salvar posição final
    const container = scrollContainerRef.current;

    if (container) {
      localStorage.setItem(scrollKey, String(container.scrollLeft));
    }
  }, [handleMouseMove]);

  // Limpar recursos quando componente for desmontado
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }

      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  // Salvar posição durante scroll normal (não necessário no clients-scrumboard)
  // const handleScrollSave foi removido pois não é usado

  const {
    data: steps,
    isLoading: isLoadingSteps,
    isFetching: isFetchingSteps,
    refetch: refetchSteps,
  } = useGetStepsQuery(`clients=true`, { refetchOnMountOrArgChange: true, pollingInterval: 30000 });

  const stepSelector = useAppSelector((state) => state.boardSlice.steps);
  const boardSelector = useAppSelector((state) => state.boardSlice);

  // ========== MUTATIONS CENTRALIZADAS ==========
  // Change owner mutations
  const [changeClientOwner, { isLoading: isLoadingClientOwner }] = useClientChangeOwnerMutation();

  // Update mutations
  const [updateClient, { isLoading: isLoadingUpdateClient }] = useUpdateClientMutation();
  const [reorderStepClient] = useUpdateStepPositionMutation();

  // Tags mutations
  const [addTagToClient, { isLoading: isLoadingAddTagToClient }] = useAddTagToClientMutation();

  // Archive mutation
  const [toggleArchive, { isLoading: isLoadingArchive }] = useToggleArchiveMutation();

  // Config query
  const { data: config } = useGetConfigsQuery('key=WHATSAPP', { refetchOnMountOrArgChange: true });

  // Loading state centralizado - DEVE ser definido após as mutations
  const centralizedLoading = isLoadingClientOwner || isLoadingUpdateClient || isLoadingAddTagToClient || isLoadingArchive;

  useEffect(() => {
    if (steps) {
      dispatch(setStep({ steps: steps.data as unknown as Step[] }));
    }
  }, [dispatch, steps]);

  useEffect(() => {
    setIsLoading(isLoadingSteps || centralizedLoading);
  }, [isLoadingSteps, centralizedLoading]);

  useEffect(() => {
    setIsLoading(isFetchingSteps || centralizedLoading);
  }, [isFetchingSteps, centralizedLoading]);

  // ========== ESTADO CENTRALIZADO PARA TAGS ==========
  const [tagsState, setTagsState] = useState<{ anchorEl: HTMLElement | null; cardUid: string | null }>({
    anchorEl: null,
    cardUid: null,
  });

  // ========== ESTADO CENTRALIZADO PARA MODAL DE ANOTAÇÕES ==========
  const [notesState, setNotesState] = useState<{
    open: boolean;
    cardUid: string | null;
    value: string;
    type: 'leads' | 'clients' | null;
  }>({
    open: false,
    cardUid: null,
    value: '',
    type: null,
  });

  // ========== HANDLERS CENTRALIZADOS ==========

  // Handler para change owner
  const handleChangeOwner = useCallback(
    async (cardUid: string, _type: 'leads' | 'clients') => {
      try {
        const response = await changeClientOwner({ uid: cardUid }).unwrap();

        refetchSteps();
        dispatch(
          showMessage({
            message: response.msg,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      } catch (error: any) {
        dispatch(
          showMessage({
            message: (error as any)?.data?.msg || 'Erro ao alterar atendente',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      }
    },
    [changeClientOwner, refetchSteps, dispatch],
  );

  // Handler para tags
  const handleTagSelect = useCallback(
    async (cardUid: string, tagUid: string, tagName: string, _type: 'leads' | 'clients') => {
      try {
        await addTagToClient({ clientUid: cardUid, tagUid }).unwrap();

        dispatch(
          showMessage({
            message: `Tag "${tagName}" adicionada com sucesso!`,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
        refetchSteps();
      } catch (error: unknown) {
        dispatch(
          showMessage({
            message: (error as any)?.data?.msg || 'Erro ao adicionar tag',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      }
    },
    [addTagToClient, refetchSteps, dispatch],
  );

  // Handler para archive
  const handleArchiveToggle = useCallback(
    async (cardUid: string, currentArchived: boolean, type: 'leads' | 'clients') => {
      try {
        const response = await toggleArchive({ entity: type, uid: cardUid, archived: !currentArchived }).unwrap();
        dispatch(
          showMessage({
            message: response.msg || `${currentArchived ? 'Desarquivado' : 'Arquivado'} com sucesso!`,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
        refetchSteps();
      } catch (error: unknown) {
        dispatch(
          showMessage({
            message: (error as any)?.data?.msg || 'Erro ao arquivar/desarquivar',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      }
    },
    [toggleArchive, refetchSteps, dispatch],
  );

  // Handler para notes
  const handleUpdateNotes = useCallback(
    async (cardUid: string, notes: string, _type: 'leads' | 'clients') => {
      try {
        await updateClient({ uid: cardUid, profileUpdate: true, notes }).unwrap();

        dispatch(
          showMessage({
            message: 'Observações atualizadas com sucesso!',
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
        refetchSteps();
      } catch (error: unknown) {
        dispatch(
          showMessage({
            message: (error as any)?.data?.msg || 'Erro ao salvar observações',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      }
    },
    [updateClient, refetchSteps, dispatch],
  );

  // Handler para controle do TagsDropdown
  const handleTagsClick = useCallback((cardUid: string, event?: React.MouseEvent<HTMLElement>) => {
    if (event) event.stopPropagation();

    // Fechar qualquer menu ativo primeiro
    setTagsState({ anchorEl: null, cardUid: null });

    // pequeno delay para garantir que o estado seja atualizado
    setTimeout(() => {
      const anchorEl = document.getElementById(`tags-anchor-${cardUid}`);
      setTagsState({ anchorEl, cardUid });
    }, 100);
  }, []);

  const handleTagsClose = useCallback(() => {
    setTagsState({ anchorEl: null, cardUid: null });
  }, []);

  // ========== HANDLERS PARA MODAL DE ANOTAÇÕES ==========

  // Handler para abrir modal de anotações
  const handleNotesClick = useCallback(
    (cardUid: string, _type: 'leads' | 'clients') => {
      // Encontrar o card atual para obter as anotações
      const currentCard = stepSelector?.flatMap((step) => step.clients || []).find((card: any) => card.uid === cardUid);

      const currentNotes = currentCard?.notes || currentCard?.clientProfile?.notes || '';

      setNotesState({
        open: true,
        cardUid,
        value: currentNotes,
        type: 'clients',
      });
    },
    [stepSelector],
  );

  // Handler para fechar modal de anotações
  const handleNotesClose = useCallback(() => {
    setNotesState({
      open: false,
      cardUid: null,
      value: '',
      type: null,
    });
  }, []);

  // Handler para salvar anotações
  const handleNotesConfirm = useCallback(async () => {
    if (!notesState.cardUid || !notesState.type) return;

    try {
      await handleUpdateNotes(notesState.cardUid, notesState.value, notesState.type);
      handleNotesClose();
    } catch (_error) {
      // Erro já tratado na função handleUpdateNotes
    }
  }, [notesState.cardUid, notesState.type, notesState.value, handleUpdateNotes, handleNotesClose]);

  // Restaurar posição após mudanças nos dados
  useEffect(() => {
    if (steps?.data && !isLoading && !isFetchingSteps) {
      restoreScrollPosition();
    }
  }, [steps?.data, isLoading, isFetchingSteps, restoreScrollPosition]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;

      // dropped nowhere
      if (!destination) {
        return;
      }

      // did not move anywhere - can bail early
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      // Parar auto-scroll quando drag terminar
      stopAutoScroll();

      // reordering list
      if (result.type === 'list') {
        const boardSteps = boardSelector?.steps || [];
        const draggedStep = boardSteps[result.source.index];
        const destinationIndex = result.destination.index;
        const destinationStep = boardSteps[destinationIndex];

        // Bloqueia mover USER antes de qualquer DEFAULT
        if (
          draggedStep?.type === 'USER' &&
          destinationStep?.type === 'DEFAULT' &&
          destinationIndex < boardSteps.findIndex((s) => s.type === 'USER')
        ) {
          dispatch(
            showMessage({
              message: 'Não é possível mover etapas personalizadas antes das etapas padrão.',
              autoHideDuration: 3000,
              variant: 'warning',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
          return;
        }

        setIsLoading(true);
        dispatch(
          changeStep({
            fromPosition: result.source.index + 1,
            toPosition: result.destination.index + 1,
          }),
        );
        reorderStepClient({
          uid: result.draggableId,
          position: result.destination.index + 1,
        })
          .unwrap()
          .then((response) => {
            setIsLoading(false);
            refetchSteps();
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
            setIsLoading(false);
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
      }

      // reordering card
      if (result.type === 'card') {
        setIsLoading(true);
        dispatch(
          changeCard({
            fromStepUid: result.source.droppableId,
            toStepUid: result.destination.droppableId,
            cardUid: result.draggableId,
            position: result.destination.index + 1,
            type: 'client',
          }),
        );
        updateClient({
          uid: result.draggableId,
          position: result.destination.index + 1,
          changeStep: true,
          stepUid: result.destination.droppableId,
        } as UpdateClientType)
          .unwrap()
          .then(() => {
            setIsLoading(false);
            refetchSteps();
          })
          .catch((error) => {
            setIsLoading(false);
            refetchSteps();
            dispatch(
              showMessage({
                message: error.data.msg,
                autoHideDuration: 3000,
                variant: 'error',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
              }),
            );
          });
      }
    },
    [boardSelector?.steps, dispatch, refetchSteps, reorderStepClient, setIsLoading, updateClient, stopAutoScroll],
  );

  const dragMemo = useMemo(() => {
    return (
      <DragDropContext onDragEnd={onDragEnd} onDragStart={startAutoScroll}>
        <Droppable droppableId="list" type="list" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} className="flex py-4 md:py-6 px-2 md:px-3">
              {stepSelector?.map((step, index) => (
                <BoardList
                  step={step}
                  key={step.uid}
                  cards={step.clients}
                  index={index}
                  refetch={refetchSteps}
                  setLoading={setIsLoading}
                  type="clients"
                  // Props centralizadas
                  config={config}
                  onChangeOwner={handleChangeOwner}
                  onTagSelect={handleTagSelect}
                  onArchiveToggle={handleArchiveToggle}
                  onUpdateNotes={handleUpdateNotes}
                  centralizedLoading={centralizedLoading}
                  // Props para TagsDropdown
                  onTagsClick={handleTagsClick}
                  // Props para Modal de Anotações
                  onNotesClick={handleNotesClick}
                />
              ))}
              {provided.placeholder}
              <BoardAddList setLoading={setIsLoading} refetch={refetchSteps} type="clients" />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }, [
    stepSelector,
    onDragEnd,
    refetchSteps,
    startAutoScroll,
    centralizedLoading,
    config,
    handleArchiveToggle,
    handleChangeOwner,
    handleTagSelect,
    handleTagsClick,
    handleUpdateNotes,
    handleNotesClick,
  ]);

  return (
    <>
      <Root
        header={<BoardHeader refetch={refetchSteps} type="clients" />}
        content={
          <div ref={scrollContainerRef} className="flex flex-1 flex-col overflow-x-auto">
            {isLoading && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1200 }}>
                <LinearProgress color="secondary" />
              </div>
            )}
            {steps && steps.data.length > 0 && dragMemo}
          </div>
        }
        scroll={isMobile ? 'normal' : 'content'}
      />

      {/* TagsDropdown centralizado - apenas uma instância para todos os cards */}
      <TagsDropdown
        anchorEl={tagsState.anchorEl}
        open={Boolean(tagsState.anchorEl && tagsState.cardUid)}
        onClose={handleTagsClose}
        onTagSelect={(tag) => {
          if (tagsState.cardUid) {
            handleTagSelect(tagsState.cardUid, tag.uid, tag.name, 'clients');
          }
        }}
        cardTags={
          tagsState.cardUid && stepSelector
            ? (() => {
                // Encontrar o card atual baseado no cardUid
                const currentCard = stepSelector.flatMap((step) => step.clients || []).find((card: any) => card.uid === tagsState.cardUid);
                return currentCard?.clientTags?.map((item: any) => item.tag) || [];
              })()
            : []
        }
      />

      {/* Modal de anotações centralizada - apenas uma instância para todos os cards */}
      <DefaultConfirmModal
        open={notesState.open}
        title="Anotações"
        message={
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Anotações"
              value={notesState.value}
              onChange={(e) => setNotesState((prev) => ({ ...prev, value: e.target.value }))}
              fullWidth
              multiline
              minRows={4}
            />
          </Box>
        }
        cancelText="Cancelar"
        confirmText="Salvar"
        loading={centralizedLoading}
        onConfirm={handleNotesConfirm}
        onCancel={handleNotesClose}
        maxWidth="sm"
      />
    </>
  );
}

export default Board;
