import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const HotelsPage = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/hotels`);
                setHotels(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch hotels. Please try again later.');
                console.error('Error fetching hotels:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    const handleBookNow = (hotelId) => {
        navigate(`/book/${hotelId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading hotels...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Available Hotels</h1>
            <p className="mb-8 text-gray-600">Select a hotel to book your stay</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                    <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{hotel.name}</CardTitle>
                            <CardDescription>{hotel.address}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">{hotel.description || 'No description available'}</p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => handleBookNow(hotel.id)}
                            >
                                Book Now
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {hotels.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No hotels available at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default HotelsPage;