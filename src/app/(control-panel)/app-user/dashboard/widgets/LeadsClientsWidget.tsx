import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import _ from 'lodash';
import FuseTabs from 'src/components/tabs/FuseTabs';
import FuseTab from 'src/components/tabs/FuseTab';
import ReactApexChart from 'react-apexcharts';
import UsersIssuesDataType from './types/UsersIssuesDataType';

/**
 * The LeadsClientsWidget widget.
 */

interface LeadsClientsWidgetProps {
  usersIssuesData: UsersIssuesDataType;
}

function LeadsClientsWidget({ usersIssuesData }: LeadsClientsWidgetProps) {
  const theme = useTheme();
  const [awaitRender, setAwaitRender] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  // Substitui o uso do widgets?.githubIssues pelo mock
  const widget = usersIssuesData;
  const { overview, series, ranges, labels } = widget;
  const currentRange = Object.keys(ranges)[tabValue];
  const currentMonth = new Date().getMonth();
  const totalLeadsMesAtual = series?.[currentRange]?.[0]?.data?.[currentMonth] || 0;
  const totalClientesMesAtual = series?.[currentRange]?.[1]?.data?.[currentMonth] || 0;

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'inherit',
      foreColor: 'inherit',
      height: '100%',
      type: 'line',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    labels,
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0],
      background: {
        borderWidth: 0,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
    },
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
      },
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
        },
      },
    },
    stroke: {
      width: [3, 0],
    },
    tooltip: {
      followCursor: true,
      theme: theme.palette.mode,
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        color: theme.palette.divider,
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        offsetX: -16,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
  };

  useEffect(() => {
    setAwaitRender(false);
  }, []);

  if (awaitRender) {
    return null;
  }

  return (
    <Paper className="flex flex-col flex-auto p-6 shadow-sm rounded-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <Typography className="text-xl font-medium tracking-tight leading-6 truncate">Leads x Clientes por mês</Typography>
        <div className="mt-3 sm:mt-0">
          <FuseTabs value={tabValue} onChange={(_ev, value: number) => setTabValue(value)}>
            {Object.entries(ranges).map(([key, label], index) => (
              <FuseTab key={key} value={index} label={label} />
            ))}
          </FuseTabs>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 grid-flow-row gap-6 w-full mt-8 sm:mt-4">
        <div className="flex flex-col flex-auto">
          <Typography className="font-medium" color="text.secondary">
            Leads x Clientes
          </Typography>
          <div className="flex flex-col flex-auto">
            <ReactApexChart className="flex-auto w-full" options={chartOptions} series={_.cloneDeep(series[currentRange])} height={320} />
          </div>
        </div>
        <div className="flex flex-col">
          <Typography className="font-medium" color="text.secondary">
            Visão geral
          </Typography>
          <div className="flex-auto grid grid-cols-4 gap-4 mt-6">
            <div
              className="col-span-4 flex flex-col items-center justify-center py-8 px-1 rounded-xl"
              style={{ backgroundColor: theme.palette.primary.main, color: theme.palette.secondary.main }}
            >
              <Typography className="text-5xl sm:text-7xl font-semibold leading-none tracking-tight">{totalLeadsMesAtual}</Typography>
              <Typography className="mt-1 text-sm sm:text-lg font-medium">Leads do mês</Typography>
            </div>
            <div
              className="col-span-4 flex flex-col items-center justify-center py-8 px-1 rounded-xl"
              style={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.primary.main }}
            >
              <Typography className="text-5xl sm:text-7xl font-semibold leading-none tracking-tight">{totalClientesMesAtual}</Typography>
              <Typography className="mt-1 text-sm sm:text-lg font-medium">Clientes do mês</Typography>
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );
}

export default memo(LeadsClientsWidget);
