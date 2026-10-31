import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_CART_CONTENT, type GuestCartItem } from '@/utils/helper/guest-cart.helper';
import { useState } from 'react';

type CartContent = NonNullable<GuestCartItem['content']>;
type Props = {
  open: boolean;
  initialValue?: GuestCartItem['content'];
  onOpenChange: (open: boolean) => void;
  onSave: (content: CartContent) => void;
};

const emptyContent: CartContent = { ...DEFAULT_CART_CONTENT };

const CartContentDialog = ({ open, initialValue, onOpenChange, onSave }: Props) => {
  const [value, setValue] = useState<CartContent>(initialValue || emptyContent);

  const update = (key: keyof CartContent, nextValue: string) => setValue((current) => ({ ...current, [key]: nextValue }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl gap-4 sm:max-w-xl'>
        <DialogTitle className='text-lg font-bold'>문안 내용 수정</DialogTitle>
        <div className='grid gap-3'>
          <Input value={value.title} placeholder='제목' onChange={(event) => update('title', event.target.value)} />
          <Input
            value={value.recipientName}
            placeholder='수령인 / 단체명'
            onChange={(event) => update('recipientName', event.target.value)}
          />
          <Textarea value={value.message} placeholder='인사말' onChange={(event) => update('message', event.target.value)} />
          <Input value={value.date} placeholder='날짜' onChange={(event) => update('date', event.target.value)} />
          <Input value={value.sender} placeholder='주는 분 / 단체명' onChange={(event) => update('sender', event.target.value)} />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={() => onSave(value)}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CartContentDialog;
