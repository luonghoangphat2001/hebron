import type { ReactNode } from 'react';

import PortfolioPageHero from './components/PortfolioPageHero';

type PortfolioPageLayoutProps = {
  children: ReactNode;
  title?: string | null;
  backgroundImageUrl?: string | null;
};

const PortfolioPageLayout = ({ children, title, backgroundImageUrl }: PortfolioPageLayoutProps) => {
  return (
    <main className='min-w-0 overflow-x-hidden bg-neutral-950'>
      <PortfolioPageHero title={title} backgroundImageUrl={backgroundImageUrl} />
      {children}
    </main>
  );
};

export default PortfolioPageLayout;
