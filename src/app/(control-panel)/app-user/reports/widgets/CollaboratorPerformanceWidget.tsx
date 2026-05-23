import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import _ from 'lodash';
import ReactApexChart from 'react-apexcharts';

interface CollaboratorData {
  collaboratorName: string;
  collaboratorUid: string;
  currentAttendances: number;
  inProgressAttendances: number;
  finalizedAttendances: number;
  convertedAttendances: number;
}

interface CollaboratorPerformanceWidgetProps {
  collaboratorStats: CollaboratorData[];
  isLoading?: boolean;
}

function CollaboratorPerformanceWidget({ collaboratorStats, isLoading }: CollaboratorPerformanceWidgetProps) {
  const theme = useTheme();
  const [awaitRender, setAwaitRender] = useState(true);

  const prepareChartData = () => {
    if (!collaboratorStats || collaboratorStats.length === 0) {
      return {
        categories: [],
        series: [],
        maxValue: 10,
      };
    }

    const categories = collaboratorStats.map((collaborator) => collaborator.collaboratorName);

    const series = [
      {
        name: 'Todos Atendimentos',
        data: collaboratorStats.map((collaborator) => collaborator.currentAttendances || 0),
        color: theme.palette.primary.main,
      },
      {
        name: 'Em Progresso',
        data: collaboratorStats.map((collaborator) => collaborator.inProgressAttendances || 0),
        color: theme.palette.secondary.main,
      },
      {
        name: 'Finalizados',
        data: collaboratorStats.map((collaborator) => collaborator.finalizedAttendances || 0),
        color: theme.palette.success.main,
      },
    ];

    const allValues = collaboratorStats.flatMap((collaborator) => [
      collaborator.currentAttendances || 0,
      collaborator.inProgressAttendances || 0,
      collaborator.finalizedAttendances || 0,
    ]);

    const maxDataValue = Math.max(...allValues, 0);
    const calculatedMax = maxDataValue === 0 ? 10 : Math.ceil(maxDataValue * 2);
    const maxValue = Math.max(calculatedMax, 10);

    return { categories, series, maxValue };
  };

  const { categories, series, maxValue } = prepareChartData();

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'inherit',
      foreColor: 'inherit',
      height: '100%',
      type: 'bar',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.info.main],
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '60%',
        barHeight: '70%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: -6,
      style: {
        fontSize: '12px',
        colors: ['#fff'],
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['#fff'],
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40,
    },
    tooltip: {
      followCursor: true,
      theme: theme.palette.mode,
      y: {
        formatter: function (val) {
          return val.toString();
        },
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        offsetX: -16,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
      tickAmount: 10,
      min: 0,
      max: maxValue,
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontWeight: 'bold',
          fontSize: '12px',
        },
      },
    },
  };

  useEffect(() => {
    setAwaitRender(false);
  }, []);

  if (awaitRender || isLoading) {
    return null;
  }

  if (!collaboratorStats || collaboratorStats.length === 0) {
    return (
      <Paper className="flex flex-col flex-auto p-6 shadow-sm rounded-xl overflow-hidden">
        <Typography className="text-xl font-medium tracking-tight leading-6 truncate">Performance dos Colaboradores</Typography>
        <div className="flex flex-col flex-auto justify-center items-center p-8">
          <Typography color="text.secondary">Nenhum dado de colaborador disponível</Typography>
        </div>
      </Paper>
    );
  }

  return (
    <Paper className="flex flex-col flex-auto p-6 shadow-sm rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col sm:flex-row items-start justify-between">
          <Typography className="text-xl font-medium tracking-tight leading-6 truncate">Performance dos Colaboradores</Typography>
        </div>

        <div className="flex flex-col">
          <Typography className="font-medium mb-4" color="text.secondary">
            Atendimentos por Colaborador
          </Typography>
          <div className="flex flex-col flex-auto">
            <ReactApexChart
              className="flex-auto w-full"
              options={chartOptions}
              series={series}
              type="bar"
              height={Math.max(400, collaboratorStats.length * 80)}
            />
          </div>
        </div>

        {/* Resumo estatístico */}
        <div className="border-t border-divider pt-6">
          <Typography className="font-medium mb-4" color="text.secondary">
            Resumo Geral
          </Typography>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Typography variant="h6" color="primary.main" className="font-bold">
                {collaboratorStats.reduce((sum, c) => sum + (c.currentAttendances || 0), 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Atendimentos
              </Typography>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Typography variant="h6" color="secondary.main" className="font-bold">
                {collaboratorStats.reduce((sum, c) => sum + (c.inProgressAttendances || 0), 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total em Progresso
              </Typography>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Typography variant="h6" color="success.main" className="font-bold">
                {collaboratorStats.reduce((sum, c) => sum + (c.finalizedAttendances || 0), 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Finalizados
              </Typography>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Typography variant="h6" color="info.main" className="font-bold">
                {collaboratorStats.reduce((sum, c) => sum + (c.convertedAttendances || 0), 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Convertidos
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );
}

export default memo(CollaboratorPerformanceWidget);
