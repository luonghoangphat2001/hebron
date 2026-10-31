import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('gap-4', className)}>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
        {description ? <p className='text-muted-foreground text-sm'>{description}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className='mb-1.5 block text-sm font-medium'>
      {children}
      {required ? <span className='ml-0.5 text-red-500'>*</span> : null}
    </label>
  );
}

export function StatusBadge({
  active,
  activeText,
  inactiveText,
}: {
  active: boolean;
  activeText?: string;
  inactiveText?: string;
}) {
  return (
    <Badge variant={active ? 'default' : 'secondary'} className={active ? 'bg-emerald-600' : ''}>
      {active ? activeText || 'Active' : inactiveText || 'Inactive'}
    </Badge>
  );
}

export function QueryError({ message }: { message?: string }) {
  return (
    <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700' role='alert'>
      {message || 'Unable to load data.'}
    </div>
  );
}
