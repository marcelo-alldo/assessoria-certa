import Card from '@mui/material/Card';
import { lighten, styled } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import clsx from 'clsx';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import BoardCard from '../board-card/BoardCard';
import BoardListHeader from './BoardListHeader';
import { LeadType } from '@/store/api/leadsApi';
import { ClientType } from '@/store/api/clientsApi';
import { Card as CardType } from '../boardSlice';
import { Button, CircularProgress } from '@mui/material';

const StyledCard = styled(Card)(({ theme }) => ({
  '&': {
    transitionProperty: 'box-shadow',
    transitionDuration: theme.transitions.duration.short,
    transitionTimingFunction: theme.transitions.easing.easeInOut,
  },
}));

type BoardListProps = {
  step: {
    uid: string;
    type: string;
    _count?: {
      leads?: number;
      clients?: number;
    };
    messageTemplateUid?: string | null;
    messageSend?: boolean;
    sendMessageAt?: string;
  };
  cards: LeadType[] | ClientType[] | CardType[];
  index: number;
  refetch: () => void;
  setLoading: (loading: boolean) => void;
  isLoading?: boolean;
  setLeadPageSize?: (size: number | ((prev: number) => number)) => void;
  leadPageSize?: number;
  type: 'leads' | 'clients';
  // Props centralizadas do Board
  config?: any;
  onChangeOwner?: (cardUid: string, type: 'leads' | 'clients') => Promise<void>;
  onTagSelect?: (cardUid: string, tagUid: string, tagName: string, type: 'leads' | 'clients') => Promise<void>;
  onArchiveToggle?: (cardUid: string, currentArchived: boolean, type: 'leads' | 'clients') => Promise<void>;
  onUpdateNotes?: (cardUid: string, notes: string, type: 'leads' | 'clients') => Promise<void>;
  centralizedLoading?: boolean;
  // Props para TagsDropdown (centralizadas)
  onTagsClick?: (cardUid: string, event?: React.MouseEvent<HTMLElement>) => void;
  // Props para Modal de Anotações (centralizadas)
  onNotesClick?: (cardUid: string, type: 'leads' | 'clients') => void;
};

/**
 * The board list component.
 */
function BoardList(props: BoardListProps) {
  const {
    step,
    cards,
    index,
    isLoading,
    refetch,
    setLoading,
    type,
    setLeadPageSize,
    config,
    onChangeOwner,
    onTagSelect,
    onArchiveToggle,
    onUpdateNotes,
    centralizedLoading,
    onTagsClick,
    onNotesClick,
  } = props;

  if (!cards) {
    return null;
  }

  return (
    <Draggable draggableId={step?.uid} isDragDisabled={step?.type === 'DEFAULT' || step?.type === 'ASSESSOR'} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <StyledCard
            sx={(theme) => ({
              backgroundColor: lighten(theme.palette.background.default, 0.02),
              ...theme.applyStyles('light', {
                backgroundColor: lighten(theme.palette.background.default, 0.4),
              }),
            })}
            className={clsx(snapshot.isDragging ? 'shadow-lg' : 'shadow-0', 'w-64 sm:w-80 mx-2 max-h-full flex flex-col rounded-lg border')}
            square
          >
            <BoardListHeader
              list={step}
              totalCards={step?._count?.leads || step?._count?.clients || 0}
              boardId={step?.uid}
              className="border-b-1"
              handleProps={provided.dragHandleProps}
              messageSend={step?.messageSend}
              messageTemplateUid={step?.messageTemplateUid}
              sendMessageAt={step?.sendMessageAt}
              refetch={refetch}
              setLoading={setLoading}
            />

            {/* <CardContent className="flex flex-col flex-auto min-h-0 w-full p-0 overflow-auto" ref={contentScrollEl} sx={{ maxHeight: '70vh' }}> */}
            <CardContent className="flex flex-col flex-auto min-h-0 w-full p-0 overflow-auto" sx={{ maxHeight: '70vh' }}>
              <Droppable droppableId={step?.uid} direction="vertical" type="card">
                {(_provided) => (
                  <div ref={_provided.innerRef} className="flex flex-col w-full h-full p-3 min-h-0.25">
                    {cards.map((card, index) => (
                      <BoardCard
                        key={card.uid}
                        card={card}
                        boardId={step?.uid}
                        index={index}
                        refetch={refetch}
                        setLoading={setLoading}
                        type={type}
                        // Props centralizadas
                        config={config}
                        onChangeOwner={onChangeOwner}
                        onTagSelect={onTagSelect}
                        onArchiveToggle={onArchiveToggle}
                        onUpdateNotes={onUpdateNotes}
                        centralizedLoading={centralizedLoading}
                        // Props para TagsDropdown
                        onTagsClick={onTagsClick}
                        // Props para Modal de Anotações
                        onNotesClick={onNotesClick}
                      />
                    ))}
                    {_provided.placeholder}
                    <div className="pb-4 flex items-center justify-center">
                      {step?._count?.leads > cards.length && (
                        <Button
                          disabled={isLoading}
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={() => setLeadPageSize((prev) => prev + 20)}
                          className="m-2"
                        >
                          {isLoading ? <CircularProgress size={20} /> : 'Carregar mais'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            </CardContent>
          </StyledCard>
        </div>
      )}
    </Draggable>
  );
}

export default BoardList;
