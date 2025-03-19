'use client';

import {createContext, useContext, useState, ReactNode, useEffect} from 'react'
import { useRouter } from 'next/navigation';

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
        //  check if we have tokens
        const accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
        
        if (!accessToken) {
            // No valid token, ensure user is logged out
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUser(null);
            return;
        }

        // If we have a token, check for user data
        const savedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
        
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsLoggedIn(true);
            setIsAdmin(userData.role === 'ADMIN');
        } else {
            // We have a token but no user data - fetch the user data
            fetchUserData(accessToken);
        }
    }, []);

    // Function to fetch user data using token
    const fetchUserData = async (token: string) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setIsLoggedIn(true);
                setIsAdmin(userData.role === 'ADMIN');
                
                // Store the user data in the same storage as the token
                if (localStorage.getItem('accessToken')) {
                    localStorage.setItem('user', JSON.stringify(userData));
                } else {
                    sessionStorage.setItem('user', JSON.stringify(userData));
                }
            } else {
                // Invalid token or other error
                logout();
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            logout();
        }
    };

    const adminLogin = (userData: User) => {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setUser(userData);
        
        // Save to the appropriate storage based on token location
        const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(userData));
        
        router.push('/admin/manage/movies');
    }

    const login = (userData: User) => {
        setIsLoggedIn(true);
        setIsAdmin(userData.role === 'ADMIN');
        setUser(userData);
        
        // Save to the appropriate storage based on token location
        const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(userData));
        
        router.push('/');
    }
    
    const logout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUser(null);
        
        // Clear both storage locations
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        
        router.push('/');
    };
    
    const setAdmin = (admin: boolean) => {
        setIsAdmin(admin);
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