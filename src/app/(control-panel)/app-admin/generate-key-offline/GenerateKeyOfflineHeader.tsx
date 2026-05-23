import PageTitle from '@/components/PageTitle';

/**
 * The users header component.
 */

function GenerateKeyOfflineHeader() {
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Gerar Chave Offline" />
    </div>
  );
}

export default GenerateKeyOfflineHeader;
