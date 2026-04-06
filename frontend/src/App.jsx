import React from 'react'
import {Routes, Route, Navigate} from 'react-router-dom';
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import SignIn from './pages/auth/SignIn';
import Register from './pages/auth/Register';
import FindDoctor from './pages/FindDoctor';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import PatientDashboard from './pages/patient/PatientDashboard';
import Invoice from './pages/patient/Invoice';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import Records from './pages/doctor/Records';
import Chat from './pages/chat/Chat';
import Overview from './pages/admin/Overview';
import Revenue from './pages/admin/Revenue';
import NotFound from './pages/NotFound';

// Loading screen while auth initializes
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center
                  justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-secondary
                    border-t-transparent rounded-full
                    animate-spin" />
  </div>
);


const App = () => {
  const {loading}=useAuth();

  if(loading) return <LoadingScreen/>;
   return (
   <>
   {/*Toast notifications */}
   <Toaster
   position='top-right'
   toastOptions={{
    duration: 4000,
    style:{
      background: '#1E293B',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
    },
    success:{
      iconTheme:{
         primary: '#10B981',
        secondary: '#fff', 
      },
    },
    error: {
      iconTheme: {
         primary: '#EF4444',
        secondary: '#fff',
      },
    },
   }}
   />

   <Routes>

    {/*Public Routes */}
    <Route path='/' element={<Landing/>}/>
    <Route path='/login' element={<SignIn/>}/>
    <Route path='/register' element={<Register/>}/>
    <Route path='/find-doctor' element={<FindDoctor/>}/>
    <Route path='/contact' element={<Contact/>}/>

    {/*Patient Routes(protected) */}
    <Route element={<ProtectedRoute allowedRoles={['patient']}/>}>
    <Route path='/patient/dashboard' element={<PatientDashboard/>}/>
    <Route path='/patient/invoice/:id' element={<Invoice/>}/>
    </Route>

    {/*Doctor Routes (protected) */}
    <Route element={<ProtectedRoute allowedRoles={['doctor']}/>}>
    <Route path='/doctor/dashboard' element={<DoctorDashboard/>}/>
    <Route path='/doctor/records/:id' element={<Records/>}/>
    <Route path='/doctor/chat' element={<Chat/>}/>
    </Route>

    {/* Admin Routes (protected) */}
    <Route element={<ProtectedRoute allowedRoles={['admin']}/>}>
    <Route path='/admin/overview' element={<Overview/>}/>
    <Route path='/admin/revenue' element={<Revenue/>}/>
    </Route>

    {/* Fallback */}
    <Route path='*' element={<NotFound/>}/>

   </Routes>
   </>
  );
};

export default App;