import PageTitle from '@/components/PageTitle';

/**
 * The Status header component.
 */

function StatusHeader() {
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Status da conta" />
    </div>
  );
}

export default StatusHeader;
