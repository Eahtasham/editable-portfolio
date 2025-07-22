"use client";

import React, { useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useRouter } from 'next/navigation';



export default function AdminDashboard() {
    const { isAuthenticated } = usePortfolio();
    const router = useRouter();
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated]);


    return (

        <div className="min-h-screen bg-background text-foreground">
            <h1>Admin Dashboard</h1>
        </div>

    );
}