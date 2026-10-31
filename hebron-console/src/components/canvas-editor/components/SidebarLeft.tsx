import { optionsTabContent } from '@/utils/constants/canvas-editor.constant';
import { EditorTabType } from '@/utils/types/canvas.types';
import { useState } from 'react';
import BackgroundTabContent from './BackgroundTabContent';
import ImageTabContent from './ImageTabContent';
import TextTabContent from './TextTabContent';

export default function SidebarLeft() {
  const [activeTab, setActiveTab] = useState<EditorTabType>(EditorTabType.IMAGE);

  const renderTabContent = () => {
    switch (activeTab) {
      case EditorTabType.IMAGE:
        return <ImageTabContent />;
      case EditorTabType.TEXT:
        return <TextTabContent />;
      case EditorTabType.BACKGROUND:
        return <BackgroundTabContent />;
      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col-reverse border-r border-gray-300 bg-white md:h-full md:w-[358px] md:flex-row'>
      <section className='flex w-25 items-center border-r border-gray-300 md:flex-col'>
        {optionsTabContent.map((tab) => (
          <article
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`title-14 flex cursor-pointer flex-col gap-3 py-7 transition-colors ${
              activeTab === tab.label
                ? 'bg-foundation-green-white-active text-foundation-green-normal font-semibold'
                : 'bg-white font-normal text-gray-800 hover:bg-gray-50'
            }`}>
            <article className='title-32 px-6'>{<tab.icon />}</article>
            <p className='text-center'>{tab.label}</p>
          </article>
        ))}
      </section>

      <div className='flex-1 overflow-y-auto border border-gray-300 px-10 py-14 md:border-none md:p-6'>{renderTabContent()}</div>
    </div>
  );
}
