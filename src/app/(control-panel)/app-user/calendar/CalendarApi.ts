import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['calendar_events', 'calendar_event', 'calendar_labels', 'calendar_label'] as const;

const CalendarApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCalendarEvents: build.query<GetCalendarEventsApiResponse, GetCalendarEventsApiArg>({
        query: (query) => ({ url: `/calendars?${query}` }),
        providesTags: ['calendar_events'],
      }),
    }),
    overrideExisting: false,
  });

export type GetCalendarEventsApiResponse = GetCalendarsResponse;
export type GetCalendarEventsApiArg = string;

export type GetCalendarsResponse = {
  success: boolean;
  data: EventType[];
  msg: string;
};

export type EventType = {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  creator: {
    email: string;
    self: boolean;
  };
  organizer: {
    email: string;
    self: boolean;
  };
  created: string;
  updated: string;
  etag: string;
  eventType: string;
  htmlLink: string;
  iCalUID: string;
  kind: string;
  reminders: {
    useDefault: boolean;
  };
  sequence: number;
  status: string;
};

export const { useGetCalendarEventsQuery } = CalendarApi;

export default CalendarApi;

export type CalendarApiType = {
  [CalendarApi.reducerPath]: ReturnType<typeof CalendarApi.reducer>;
};
