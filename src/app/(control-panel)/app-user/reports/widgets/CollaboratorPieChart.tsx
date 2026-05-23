import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';

interface CollaboratorData {
  collaboratorName: string;
  collaboratorUid: string;
  currentAttendances: number;
  inProgressAttendances: number;
  finalizedAttendances: number;
  convertedAttendances: number;
}

interface CollaboratorPieChartProps {
  collaborator: CollaboratorData;
  color: string;
}

/**
 * Gráfico de pizza para mostrar atendimentos vs conversões por colaborador
 */
function CollaboratorPieChart({ collaborator, color }: CollaboratorPieChartProps) {
  const theme = useTheme();
  const [awaitRender, setAwaitRender] = useState(true);

  // Calcular dados para o gráfico
  const totalAttendances = collaborator.currentAttendances || 0;
  const convertedAttendances = collaborator.convertedAttendances || 0;
  const nonConvertedAttendances = Math.max(0, totalAttendances - convertedAttendances);

  // Garantir que os dados sejam válidos para o gráfico
  const series = totalAttendances > 0 ? [convertedAttendances, nonConvertedAttendances] : [0, 1];
  const labels = ['Convertidos', 'Não Convertidos'];

  // Gerar cores baseadas na cor principal do colaborador
  const generateColors = (baseColor: string) => {
    return [
      baseColor, // Cor principal para convertidos
      theme.palette.grey[300], // Cor cinza para não convertidos
    ];
  };

  const chartOptions: ApexOptions = {
    chart: {
      animations: {
        speed: 400,
        animateGradually: {
          enabled: false,
        },
      },
      fontFamily: 'inherit',
      foreColor: 'inherit',
      height: '100%',
      type: 'donut',
      sparkline: {
        enabled: true,
      },
    },
    colors: generateColors(color),
    labels,
    plotOptions: {
      pie: {
        customScale: 0.9,
        expandOnClick: false,
        donut: {
          size: '70%',
        },
      },
    },
    stroke: {
      colors: [theme.palette.background.paper],
    },
    series,
    states: {
      hover: {
        filter: {
          type: 'none',
        },
      },
      active: {
        filter: {
          type: 'none',
        },
      },
    },
    tooltip: {
      enabled: true,
      fillSeriesColor: false,
      theme: 'dark',
      custom: ({ seriesIndex, w }: { seriesIndex: number; w: { config: { colors: string[]; labels: string[]; series: number[] } } }) => {
        const value = w.config.series[seriesIndex];
        const percentage = totalAttendances > 0 ? ((value / totalAttendances) * 100).toFixed(1) : '0';
        return `<div class="flex items-center h-32 min-h-32 max-h-32 px-12">
          <div class="w-12 h-12 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
          <div class="ml-8 text-md leading-none">${w?.config?.labels[seriesIndex]}:</div>
          <div class="ml-8 text-md font-bold leading-none">${value} (${percentage}%)</div>
        </div>`;
      },
    },
  };

  useEffect(() => {
    setAwaitRender(false);
  }, []);

  // Re-renderizar quando os dados do colaborador mudarem
  useEffect(() => {
    setAwaitRender(true);
    const timer = setTimeout(() => setAwaitRender(false), 100);
    return () => clearTimeout(timer);
  }, [collaborator.currentAttendances, collaborator.convertedAttendances, collaborator.inProgressAttendances, collaborator.finalizedAttendances]);

  if (awaitRender) {
    return null;
  }

  if (totalAttendances === 0) {
    return (
      <Box className="flex flex-col">
        <div className="flex items-center justify-center h-32 mb-2">
          <Typography variant="body2" color="text.secondary">
            Nenhum atendimento
          </Typography>
        </div>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col">
      <div className="flex flex-col flex-auto h-32 mb-2">
        <ReactApexChart
          className="flex flex-auto items-center justify-center w-full h-full"
          options={chartOptions}
          series={series}
          type={chartOptions.chart?.type}
          height="128px"
        />
      </div>

      <div className="mt-2">
        <div className="-my-1 divide-y divide-gray-100">
          {series?.map((value, i) => {
            if (totalAttendances === 0 && i === 1) return null;

            const percentage = totalAttendances > 0 ? ((value / totalAttendances) * 100).toFixed(1) : '0';

            return (
              <div className="grid grid-cols-3 py-1" key={i}>
                <div className="flex items-center">
                  <Box className="shrink-0 w-2 h-2 rounded-full" sx={{ backgroundColor: chartOptions?.colors?.[i] as string }} />
                  <Typography className="ml-2 truncate text-sm">{labels?.[i]}</Typography>
                </div>
                <Typography className="font-medium text-right text-sm">{value.toLocaleString()}</Typography>
                <Typography className="text-right text-sm" color="text.secondary">
                  {percentage}%
                </Typography>
              </div>
            );
          })}
        </div>
      </div>
    </Box>
  );
}

export default memo(CollaboratorPieChart);
