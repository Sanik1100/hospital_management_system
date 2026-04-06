import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService.js";
import {useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext=createContext(null);
// all components can access user data without passing props

export const AuthProvider=({children}) =>{
    const [user, setUser]= useState(null);
    const [loading, setLoading]= useState(true);
    const navigate= useNavigate();

    // on app load: restore user from localStorage
    useEffect(()=>{
        const initAuth= async () => {
            const token= localStorage.getItem('token');
            const storedUser= localStorage.getItem('user');

            if(token && storedUser){
                try {
                    setUser(JSON.parse(storedUser));
                    // Verify token is still valid
                    const {data}= await authService.getMe();
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } catch  {
                    // toke invalid -> clear everything
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
            
        };
        initAuth();
    },[]);

    // register 
    const register= useCallback(async (formData) => {
        try {
            setLoading(true);
            const {data}= await authService.register(formData);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            toast.success('Account created successfully !');

            // redirect based on role
            redirectByRole(data.user.role);
        } catch (error) {
            const msg= error.response?.data?.message || 'Registration failed';
            toast.error(msg);
            throw error;

        }finally{
            setLoading(false);
        }
    },[]);

    // login
    const login= useCallback(async (formData) => {
        try {
            setLoading(true);
            const {data}=await authService.login(formData);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            toast.success(`Welcome back, ${data.user.full_name}!👋 `);

            // redirect based on role
            redirectByRole(data.user.role);
        } catch (error) {
            const msg=error.response?.data?.message || 'Login failed';
            toast.error(msg);
            throw error;
        }finally{
            setLoading(false);
        }
    },[]);

    // logout
    const logout= useCallback(()=> {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
        navigate('/login');
    },[navigate]);

    // role based redirect helper
    const redirectByRole= (role) => {
        switch(role){
            case 'patient':  navigate('/patient/dashboard'); break;
            case 'doctor':  navigate('/doctor/dashboard'); break;
            case 'admin':  navigate('/admin/overview'); break;
            default:  navigate('/login'); break;
        }
    };

    // update user in state + localStorage
    const updateUser=useCallback((updatedUser)=> {
        setUser(updateUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    },[]);

    const value={
        user,
        loading,
        isAuthenticated: !!user,
        isPatient: user?.role === 'patient',
        isDoctor: user?.role === 'doctor',
        isAdmin: user?.role === 'admin',
        register,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth=()=>{
    const context= useContext(AuthContext);
    if(!context){
      throw new Error('useAuth must be used inside AuthProvider');    
    }
    return context;
};

export default AuthContext;