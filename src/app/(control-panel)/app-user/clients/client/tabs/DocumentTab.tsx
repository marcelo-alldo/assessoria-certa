import { useFormContext } from 'react-hook-form';
import { useLocation } from 'react-router';

function DocumentTab() {
  const { register, formState, control } = useFormContext();
  // Helper para garantir que só string vai para helperText
  const getHelperText = (field) => (typeof field?.message === 'string' ? field.message : undefined);
  const { state } = useLocation();

  return <div className="flex flex-col gap-4 max-w-xl"></div>;
}

export default DocumentTab;
