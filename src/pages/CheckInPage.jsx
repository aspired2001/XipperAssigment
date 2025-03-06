import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, isValidAadhaar } from '../lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { PlusCircle, MinusCircle, Trash2 } from 'lucide-react';

const CheckInPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [guests, setGuests] = useState([{ name: '', aadhaarNumber: '', age: '' }]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/auth');
                    return;
                }

                // Using the correct endpoint to fetch a single booking by ID
                const response = await axios.get(`${API_URL}/api/checkin/booking/${bookingId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const foundBooking = response.data;

                if (!foundBooking) {
                    setGeneralError('Booking not found or you do not have permission to access it.');
                    return;
                }

                if (foundBooking.status === 'CHECKED_IN') {
                    setGeneralError('This booking has already been checked in.');
                    return;
                }

                setBooking(foundBooking);
            } catch (err) {
                setGeneralError('Failed to fetch booking details. Please try again later.');
                console.error('Error fetching booking:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, navigate]);

    const addGuest = () => {
        setGuests([...guests, { name: '', aadhaarNumber: '', age: '' }]);
    };

    const removeGuest = (index) => {
        if (guests.length > 1) {
            const newGuests = [...guests];
            newGuests.splice(index, 1);
            setGuests(newGuests);
        }
    };

    const handleGuestChange = (index, field, value) => {
        const newGuests = [...guests];
        newGuests[index][field] = value;
        setGuests(newGuests);

        // Clear errors for this field if value is valid
        if (errors[`guests[${index}].${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`guests[${index}].${field}`];
            setErrors(newErrors);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        guests.forEach((guest, index) => {
            if (!guest.name.trim()) {
                newErrors[`guests[${index}].name`] = 'Name is required';
                isValid = false;
            }

            if (!guest.aadhaarNumber.trim()) {
                newErrors[`guests[${index}].aadhaarNumber`] = 'Aadhaar number is required';
                isValid = false;
            } else if (!isValidAadhaar(guest.aadhaarNumber)) {
                newErrors[`guests[${index}].aadhaarNumber`] = 'Aadhaar number must be 12 digits';
                isValid = false;
            }

            if (!guest.age.trim()) {
                newErrors[`guests[${index}].age`] = 'Age is required';
                isValid = false;
            } else if (isNaN(guest.age) || parseInt(guest.age) <= 0) {
                newErrors[`guests[${index}].age`] = 'Age must be a positive number';
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setGeneralError(null);

            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/auth');
                return;
            }

            await axios.post(
                `${API_URL}/api/checkin/booking/${bookingId}`,
                {
                    guests: guests.map(g => ({
                        name: g.name.trim(),
                        aadhaarNumber: g.aadhaarNumber.trim(),
                        age: parseInt(g.age)
                    }))
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            navigate('/bookings', {
                state: {
                    success: true,
                    message: 'Check-in completed successfully!'
                }
            });
        } catch (err) {
            console.error('Check-in error:', err);

            if (err.response?.data?.message.includes('Aadhaar number already registered')) {
                setGeneralError('One or more Aadhaar numbers are already registered in the system.');
            } else {
                setGeneralError(err.response?.data?.message || 'Failed to complete check-in. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading booking details...</div>
                </div>
            </div>
        );
    }

    if (generalError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{generalError}</p>
                </div>
                <Button onClick={() => navigate('/bookings')}>Back to Bookings</Button>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>Booking not found. Please go back and select a valid booking.</p>
                </div>
                <Button onClick={() => navigate('/bookings')}>Back to Bookings</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Web Check-in</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{booking.hotel.name}</CardTitle>
                    <CardDescription>{booking.hotel.address}</CardDescription>
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
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Guest Information</CardTitle>
                    <CardDescription>
                        Please provide details for all guests. Each guest must have a valid Aadhaar number.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {generalError && (
                        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            <p>{generalError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {guests.map((guest, index) => (
                            <div key={index} className="mb-6 p-4 border rounded bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium">Guest {index + 1}</h3>
                                    {guests.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeGuest(index)}
                                            className="h-8 w-8 text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor={`guest-${index}-name`}>Full Name</Label>
                                        <Input
                                            id={`guest-${index}-name`}
                                            value={guest.name}
                                            onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                                            placeholder="Enter full name as per Aadhaar"
                                            className={errors[`guests[${index}].name`] ? 'border-red-500' : ''}
                                        />
                                        {errors[`guests[${index}].name`] && (
                                            <p className="mt-1 text-xs text-red-500">{errors[`guests[${index}].name`]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor={`guest-${index}-aadhaar`}>Aadhaar Number</Label>
                                        <Input
                                            id={`guest-${index}-aadhaar`}
                                            value={guest.aadhaarNumber}
                                            onChange={(e) => handleGuestChange(index, 'aadhaarNumber', e.target.value)}
                                            placeholder="12-digit Aadhaar number"
                                            maxLength={12}
                                            className={errors[`guests[${index}].aadhaarNumber`] ? 'border-red-500' : ''}
                                        />
                                        {errors[`guests[${index}].aadhaarNumber`] && (
                                            <p className="mt-1 text-xs text-red-500">{errors[`guests[${index}].aadhaarNumber`]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor={`guest-${index}-age`}>Age</Label>
                                        <Input
                                            id={`guest-${index}-age`}
                                            value={guest.age}
                                            onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                                            placeholder="Age in years"
                                            type="number"
                                            min="1"
                                            className={errors[`guests[${index}].age`] ? 'border-red-500' : ''}
                                        />
                                        {errors[`guests[${index}].age`] && (
                                            <p className="mt-1 text-xs text-red-500">{errors[`guests[${index}].age`]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addGuest}
                            className="w-full mb-6"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Another Guest
                        </Button>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : 'Complete Check-in'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/bookings')}
                    >
                        Back to Bookings
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default CheckInPage;