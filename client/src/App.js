import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Meeting from './pages/Meeting';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/meeting/:meetingId"
                        element={
                            <PrivateRoute>
                                <Meeting />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App; 