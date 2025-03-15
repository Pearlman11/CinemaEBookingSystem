// Main landing page for application "Homepage"
"use client"
import Home from "./home/page"
import './globals.css'
import { MovieProvider } from "./context/MovieContext"


export default function Homepage() {
    return (
        <MovieProvider>
        <main>
            <Home/>
        </main>
        </MovieProvider>
    );
}