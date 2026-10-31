import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useId, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { LinkDialogProps } from '../types';

// Mounted only while open (see AppRichTextEditor), so `defaultUrl` seeds state on mount.
export function LinkDialog({ defaultUrl, onOpenChange, onSubmit }: LinkDialogProps) {
  const { t: tCommon } = useTranslation('common');
  const inputId = useId();
  const [url, setUrl] = useState(defaultUrl);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(url);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tCommon('editor.set_link')}</DialogTitle>
          <DialogDescription>{tCommon('editor.link_url_hint')}</DialogDescription>
        </DialogHeader>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <Label htmlFor={inputId}>{tCommon('editor.link_url')}</Label>
            <Input
              id={inputId}
              type='url'
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={tCommon('editor.ph_link_url')}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              {tCommon('button.cancel')}
            </Button>
            <Button type='submit'>{tCommon('button.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
