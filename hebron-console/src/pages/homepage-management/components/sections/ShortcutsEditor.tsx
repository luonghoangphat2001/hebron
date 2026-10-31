import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import type { CategoryShortcutItemRESP } from '@/data/homepage-management/homepage.response';
import { buildCategoryShortcutsUpdatePayload } from '@/data/homepage-management/homepage.service';
import React from 'react';
import CategoryShortcutItemsEditor from './CategoryShortcutItemsEditor';

type Props = {
  rawContent: any;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const ShortcutsEditor: React.FC<Props> = ({ rawContent, onSaveSection }) => {
  const items: CategoryShortcutItemRESP[] = Array.isArray(rawContent?.items) ? rawContent.items : [];
  const categorySlugs: string[] = Array.isArray(rawContent?.category_slugs) ? rawContent.category_slugs : [];

  const save = (nextItems: CategoryShortcutItemRESP[]) =>
    onSaveSection?.(buildCategoryShortcutsUpdatePayload(categorySlugs, undefined, nextItems));

  return <CategoryShortcutItemsEditor items={items} onSave={save} />;
};

export default ShortcutsEditor;
