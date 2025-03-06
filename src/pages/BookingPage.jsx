import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, formatDate, isValidAadhaar } from '../lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const BookingPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();

    const [hotel, setHotel] = useState(null);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [primaryGuestAadhaar, setPrimaryGuestAadhaar] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/hotels/${hotelId}`);
                setHotel(response.data);
                setErrors({});
            } catch (err) {
                setErrors({ general: 'Failed to fetch hotel details. Please try again later.' });
                console.error('Error fetching hotel:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [hotelId]);

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!checkInDate) {
            newErrors.checkInDate = 'Please select a check-in date';
            isValid = false;
        }

        if (!checkOutDate) {
            newErrors.checkOutDate = 'Please select a check-out date';
            isValid = false;
        }

        if (checkInDate && checkOutDate && checkInDate >= checkOutDate) {
            newErrors.checkOutDate = 'Check-out date must be after check-in date';
            isValid = false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate && checkInDate < today) {
            newErrors.checkInDate = 'Check-in date cannot be in the past';
            isValid = false;
        }

        if (primaryGuestAadhaar && !isValidAadhaar(primaryGuestAadhaar)) {
            newErrors.primaryGuestAadhaar = 'Aadhaar number must be 12 digits';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setErrors({});

            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/auth');
                return;
            }

            const bookingData = {
                checkInDate: formatDate(checkInDate),
                checkOutDate: formatDate(checkOutDate)
            };

            // Only include Aadhaar if provided and valid
            if (primaryGuestAadhaar.trim() && isValidAadhaar(primaryGuestAadhaar.trim())) {
                bookingData.primaryGuestAadhaar = primaryGuestAadhaar.trim();
            }

            console.log('Sending booking data:', bookingData); // Debugging

            const response = await axios.post(
                `${API_URL}/hotels/${hotelId}/book`,
                bookingData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            navigate('/bookings', {
                state: {
                    success: true,
                    message: 'Hotel booked successfully!',
                    bookingId: response.data.booking.id
                }
            });
        } catch (err) {
            console.error('Booking error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to book hotel. Please try again.';
            const errorDetails = err.response?.data?.details || '';

            setErrors({
                general: errorMessage + (errorDetails ? ` (${errorDetails})` : '')
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading hotel details...</div>
                </div>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Hotel not found. Please go back and select another hotel.</p>
                </div>
                <div className="mt-4">
                    <Button onClick={() => navigate('/hotels')}>Back to Hotels</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Book Your Stay</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{hotel.name}</CardTitle>
                    <CardDescription>{hotel.address}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">{hotel.description || 'No description available'}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                    <CardDescription>Fill in your booking information</CardDescription>
                </CardHeader>
                <CardContent>
                    {errors.general && (
                        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleBooking}>
                        <div className="grid grid-cols-1 gap-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="block mb-2">Check-in Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${errors.checkInDate ? 'border-red-500' : ''}`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {checkInDate ? format(checkInDate, 'PPP') : <span>Select date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={checkInDate}
                                                onSelect={setCheckInDate}
                                                initialFocus
                                                disabled={(date) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    return date < today;
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.checkInDate && (
                                        <p className="mt-1 text-xs text-red-500">{errors.checkInDate}</p>
                                    )}
                                </div>

                                <div>
                                    <Label className="block mb-2">Check-out Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${errors.checkOutDate ? 'border-red-500' : ''}`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {checkOutDate ? format(checkOutDate, 'PPP') : <span>Select date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={checkOutDate}
                                                onSelect={setCheckOutDate}
                                                initialFocus
                                                disabled={(date) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    return date < today || (checkInDate && date <= checkInDate);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.checkOutDate && (
                                        <p className="mt-1 text-xs text-red-500">{errors.checkOutDate}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="aadhaar" className="block mb-2">
                                    Primary Guest Aadhaar (Optional)
                                </Label>
                                <Input
                                    id="aadhaar"
                                    value={primaryGuestAadhaar}
                                    onChange={(e) => setPrimaryGuestAadhaar(e.target.value)}
                                    placeholder="12-digit Aadhaar number"
                                    maxLength={12}
                                    className={errors.primaryGuestAadhaar ? 'border-red-500' : ''}
                                />
                                {errors.primaryGuestAadhaar ? (
                                    <p className="mt-1 text-xs text-red-500">{errors.primaryGuestAadhaar}</p>
                                ) : (
                                    <p className="mt-1 text-xs text-gray-500">
                                        This is optional during booking. You'll need to provide Aadhaar details for all guests during check-in.
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : 'Book Now'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hotels')}
                    >
                        Back to Hotels
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default BookingPage;