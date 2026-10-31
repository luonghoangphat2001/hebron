import brandRouter from './brand';
import mainRouter from './main';
import vendorRouter from './vendor';

const host = window.location.hostname;

let router = mainRouter;
let siteTitle = '(주)헤브론 - 좋은사람좋은상패';

switch (host) {
  case import.meta.env.VITE_BRAND_HOST:
    router = brandRouter;
    break;

  case import.meta.env.VITE_VENDOR_HOST:
    router = vendorRouter;
    siteTitle = '어워드플러스(Award Plus)';
    break;

  case import.meta.env.VITE_MALL_HOST:
    router = mainRouter;
    break;

  default:
    router = brandRouter;
}

document.title = siteTitle;

export default router;
