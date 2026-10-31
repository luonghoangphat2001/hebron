import { MY_ROUTE } from '@/utils/constants/route.constant';
import { CALL_BACK_URL } from '@/utils/constants/common.constant';
import { isAuthenticated } from '@/utils/helper/local-storagte.helper';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={MY_ROUTE.LOGIN} state={{ [CALL_BACK_URL]: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
