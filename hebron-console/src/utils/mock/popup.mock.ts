import { ExposureStatus } from '../enums/common.enum';

export type PopupRESP = {
  id: number;
  name: string;
  location?: string;
  image_url: string;
  width: number;
  height: number;
  expose_start_date?: string;
  expose_end_date?: string;
  status: ExposureStatus;
  registrant?: string;
};

export const POPUP_MOCK: PopupRESP[] = [
  {
    id: 1,
    name: 'Flash Sale - Limited Offer',
    image_url: 'https://placehold.co/400x300/4f86f7/white?text=Flash+Sale',
    width: 400,
    height: 300,
    status: ExposureStatus.EXPOSED,
    registrant: 'Super Admin',
  },
  {
    id: 2,
    name: 'New Member Welcome',
    location: 'Homepage',
    image_url: 'https://placehold.co/200x300/4f86f7/white?text=Welcome',
    width: 200,
    height: 300,
    status: ExposureStatus.NON_EXPOSED,
    registrant: 'Super Admin',
  },
  {
    id: 3,
    name: 'Weekly Deals Promotion',
    image_url: 'https://placehold.co/400x300/4f86f7/white?text=Weekly+Deals',
    width: 400,
    height: 300,
    status: ExposureStatus.EXPOSED,
    registrant: 'Super Admin',
  },
  {
    id: 4,
    name: 'Holiday Season Special',
    image_url: 'https://placehold.co/800x300/4f86f7/white?text=Holiday',
    width: 800,
    height: 300,
    expose_start_date: '2026-05-01',
    expose_end_date: '2026-05-31',
    status: ExposureStatus.NON_EXPOSED,
    registrant: 'Super Admin',
  },
];
