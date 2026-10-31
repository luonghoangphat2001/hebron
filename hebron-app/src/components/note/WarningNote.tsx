type WarningNoteProps = {
  title: string;
  description?: string;
};

const WarningNote = ({ title, description }: WarningNoteProps) => {
  return (
    <div className='space-y-1 border-l-4 border-yellow-500 bg-amber-50 p-4'>
      <p className='text-sm font-bold text-yellow-950'>{title}</p>
      <p className='text-sm text-amber-950'>{description}</p>
    </div>
  );
};

export default WarningNote;
