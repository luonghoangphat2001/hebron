import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

type Props = {
  heading: string;
  onChangeHeading: (val: string) => void;
  description: string;
  onChangeDescription: (val: string) => void;
  headingLabel?: string;
  descriptionLabel?: string;
  headingPlaceholder?: string;
  descriptionPlaceholder?: string;
  descriptionRows?: number;
  headingType?: 'input' | 'textarea';
  helperText?: string;
  extraFields?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export const SectionHeadingDescription: React.FC<Props> = ({
  heading,
  onChangeHeading,
  description,
  onChangeDescription,
  headingLabel = '섹션 헤딩 (Heading)',
  descriptionLabel = '설명 문구 (Description)',
  headingPlaceholder,
  descriptionPlaceholder,
  descriptionRows = 3,
  headingType = 'textarea',
  helperText,
  extraFields,
  className = '',
  children,
}) => {
  return (
    <div className={`bg-card space-y-4 rounded-xl border p-4 shadow-2xs ${className}`}>
      <div className='space-y-3.5'>
        {/* Heading on top */}
        <div className='space-y-1.5'>
          <label className='text-foreground text-xs font-bold'>{headingLabel}</label>
          {headingType === 'input' ? (
            <Input
              value={heading}
              onChange={(e) => onChangeHeading(e.target.value)}
              placeholder={headingPlaceholder}
              className='h-8 text-xs'
            />
          ) : (
            <Textarea
              value={heading}
              onChange={(e) => onChangeHeading(e.target.value)}
              placeholder={headingPlaceholder}
              rows={2}
              className='text-xs leading-relaxed'
            />
          )}
          {helperText && <p className='text-muted-foreground text-[10px]'>{helperText}</p>}
        </div>

        {/* Description directly under Heading */}
        <div className='space-y-1.5'>
          <label className='text-foreground text-xs font-bold'>{descriptionLabel}</label>
          <Textarea
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder={descriptionPlaceholder}
            rows={descriptionRows}
            className='text-xs leading-relaxed'
          />
        </div>

        {/* Extra fields if provided */}
        {extraFields}
      </div>

      {children}
    </div>
  );
};

export default SectionHeadingDescription;
