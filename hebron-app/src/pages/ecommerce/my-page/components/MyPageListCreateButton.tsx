import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type MyPageListCreateButtonProps = {
  to: string;
  children: ReactNode;
};

const MyPageListCreateButton = ({ to, children }: MyPageListCreateButtonProps) => (
  <Button asChild variant='default' className='shrink-0 px-14'>
    <Link to={to}>{children}</Link>
  </Button>
);

export default MyPageListCreateButton;
