import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertCircle, CheckCircle, Calendar, MapPin, User, Clock, Tag } from 'lucide-react';

const BookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [view, setView] = useState('grid'); // 'grid' or 'list'

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check for success message from redirect
        if (location.state?.success) {
            setNotification({
                type: 'success',
                message: location.state.message
            });

            // Clear the location state after showing notification
            window.history.replaceState({}, document.title);
        }

        fetchBookings();
    }, [location]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/auth');
                return;
            }

            const response = await axios.get(`${API_URL}/bookings`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setBookings(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching bookings:', err);

            if (err.response) {
                if (err.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/auth', { state: { message: 'Your session has expired. Please log in again.' } });
                    return;
                }
                setError(err.response.data.message || 'Failed to fetch your bookings. Please try again.');
            } else if (err.request) {
                setError('No response from server. Please check your internet connection.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
            CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
            CHECKED_IN: "bg-green-100 text-green-800 border-green-200",
            CANCELLED: "bg-red-100 text-red-800 border-red-200"
        };

        return (
            <Badge className={`${styles[status] || "bg-gray-100"} px-3 py-1 rounded-full text-xs font-medium border`}>
                {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
            </Badge>
        );
    };

    const handleCheckIn = (bookingId) => {
        navigate(`/checkin/${bookingId}`);
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse delay-150"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse delay-300"></div>
                        <span className="text-lg ml-2">Loading your bookings...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Bookings</h1>
                <div className="flex space-x-2">
                    <Button
                        variant={view === 'grid' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView('grid')}
                    >
                        Grid
                    </Button>
                    <Button
                        variant={view === 'list' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView('list')}
                    >
                        List
                    </Button>
                </div>
            </div>

            {notification && (
                <div className={`mb-6 p-4 rounded-lg flex items-start shadow-sm ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {notification.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    )}
                    <span>{notification.message}</span>
                    <button
                        className="ml-auto text-sm hover:underline"
                        onClick={() => setNotification(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                    <div className="mb-4">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
                    <Button onClick={() => navigate('/hotels')}>Book a Hotel</Button>
                </div>
            ) : (
                <>
                    {view === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking) => (
                                <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{booking.hotel.name}</CardTitle>
                                                <CardDescription className="flex items-center mt-1">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {booking.hotel.address}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pb-2">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-start space-x-2">
                                                <Calendar className="h-4 w-4 mt-0.5 text-blue-500" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Check-in</p>
                                                    <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-2">
                                                <Calendar className="h-4 w-4 mt-0.5 text-blue-500" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Check-out</p>
                                                    <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center mt-3 text-sm">
                                            <Tag className="h-4 w-4 mr-2 text-gray-500" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Booking ID</p>
                                                <p className="font-mono">{booking.id}</p>
                                            </div>
                                        </div>

                                        {booking.guests && booking.guests.length > 0 && (
                                            <div className="mt-4">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1 text-gray-500" />
                                                    <p className="font-medium text-sm">Guests ({booking.guests.length})</p>
                                                </div>
                                                <ul className="mt-1 text-sm space-y-1">
                                                    {booking.guests.map((guest) => (
                                                        <li key={guest.id} className="text-gray-600">
                                                            {guest.name} (Age: {guest.age})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="pt-2">
                                        {booking.status === 'CONFIRMED' && (
                                            <Button
                                                onClick={() => handleCheckIn(booking.id)}
                                                className="w-full"
                                            >
                                                Web Check-in
                                            </Button>
                                        )}

                                        {booking.status === 'CHECKED_IN' && (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                disabled
                                            >
                                                Already Checked In
                                            </Button>
                                        )}

                                        {(booking.status === 'PENDING' || booking.status === 'CANCELLED') && (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                disabled
                                            >
                                                {booking.status === 'PENDING' ? 'Awaiting Confirmation' : 'Booking Cancelled'}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-1/3 p-4 bg-gray-50 border-r border-gray-100">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold">{booking.hotel.name}</h3>
                                                <p className="text-gray-500 flex items-center text-sm mt-1">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {booking.hotel.address}
                                                </p>
                                            </div>
                                            <div className="mb-2">{getStatusBadge(booking.status)}</div>
                                            <div className="text-sm text-gray-600 flex items-center mt-4">
                                                <Clock className="h-4 w-4 mr-1" />
                                                <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="md:w-2/3 p-4">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="flex items-start space-x-2">
                                                    <Calendar className="h-5 w-5 mt-0.5 text-blue-500" />
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Check-in</p>
                                                        <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <Calendar className="h-5 w-5 mt-0.5 text-blue-500" />
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Check-out</p>
                                                        <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {booking.guests && booking.guests.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex items-center mb-1">
                                                        <User className="h-4 w-4 mr-1 text-gray-500" />
                                                        <p className="font-medium text-sm">Guests:</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {booking.guests.map((guest) => (
                                                            <div key={guest.id} className="text-sm text-gray-600">
                                                                {guest.name} (Age: {guest.age})
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex items-center text-sm">
                                                    <Tag className="h-4 w-4 mr-1 text-gray-500" />
                                                    <span className="font-mono">{booking.id}</span>
                                                </div>

                                                <div>
                                                    {booking.status === 'CONFIRMED' && (
                                                        <Button
                                                            onClick={() => handleCheckIn(booking.id)}
                                                            size="sm"
                                                        >
                                                            Web Check-in
                                                        </Button>
                                                    )}

                                                    {booking.status === 'CHECKED_IN' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled
                                                        >
                                                            Already Checked In
                                                        </Button>
                                                    )}

                                                    {(booking.status === 'PENDING' || booking.status === 'CANCELLED') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled
                                                        >
                                                            {booking.status === 'PENDING' ? 'Awaiting Confirmation' : 'Booking Cancelled'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BookingsPage;