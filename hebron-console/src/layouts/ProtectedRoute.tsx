import { CALL_BACK_URL } from '@/utils/constants/common.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { isAuthenticated } from '@/utils/helper/local-storagte.helper';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthen = isAuthenticated();

  if (!isAuthen) {
    return <Navigate to={MY_ROUTE.LOGIN} state={{ [CALL_BACK_URL]: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
