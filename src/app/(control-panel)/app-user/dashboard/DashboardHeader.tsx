import PageTitle from '@/components/PageTitle';

/**
 * The dashboard header component.
 */

function DashboardHeader() {
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Dashboard" />
    </div>
  );
}

export default DashboardHeader;
