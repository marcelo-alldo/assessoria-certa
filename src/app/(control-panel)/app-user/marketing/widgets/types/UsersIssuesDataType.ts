type UsersIssueOverviewData = Record<string, number>;

type UsersIssueSeriesData = {
  name: string;
  type: string;
  data: number[];
};

/**
 * The type definition for the data used to populate the github issues chart.
 */
type UsersIssuesDataType = {
  overview: Record<string, UsersIssueOverviewData>;
  ranges: Record<string, string>;
  labels: string[];
  series: Record<string, UsersIssueSeriesData[]>;
};

export default UsersIssuesDataType;
