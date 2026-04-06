import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// full page loading spinner
const LoadingScreen=() =>(
    <div className="min-h-screen flex items-center
                  justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-secondary
                      border-t-transparent rounded-full
                      animate-spin mx-auto mb-4" />
      <p className="text-muted text-sm font-medium">
        Loading...
      </p>
    </div>
  </div> 
);
// protect any route
// allowedRoles: ['patient'] | ['doctor'] | ['admin'] | ['patient','doctor']
const ProtectedRoute= ({allowedRoles}) =>{
    const {user,loading, isAuthenticated}= useAuth();

    // still checking token
    if(loading) return <LoadingScreen/>;

    // not logged in -> go to login
    if(!isAuthenticated){
        return <Navigate to="/login" replace />;
    }

    // logged in but wrong role -> go to dashboard
    if(allowedRoles && !allowedRoles.includes(user.role)){
        switch(user.role){
            case 'patient': return <Navigate to="/patient/dashboard" replace/>;
            case 'doctor': return <Navigate to='/doctor/dashboard' replace/>;
            case 'admin': return <Navigate to='/admin/overview' replace/>;
            default: return <Navigate to='/login' replace/>;
        }
    }

    // all good -> render the page
    return <Outlet/>;

};
export default ProtectedRoute;

