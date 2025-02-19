'use client';

import {createContext, useContext, useState, ReactNode} from 'react'
import { useRouter } from 'next/navigation';

type AuthContextType = {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children:ReactNode}) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const login = () => {
        setIsLoggedIn(true);
        router.push('/')
    }
    const logout = () => {
        setIsLoggedIn(false);
        router.push('/');
    };

    return (
        <AuthContext.Provider value = {{isLoggedIn, login, logout}}>
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