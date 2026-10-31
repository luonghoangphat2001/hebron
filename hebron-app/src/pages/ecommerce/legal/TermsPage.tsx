import LegalDocumentPage from '@/pages/ecommerce/legal/LegalDocumentPage';
import { TERMS_DOCUMENT } from '@/utils/constants/legal.constant';

const TermsPage = () => {
  return <LegalDocumentPage document={TERMS_DOCUMENT} />;
};

export default TermsPage;
