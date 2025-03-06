import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { LogOut, User, Home, BookOpen, Calendar } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <Home className="h-6 w-6 mr-2 text-primary" />
                            <span className="text-xl font-semibold">Hotel Booking</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/hotels"
                                    className="text-gray-700 hover:text-primary flex items-center gap-1"
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span>Hotels</span>
                                </Link>
                                <Link
                                    to="/bookings"
                                    className="text-gray-700 hover:text-primary flex items-center gap-1"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span>My Bookings</span>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="ml-2 flex items-center gap-1"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => navigate('/auth')}
                                className="flex items-center gap-1"
                            >
                                <User className="h-4 w-4" />
                                <span>Login / Register</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;