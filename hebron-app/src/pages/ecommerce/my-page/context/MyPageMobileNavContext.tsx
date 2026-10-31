import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type MyPageMobileNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MyPageMobileNavContext = createContext<MyPageMobileNavContextValue | null>(null);

type MyPageMobileNavProviderProps = {
  children: ReactNode;
};

export const MyPageMobileNavProvider = ({ children }: MyPageMobileNavProviderProps) => {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return <MyPageMobileNavContext.Provider value={value}>{children}</MyPageMobileNavContext.Provider>;
};

export const useMyPageMobileNav = () => {
  const context = useContext(MyPageMobileNavContext);

  if (!context) {
    throw new Error('useMyPageMobileNav must be used within MyPageMobileNavProvider');
  }

  return context;
};
