import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['reminders', 'reminder_detail'] as const;

const RemindersApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createReminder: build.mutation<CreateReminderApiResponse, CreateReminderApiArg>({
        query: (reminder) => ({
          url: `/reminders`,
          method: 'POST',
          body: reminder,
        }),
        invalidatesTags: ['reminders'],
      }),
      getReminders: build.query<GetRemindersApiResponse, any>({
        query: (queryArg) => ({
          url: `/reminders?${queryArg}`,
          method: 'GET',
          params: queryArg,
        }),
        providesTags: ['reminders'],
      }),
      updateReminder: build.mutation<UpdateReminderApiResponse, UpdateReminderApiArg>({
        query: ({ uid, ...reminder }) => ({
          url: `/reminders/${uid}`,
          method: 'PUT',
          body: reminder,
        }),
        invalidatesTags: ['reminders', 'reminder_detail'],
      }),
      deleteReminder: build.mutation<DeleteReminderApiResponse, DeleteReminderApiArg>({
        query: (id) => ({
          url: `/reminders/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['reminders'],
      }),
    }),
    overrideExisting: false,
  });

export default RemindersApi;

export type RemindersApiType = {
  [RemindersApi.reducerPath]: ReturnType<typeof RemindersApi.reducer>;
};

// Types
export interface Reminder {
  uid: string;
  title: string;
  description?: string | null;
  dateTime: string;
  priority: any;
  visualized: boolean;
  notified: boolean;
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
  userUid: string;
}

export interface ReminderInput {
  title: string;
  description?: string;
  dateTime: string;
  priority?: any;
  visualized?: boolean;
}

export interface UpdateReminderInput extends Partial<ReminderInput> {
  uid: string;
  notified?: boolean;
}

// Response Types
export type CreateReminderApiResponse = {
  success: boolean;
  msg: string;
  data: Reminder;
};

export type GetRemindersApiResponse = {
  success: boolean;
  msg: string;
  data: {
    reminders: Reminder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type UpdateReminderApiResponse = {
  success: boolean;
  msg: string;
  data: Reminder;
};

export type DeleteReminderApiResponse = {
  success: boolean;
  msg: string;
};

// Argument Types
export type CreateReminderApiArg = ReminderInput;
export type GetReminderByIdApiArg = string;
export type UpdateReminderApiArg = UpdateReminderInput;
export type DeleteReminderApiArg = string;

// Export hooks
export const { useCreateReminderMutation, useGetRemindersQuery, useUpdateReminderMutation, useDeleteReminderMutation } = RemindersApi;
