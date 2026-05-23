import PageTitle from '@/components/PageTitle';

/**
 * The clients header component.
 */

function FlowsHeader() {
  // const navigate = useNavigate();
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Fluxos" />

      {/* <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
        <Button variant="contained" onClick={() => navigate('/clients/new')} className="whitespace-nowrap" color="secondary">
          <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
          <span className="hidden sm:flex mx-2">Adicionar Cliente</span>
        </Button>
      </div> */}
    </div>
  );
}

export default FlowsHeader;
