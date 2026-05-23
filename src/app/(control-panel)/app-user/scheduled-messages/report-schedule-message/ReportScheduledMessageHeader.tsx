import { useParams } from 'react-router';
import PageTitle from '@/components/PageTitle';

/**
 * The header component.
 */

interface ScheduledMessageHeaderProps {
  title: string;
}

function ReportScheduledMessageHeader({ title }: ScheduledMessageHeaderProps) {
  const { uid } = useParams();

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title={uid === 'new' ? 'Nova Mensagem' : title} backNavigation />
    </div>
  );
}

export default ReportScheduledMessageHeader;
