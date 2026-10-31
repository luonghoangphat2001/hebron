import { cn } from '@/lib/utils';
import MyPageListCreateButton from '@/pages/ecommerce/my-page/components/MyPageListCreateButton';
import MyPagePageTitle from '@/pages/ecommerce/my-page/components/MyPagePageTitle';
import type { ReactNode } from 'react';

type MyPageHeaderBaseProps = {
  title: ReactNode;
  className?: string;
  titleClassName?: string;
};

type MyPageHeaderWithCreateProps = MyPageHeaderBaseProps & {
  createTo: string;
  createLabel: ReactNode;
};

type MyPageHeaderProps = MyPageHeaderBaseProps | MyPageHeaderWithCreateProps;

const hasCreateAction = (props: MyPageHeaderProps): props is MyPageHeaderWithCreateProps =>
  'createTo' in props && props.createTo !== undefined;

const MyPageHeader = (props: MyPageHeaderProps) => {
  const { title, className, titleClassName } = props;

  if (!hasCreateAction(props)) {
    return <MyPagePageTitle className={titleClassName}>{title}</MyPagePageTitle>;
  }

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <MyPagePageTitle className={titleClassName}>{title}</MyPagePageTitle>
      <MyPageListCreateButton to={props.createTo}>{props.createLabel}</MyPageListCreateButton>
    </div>
  );
};

export default MyPageHeader;
