import { apiService as api } from 'src/store/apiService';
import _ from 'lodash';
import BoardModel from './models/BoardModel';
import CardModel from './models/CardModel';
import reorder, { reorderQuoteMap } from './utils/reorder';
import { LeadType } from '@/store/api/leadsApi';

export const addTagTypes = [
  'scrumboard_members',
  'scrumboard_board_lists',
  'scrumboard_member',
  'scrumboard_board_list',
  'scrumboard_board_labels',
  'scrumboard_board_label',
  'scrumboard_board_cards',
  'scrumboard_board_card',
  'scrumboard_boards',
  'scrumboard_board',
  'create_steps',
  'update_steps',
  'delete_steps',
  'get_steps',
  'change_card_order',
  'change_card_order_clients',
] as const;

const ScrumboardApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createStep: build.mutation<CreateStepApiResponse, CreateStepApiArg>({
        query: ({ name, type }) => ({
          url: `/steps`,
          method: 'POST',
          body: { name, type },
        }),
        invalidatesTags: ['create_steps'],
      }),
      updateStepName: build.mutation<UpdateStepNameApiResponse, UpdateStepNameApiArg>({
        query: (body) => ({
          url: `/steps/${body.uid}`,
          method: 'PUT',
          body,
        }),
        invalidatesTags: ['update_steps'],
      }),
      updateStepPosition: build.mutation<UpdateStepPositionApiResponse, UpdateStepPositionApiArg>({
        query: (body) => ({
          url: `/steps/${body.uid}`,
          method: 'PUT',
          body,
        }),
        invalidatesTags: ['update_steps'],
      }),
      deleteStep: build.mutation<DeleteStepApiResponse, DeleteStepApiArg>({
        query: (uid) => ({
          url: `/steps/${uid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['delete_steps'],
      }),
      getSteps: build.query<GetStepsApiResponse, GetStepsApiArg>({
        query: (query) => ({ url: `/steps?${query}` }),
        providesTags: ['get_steps'],
      }),

      // IGNORAR
      getScrumboardMembers: build.query<void, void>({
        query: () => ({ url: `/api/mock/scrumboard/members` }),
        providesTags: ['scrumboard_members'],
      }),
      createScrumboardMember: build.mutation<void, void>({
        query: (member) => ({
          url: `/api/mock/scrumboard/members`,
          method: 'POST',
          body: member,
        }),
        invalidatesTags: ['scrumboard_members'],
      }),
      getScrumboardMember: build.query<void, void>({
        query: (memberId) => ({
          url: `/api/mock/scrumboard/members/${memberId}`,
        }),
        providesTags: ['scrumboard_member'],
      }),
      updateScrumboardMember: build.mutation<void, string>({
        query: (member) => ({
          url: `/api/mock/scrumboard/members/${member}`,
          method: 'PUT',
          body: member,
        }),
        invalidatesTags: ['scrumboard_member'],
      }),
      deleteScrumboardMember: build.mutation<void, void>({
        query: (memberId) => ({
          url: `/api/mock/scrumboard/members/${memberId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['scrumboard_members'],
      }),
      getScrumboardBoardLists: build.query<void, void>({
        query: (boardId) => ({
          url: `/api/mock/scrumboard/lists`,
          params: { boardId },
        }),
        providesTags: ['scrumboard_board_lists'],
      }),
      createScrumboardBoardList: build.mutation<void, void>({
        query: (listItem) => ({
          url: `/api/mock/scrumboard/lists`,
          method: 'POST',
          body: listItem,
        }),
        invalidatesTags: ['scrumboard_board_lists', 'scrumboard_board'],
      }),
      getScrumboardBoardList: build.query<void, void>({
        query: (listId) => ({
          url: `/api/mock/scrumboard/lists/${listId}`,
        }),
        providesTags: ['scrumboard_board_lists', 'scrumboard_board_list'],
      }),
      updateScrumboardBoardList: build.mutation<void, string>({
        query: (list) => ({
          url: `/api/mock/scrumboard/lists/${list}`,
          method: 'PUT',
          body: list,
        }),
        invalidatesTags: ['scrumboard_board_lists', 'scrumboard_board_list'],
      }),
      deleteScrumboardBoardList: build.mutation<void, void>({
        query: (listId) => ({
          url: `/api/mock/scrumboard/lists/${listId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['scrumboard_board_lists', 'scrumboard_board'],
      }),
      getScrumboardBoardLabels: build.query<void, void>({
        query: (boardId) => ({
          url: `/api/mock/scrumboard/labels`,
          params: { boardId },
        }),
        providesTags: ['scrumboard_board_labels'],
      }),
      createScrumboardBoardLabel: build.mutation<void, string>({
        query: (queryArg) => ({
          url: `/api/mock/scrumboard/labels`,
          method: 'POST',
          body: { boardId: queryArg },
        }),
        invalidatesTags: ['scrumboard_board_labels'],
      }),
      getScrumboardBoardLabel: build.query<void, void>({
        query: (labelId) => ({
          url: `/api/mock/scrumboard/labels/${labelId}`,
        }),
        providesTags: ['scrumboard_board_label'],
      }),
      updateScrumboardBoardLabel: build.mutation<void, string>({
        query: (label) => ({
          url: `/api/mock/scrumboard/labels/${label}`,
          method: 'PUT',
          body: label,
        }),
        invalidatesTags: ['scrumboard_board_label'],
      }),
      deleteScrumboardBoardLabel: build.mutation<void, void>({
        query: (labelId) => ({
          url: `/api/mock/scrumboard/labels/${labelId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['scrumboard_board_labels'],
      }),
      getScrumboardBoardCards: build.query<void, void>({
        query: (boardId) => ({
          url: `/api/mock/scrumboard/cards`,
          params: { boardId },
        }),
        providesTags: ['scrumboard_board_cards'],
      }),
      createScrumboardBoardCard: build.mutation<void, string>({
        query: (queryArg) => ({
          url: `/api/mock/scrumboard/cards`,
          method: 'POST',
          body: CardModel({
            boardId: queryArg,
          }),
        }),
        invalidatesTags: ['scrumboard_board_cards', 'scrumboard_board'],
      }),
      updateScrumboardBoardCard: build.mutation<void, string>({
        query: (card) => ({
          url: `/api/mock/scrumboard/cards/${card}`,
          method: 'PUT',
          body: card,
        }),
        invalidatesTags: ['scrumboard_board_cards'],
      }),
      deleteScrumboardBoardCard: build.mutation<void, void>({
        query: (cardId) => ({
          url: `/api/mock/scrumboard/cards/${cardId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['scrumboard_board_cards'],
      }),
      getScrumboardBoards: build.query<void, void>({
        query: () => ({ url: `/api/mock/scrumboard/boards` }),
        providesTags: ['scrumboard_boards'],
      }),
      createScrumboardBoard: build.mutation<void, void>({
        query: (board) => ({
          url: `/api/mock/scrumboard/boards`,
          method: 'POST',
          body: BoardModel(board),
        }),
        invalidatesTags: ['scrumboard_boards', 'scrumboard_board'],
      }),
      getScrumboardBoard: build.query<void, void>({
        query: (boardId) => ({
          url: `/api/mock/scrumboard/boards/${boardId}`,
        }),
        providesTags: ['scrumboard_board'],
      }),
      updateScrumboardBoard: build.mutation<void, string>({
        query: (board) => ({
          url: `/api/mock/scrumboard/boards/${board}`,
          method: 'PUT',
          body: board,
        }),
        invalidatesTags: ['scrumboard_board', 'scrumboard_boards'],
      }),
      deleteScrumboardBoard: build.mutation<void, void>({
        query: (boardId) => ({
          url: `/api/mock/scrumboard/boards/${boardId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['scrumboard_boards'],
      }),
      updateScrumboardBoardListOrder: build.mutation<void, { orderResult; board }>({
        query: (queryArg) => {
          const { orderResult, board } = queryArg;

          const ordered = reorder(_.merge([], board.lists), orderResult.source.index, orderResult.destination.index);

          return {
            url: `/api/mock/scrumboard/boards/${board.id}`,
            method: 'PUT',
            body: { ...board, lists: ordered },
          };
        },
        onQueryStarted: async (queryArg, { dispatch, queryFulfilled }) => {
          const { orderResult, board } = queryArg;

          // Optimistically update the state
          const ordered = reorder(_.merge([], board.lists), orderResult.source.index, orderResult.destination.index) as [];

          try {
            await queryFulfilled; // Wait for the mutation to complete
          } catch {
            // Handle error if needed (e.g., revert the optimistic update)
          }
        },
        invalidatesTags: ['scrumboard_boards', 'scrumboard_board'],
      }),
      updateScrumboardBoardCardOrder: build.mutation<void, { orderResult; board }>({
        query: (queryArg) => {
          const { orderResult, board } = queryArg;

          const ordered = reorderQuoteMap(_.merge([], board.lists), orderResult.source, orderResult.destination);

          return {
            url: `/api/mock/scrumboard/boards/${board.id}`,
            method: 'PUT',
            body: { ...board, lists: ordered },
          };
        },
        onQueryStarted: async (queryArg, { dispatch, queryFulfilled }) => {
          const { orderResult, board } = queryArg;

          // Optimistically update the state
          const ordered = reorderQuoteMap(_.merge([], board.lists), orderResult.source, orderResult.destination);

          try {
            await queryFulfilled; // Wait for the mutation to complete
          } catch {
            // Handle error if needed (e.g., revert the optimistic update)
          }
        },
        invalidatesTags: ['scrumboard_board_list', 'scrumboard_board'],
      }),
    }),
    overrideExisting: false,
  });

export default ScrumboardApi;

export type CreateStepApiResponse = DefaultResponse;
export type CreateStepApiArg = {
  name: string;
  type: 'clients' | 'leads';
};

export type GetStepsApiResponse = StepsResponse;
export type GetStepsApiArg = string;

export type ChangeCardOrderApiResponse = DefaultResponse;
export type ChangeCardOrderApiArg = {
  uid: string;
  stepUid: string;
  position: number;
};

export type UpdateStepNameApiResponse = DefaultResponse;
export type UpdateStepNameApiArg = {
  uid: string;
  name?: string;
  messageSend?: boolean;
  messageTemplateUid?: string;
  sendMessageAt?: string;
};

export type UpdateStepPositionApiResponse = DefaultResponse;
export type UpdateStepPositionApiArg = {
  uid: string;
  position: number;
};

export type DeleteStepApiResponse = DefaultResponse;
export type DeleteStepApiArg = string;

export type DefaultResponse = {
  success: string;
  msg: string;
};

export type StepsType = {
  uid: string;
  name: string;
  position: number;
  userUid: string | null;
  type: string;
  description: string | null;
  enable: boolean;
  createdAt: string;
  updatedAt: string;
  leads: LeadType[];
};

export type StepsResponse = {
  data: StepsType[];
  msg: string;
  success: boolean;
};
export type ScrumboardList = {
  uid: string;
  boardId: string;
  title: string;
  leads: LeadType[];
  type: string;
  name: string;
  messageSend?: boolean;
  messageTemplateUid?: string | null;
};

export type ScrumboardApiType = {
  [ScrumboardApi.reducerPath]: ReturnType<typeof ScrumboardApi.reducer>;
};

export const {
  useCreateStepMutation,
  useGetStepsQuery,
  useUpdateStepNameMutation,
  useUpdateStepPositionMutation,
  useDeleteStepMutation,

  //IGNORAR
  useGetScrumboardMembersQuery,
  useCreateScrumboardMemberMutation,
  useGetScrumboardBoardListsQuery,
  useCreateScrumboardBoardListMutation,
  useGetScrumboardMemberQuery,
  useUpdateScrumboardMemberMutation,
  useDeleteScrumboardMemberMutation,
  useGetScrumboardBoardListQuery,
  useUpdateScrumboardBoardListMutation,
  useDeleteScrumboardBoardListMutation,
  useGetScrumboardBoardLabelsQuery,
  useCreateScrumboardBoardLabelMutation,
  useGetScrumboardBoardLabelQuery,
  useUpdateScrumboardBoardLabelMutation,
  useDeleteScrumboardBoardLabelMutation,
  useGetScrumboardBoardCardsQuery,
  useCreateScrumboardBoardCardMutation,
  useUpdateScrumboardBoardCardMutation,
  useDeleteScrumboardBoardCardMutation,
  useGetScrumboardBoardsQuery,
  useCreateScrumboardBoardMutation,
  useGetScrumboardBoardQuery,
  useUpdateScrumboardBoardMutation,
  useDeleteScrumboardBoardMutation,
  useUpdateScrumboardBoardListOrderMutation,
  useUpdateScrumboardBoardCardOrderMutation,
} = ScrumboardApi;
