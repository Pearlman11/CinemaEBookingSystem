'use client'

import React from 'react';
import Home from "@/app/home/page";
import AdminHome from '@/app/components/AdminHome/AdminHome';
import { useAuth } from '@/app/context/AuthContext';

export default function AdminHomePage() {
    const { isAdmin } = useAuth();

    return (
        <>
            {isAdmin ? <AdminHome /> : <Home />}
        </>
    );
}