import { LANG } from '@/utils/constants/common.constant';
import { Check, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

// Mock data for the languages
const languages = [
  { label: '한국어', subLabel: 'Korean', value: 'kr', flag: '🇰🇷' },
  { label: 'English', subLabel: 'English', value: 'en', flag: '🇺🇸' },
];

const LanguageSelect = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('kr');

  const handleSelectLanguage = (value: string) => {
    setCurrentLang(value);
    i18n.changeLanguage(value);
    localStorage.setItem(LANG, value);
  };

  useEffect(() => {
    const value = localStorage.getItem(LANG);

    // your condition here
    if (value === 'en') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentLang('en');
    } else {
      setCurrentLang('kr');
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='flex items-center gap-2 rounded-full px-4 py-2 uppercase'>
          <Globe className='h-4 w-4' />
          {currentLang}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-56 rounded-xl p-1'>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => handleSelectLanguage(lang.value)}
            className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 ${
              currentLang === lang.value ? 'bg-accent' : ''
            }`}>
            <div className='flex items-center gap-3'>
              <span className='text-xl'>{lang.flag}</span>
              <div className='flex flex-col'>
                <span className='text-sm font-medium'>{lang.label}</span>
                {lang.subLabel && <span className='text-muted-foreground text-xs'>{lang.subLabel}</span>}
              </div>
            </div>
            {currentLang === lang.value && <Check className='h-4 w-4 text-green-500' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelect;
