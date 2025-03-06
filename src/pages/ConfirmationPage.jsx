import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';

const ConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { success, message, bookingId } = location.state || {};

    useEffect(() => {
        // If no success message is provided, redirect to bookings
        if (!success) {
            navigate('/bookings');
        }
    }, [success, navigate]);

    if (!success) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-center text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                            <CardTitle className="text-2xl font-bold">Success!</CardTitle>
                            <CardDescription className="text-lg mt-2">
                                {message || 'Your request has been processed successfully.'}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="text-center">
                        {bookingId && (
                            <p className="text-gray-600 mb-4">
                                Booking ID: <span className="font-medium">{bookingId}</span>
                            </p>
                        )}
                        <p className="text-gray-600">
                            You can view and manage your bookings from the bookings page.
                        </p>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2">
                        <Button
                            className="w-full"
                            onClick={() => navigate('/bookings')}
                        >
                            View My Bookings
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate('/hotels')}
                        >
                            Book Another Hotel
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ConfirmationPage;