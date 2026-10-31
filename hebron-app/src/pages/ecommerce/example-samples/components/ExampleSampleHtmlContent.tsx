import { cn } from '@/lib/utils';
import { sanitizeExampleSampleHtml } from '@/utils/helper/example-sample-html.helper';

type ExampleSampleHtmlContentProps = {
  html: string;
  className?: string;
};

const ExampleSampleHtmlContent = ({ html, className }: ExampleSampleHtmlContentProps) => (
  <div className={cn('app-rich-text-editor__content overflow-x-auto', className)}>
    <div className='tiptap min-h-0 p-0 md:p-0' dangerouslySetInnerHTML={{ __html: sanitizeExampleSampleHtml(html) }} />
  </div>
);

export default ExampleSampleHtmlContent;
