import LegalDocumentPage from '@/pages/ecommerce/legal/LegalDocumentPage';
import { PRIVACY_POLICY_DOCUMENT } from '@/utils/constants/legal.constant';

const PrivacyPolicyPage = () => {
  return <LegalDocumentPage document={PRIVACY_POLICY_DOCUMENT} />;
};

export default PrivacyPolicyPage;
