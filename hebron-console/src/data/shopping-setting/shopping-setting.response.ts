export type ShoppingSetting = {
  id: number;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
};

export type ShoppingSettingListRESP = {
  settings: ShoppingSetting[];
};

export type ShoppingSettingDetailRESP = ShoppingSetting;
