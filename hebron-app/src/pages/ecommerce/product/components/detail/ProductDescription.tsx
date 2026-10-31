import type { ProductItemRESP } from '@/data/products/products.response';
import DOMPurify from 'dompurify';
import './product-description.css';

type ProductDescriptionProps = {
  product: ProductItemRESP;
};

const EVERAWARD_IMAGE_HOST = /^(?:https?:)?(?:\/\/)?www\.everaward\.com(?=\/|$)/i;

const replaceEverawardImageSources = (html: string) =>
  html.replace(/(<img\b[^>]*\bsrc\s*=\s*)(["'])(.*?)(\2)/gi, (match, attribute, quote, source) => {
    if (!EVERAWARD_IMAGE_HOST.test(source)) {
      return match;
    }

    return `${attribute}${quote}${source.replace(EVERAWARD_IMAGE_HOST, 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com')}${quote}`;
  });

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  if (!product.description) {
    return null;
  }

  const description = replaceEverawardImageSources(DOMPurify.sanitize(product.description));

  return (
    <div className='product-description cursor-default'>
      <div dangerouslySetInnerHTML={{ __html: description }} />
    </div>
  );
};

export default ProductDescription;
