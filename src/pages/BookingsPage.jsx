import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';

const BookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

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

    // Fixed fetchBookings function to use the correct API endpoint
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/auth');
                return;
            }

            // Fixed endpoint - removed the duplicate 'api/' prefix
            const response = await axios.get(`${API_URL}/bookings`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setBookings(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching bookings:', err);

            // More detailed error handling
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.status === 401) {
                    // Handle unauthorized error
                    localStorage.removeItem('token'); // Clear invalid token
                    navigate('/auth', { state: { message: 'Your session has expired. Please log in again.' } });
                    return;
                }
                setError(err.response.data.message || 'Failed to fetch your bookings. Please try again.');
            } else if (err.request) {
                // The request was made but no response was received
                setError('No response from server. Please check your internet connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-800",
            CONFIRMED: "bg-blue-100 text-blue-800",
            CHECKED_IN: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800"
        };

        return (
            <Badge className={styles[status] || "bg-gray-100"}>
                {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
            </Badge>
        );
    };

    const handleCheckIn = (bookingId) => {
        navigate(`/checkin/${bookingId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading your bookings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

            {notification && (
                <div className={`mb-6 p-4 rounded flex items-start ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {notification.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    )}
                    <span>{notification.message}</span>
                    <button
                        className="ml-auto text-sm"
                        onClick={() => setNotification(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p>{error}</p>
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
                    <Button onClick={() => navigate('/hotels')}>Book a Hotel</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {bookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{booking.hotel.name}</CardTitle>
                                        <CardDescription>{booking.hotel.address}</CardDescription>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Check-in Date:</p>
                                        <p className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Check-out Date:</p>
                                        <p className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Booking ID:</p>
                                        <p className="font-medium">{booking.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Booking Date:</p>
                                        <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {booking.guests && booking.guests.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-medium mb-2">Guests:</p>
                                        <ul className="list-disc pl-5 text-sm">
                                            {booking.guests.map((guest) => (
                                                <li key={guest.id}>
                                                    {guest.name} (Age: {guest.age})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter>
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
            )}
        </div>
    );
};

export default BookingsPage;