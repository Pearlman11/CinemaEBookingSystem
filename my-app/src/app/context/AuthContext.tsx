'use client';

import {createContext, useContext, useState, ReactNode, useEffect} from 'react'
import { useRouter } from 'next/navigation';

//  User interface to match backend entity
export interface User {
  password: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob?: Date;
  role: 'USER' | 'ADMIN';
  createdAt?: Date;
}

type AuthContextType = {
    isLoggedIn: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    user: User | null;
    login: (userData: User) => void; 
    logout: () => void;
    setAdmin: (admin: boolean) => void;
    adminLogin: (userData: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children:ReactNode}) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<User | null>(null); 
    const router = useRouter();

    // Check for saved auth state on component mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedIsAdmin = localStorage.getItem('isAdmin');
        const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (savedUser && savedIsLoggedIn === 'true') {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
            if (savedIsAdmin === 'true') {
                setIsAdmin(true);
            }
        }
    }, []);

    const adminLogin = (userData: User) => {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('isLoggedIn', 'true');
        
        router.push('/admin/manage/movies');
    }

    const login = (userData: User) => {
        setIsLoggedIn(true);
        setIsAdmin(userData.role === 'ADMIN');
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAdmin', userData.role === 'ADMIN' ? 'true' : 'false');
        localStorage.setItem('isLoggedIn', 'true');
        
        router.push('/');
    }
    
    const logout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUser(null);
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('isLoggedIn');
        
        router.push('/');
    };
    
    const setAdmin = (admin: boolean) => {
        setIsAdmin(admin);
        localStorage.setItem('isAdmin', admin ? 'true' : 'false');
    };
  
    return (
        <AuthContext.Provider value = {{
            isLoggedIn, 
            isAuthenticated: isLoggedIn,
            isAdmin, 
            user, 
            login, 
            logout, 
            adminLogin, 
            setAdmin
        }}>
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