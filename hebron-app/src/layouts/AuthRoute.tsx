import { CALL_BACK_URL } from '@/utils/constants/common.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { isAuthenticated } from '@/utils/helper/local-storagte.helper';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const AuthRoute = () => {
  const location = useLocation();

  if (isAuthenticated()) {
    const callbackUrl = location.state?.[CALL_BACK_URL];
    return <Navigate to={typeof callbackUrl === 'string' ? callbackUrl : MY_ROUTE.HOME} replace />;
  }

  return <Outlet />;
};

export default AuthRoute;
