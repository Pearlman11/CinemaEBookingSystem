'use client';

import {createContext, useContext, useState, ReactNode} from 'react'
import { useRouter } from 'next/navigation';

type AuthContextType = {
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: () => void;
    logout: () => void;
    setAdmin: (admin: boolean) => void;
    adminLogin: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children:ReactNode}) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    const adminLogin =() => {
        setIsLoggedIn(true);
        setIsAdmin(true);
        router.push('/admin/manage/movies');
    }

    const login = () => {
        setIsLoggedIn(true);
        setIsAdmin(false);
        router.push('/');
    }
    const logout = () => {
        setIsLoggedIn(false);
        setAdmin(false);
        setIsAdmin(false);
        router.push('/');
    };
    const setAdmin = (admin: boolean) => {
        setIsAdmin(admin);
    };
  
    return (
        <AuthContext.Provider value = {{isLoggedIn, isAdmin, login, logout, adminLogin,setAdmin}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error ('useAuth must be used within an AuthProvider');
    }
    return context;
}