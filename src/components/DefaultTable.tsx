/* eslint-disable @typescript-eslint/no-explicit-any */
import DataTable from './data-table/DataTable';

interface DefaultTableProps {
  columns: any[];
  data: any[];
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  showGlobalFilter?: boolean;
}

function DefaultTable({
  columns,
  data,
  page,
  totalPages,
  onPageChange,
  globalFilter,
  onGlobalFilterChange,
  showGlobalFilter = true,
}: DefaultTableProps) {
  const pageIndex = (page ?? 1) - 1;
  const pageSize = 10;
  return (
    <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
      <DataTable
        state={{
          pagination: { pageIndex, pageSize },
          globalFilter: globalFilter ?? '',
        }}
        onGlobalFilterChange={onGlobalFilterChange}
        initialState={{
          density: 'compact',
          showColumnFilters: false,
          showGlobalFilter,
          pagination: { pageIndex, pageSize },
        }}
        enableFilters={false}
        enablePagination={!!onPageChange}
        manualPagination={!!onPageChange}
        rowCount={totalPages ? totalPages * pageSize : undefined}
        onPaginationChange={
          onPageChange
            ? (updater) => {
                let newPageIndex: number | undefined;

                if (typeof updater === 'function') {
                  const newState = updater({ pageIndex, pageSize });
                  newPageIndex = newState.pageIndex;
                } else if (typeof updater === 'object' && updater !== null) {
                  newPageIndex = (updater as any).pageIndex;
                }

                if (typeof newPageIndex === 'number') {
                  onPageChange(newPageIndex + 1);
                }
              }
            : undefined
        }
        muiPaginationProps={{
          color: 'secondary',
          shape: 'rounded',
          variant: 'outlined',
          showRowsPerPage: false,
          sx: {
            '& .MuiPaginationItem-root': {
              borderRadius: '12px',
              color: '#000000',
              fontWeight: 700,
              border: `1px solid ${(theme) => theme.palette.secondary.main}`,
              '&.Mui-selected': {
                backgroundColor: (theme) => theme.palette.secondary.main,
                color: '#000000',
              },
            },
          },
        }}
        // enableSorting={false}
        enableBatchRowSelection={false}
        // enableColumnPinning={false}
        // enableHiding={false}
        // enableColumnActions={false}
        // enableColumnDragging={false}
        // enableColumnOrdering={false}
        enableRowActions={false}
        enableRowSelection={false}
        columns={columns}
        data={data}
        localization={{
          search: 'Pesquisar',
          noRecordsToDisplay: 'Nenhum registro para exibir',
          showHideFilters: 'Mostrar/Ocultar filtros',
          showHideColumns: 'Mostrar/Ocultar colunas',
          actions: 'Ações',
          changeFilterMode: 'Alterar modo de filtro',
          clearSearch: 'Limpar pesquisa',
          clearFilter: 'Limpar filtros',
          sortedByColumnAsc: 'Ordenado por coluna ascendente',
          sortedByColumnDesc: 'Ordenado por coluna descendente',
          sortByColumnAsc: 'Ordenar por coluna ascendente',
          sortByColumnDesc: 'Ordenar por coluna descendente',
          clearSort: 'Limpar ordenação',
          noResultsFound: 'Nenhum resultado encontrado',
          filterMode: '',
          filterByColumn: 'Filtrar por coluna',
          groupByColumn: 'Agrupar por coluna',
          ungroupByColumn: 'Desagrupar por coluna',
          dropToGroupBy: 'Arraste para agrupar',
          pinToLeft: 'Fixar à esquerda',
          pinToRight: 'Fixar à direita',
          unpin: 'Desafixar',
          hideColumn: 'Ocultar coluna',
          showAllColumns: 'Mostrar todas as colunas',
          hideAll: 'Ocultar tudo',
          resetOrder: 'Redefinir ordem',
          unpinAll: 'Desafixar tudo',
          showAll: 'Mostrar tudo',
          select: 'Selecionar',
          filterFuzzy: 'Filtro difuso',
          filterContains: 'Filtro contém',
          filterStartsWith: 'Filtro começa com',
          filterEndsWith: 'Filtro termina com',
          filterEquals: 'Filtro igual',
          filterNotEquals: 'Filtro diferente',
          filterBetween: 'Filtro entre',
          filterBetweenInclusive: 'Filtro entre inclusivo',
          filterGreaterThan: 'Filtro maior que',
          filterGreaterThanOrEqualTo: 'Filtro maior ou igual a',
          filterLessThan: 'Filtro menor que',
          filterLessThanOrEqualTo: 'Filtro menor ou igual a',
          filterEmpty: 'Filtro vazio',
          filterNotEmpty: 'Filtro não vazio',
          expandAll: 'Expandir todos os grupos',
          toggleSelectAll: 'Selecionar tudo',
          toggleSelectRow: 'Selecionar linha',
          collapseAll: 'Recolher todos os grupos',
          expand: 'Expandir',
          collapse: 'Recolher',
          toggleVisibility: 'Alternar visibilidade',
          rowActions: 'Ações',
          columnActions: 'Ações de coluna',
          move: 'Mover',
          cancel: 'Cancelar',
          toggleDensity: 'Alternar tamanho',
        }}
      />
    </div>
  );
}

export default DefaultTable;
