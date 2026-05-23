import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TablePricingTableHead from './TablePricingTableHead';

/**
 * The table data item type.
 */
export type TableDataItemType = {
  title: string;
  monthlyPrice: string;
  yearlyPrice: string;
  buttonTitle?: string;
  isPopular?: boolean;
  features?: {
    leadsContacts: string;
    flows: string;
    ai: string;
    attendants: string;
    flowType?: string;
    calendar?: string;
    whatsapp: string;
    functions: string;
  };
};

type TablePricingTableProps = {
  period: 'month' | 'year';
  onPlanSelect?: (planTitle: string, price: string, planData?: TableDataItemType) => void;
  showConfirmation?: boolean;
  onConfirmationChange?: (show: boolean) => void;
  currentUserSubscription?: {
    subscriptionName?: string;
    status?: string;
    price?: string;
    startDate?: string;
    endDate?: string;
  };
  selectedPlanData?: { period?: 'month' | 'year'; planTitle?: string; price?: string };
  tableData: TableDataItemType[];
};

/**
 * The pricing table.
 */
function TablePricingTable(props: TablePricingTableProps) {
  const { period, onPlanSelect, showConfirmation, onConfirmationChange, currentUserSubscription, selectedPlanData, tableData } = props;

  return (
    <div className="mt-8 flex justify-center">
      <Paper className="w-full flex-col overflow-x-auto overflow-y-hidden container lg:flex-row">
        <div className="grid min-w-max grid-flow-col divide-x lg:min-w-0 lg:grid-flow-row lg:divide-x-0 lg:divide-y">
          <div className="sticky left-0 grid grid-flow-row auto-rows-fr divide-y overflow-hidden rounded-l border-r shadow-lg lg:max-w-none lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-y-0 lg:rounded-l-none lg:border-r-0 lg:shadow-none">
            <Box className="overflow-hidden px-4 py-8" sx={{ backgroundColor: 'background.paper' }} />
            {tableData.map((item, index) => (
              <TablePricingTableHead
                key={index}
                data={item}
                period={period}
                onPlanSelect={(planTitle, price) => onPlanSelect?.(planTitle, price, item)}
                showConfirmation={showConfirmation}
                onConfirmationChange={onConfirmationChange}
                currentUserSubscription={currentUserSubscription}
              />
            ))}
          </div>

          <Box sx={{ backgroundColor: 'background.default' }} className="col-span-full hidden p-4 lg:block">
            <Typography className="text-md font-semibold">RECURSOS</Typography>
          </Box>

          <div className="grid grid-flow-row auto-rows-fr divide-y lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-y-0">
            <Typography className="flex max-w-32 items-center p-4 text-center font-medium lg:max-w-none lg:items-start lg:text-left lg:font-normal">
              Leads / Contatos ativos
            </Typography>

            {tableData
              .map((item) => item.features.leadsContacts)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr divide-y lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-y-0">
            <Typography className="flex max-w-32 items-center p-4 text-center font-medium lg:max-w-none lg:items-start lg:text-left lg:font-normal">
              Fluxo de atendimento
            </Typography>

            {tableData
              .map((item) => item.features.flows)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr divide-y lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-y-0">
            <Typography className="flex max-w-32 items-center p-4 text-center font-medium lg:max-w-none lg:items-start lg:text-left lg:font-normal">
              Inteligência Artificial
            </Typography>

            {tableData
              .map((item) => item.features.ai)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr divide-y lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-y-0">
            <Typography className="flex max-w-32 items-center p-4 text-center font-medium lg:max-w-none lg:items-start lg:text-left lg:font-normal">
              Atendentes
            </Typography>

            {tableData
              .map((item) => item.features.attendants)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr divide-y lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-y-0">
            <Typography className="flex max-w-32 items-center p-4 text-center font-medium lg:max-w-none lg:items-start lg:text-left lg:font-normal">
              Tipo de fluxo
            </Typography>

            {tableData
              .map((item) => item.features.flowType || '-')
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr divide-y lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-y-0">
            <Typography className="flex max-w-32 items-center p-4 text-center font-medium lg:max-w-none lg:items-start lg:text-left lg:font-normal">
              Calendário
            </Typography>

            {tableData
              .map((item) => item.features.calendar || '-')
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr divide-y lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-y-0">
            <Typography className="flex max-w-32 items-center p-4 text-center font-medium lg:max-w-none lg:items-start lg:text-left lg:font-normal">
              Atendimento via WhatsApp
            </Typography>

            {tableData
              .map((item) => item.features.whatsapp)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr divide-y lg:auto-cols-fr lg:grid-flow-col lg:divide-x lg:divide-y-0">
            <Typography className="flex max-w-32 items-center p-4 text-center font-medium lg:max-w-none lg:items-start lg:text-left lg:font-normal">
              Funções
            </Typography>

            {tableData
              .map((item) => item.features.functions)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>
        </div>
      </Paper>
    </div>
  );
}

type TableCellProps = {
  value: string;
};

function TableCell(props: TableCellProps) {
  const { value } = props;

  return (
    <div className="flex items-center justify-center p-4 lg:justify-start">
      <Typography>{value}</Typography>
    </div>
  );
}

export default TablePricingTable;
