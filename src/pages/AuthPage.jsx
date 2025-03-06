import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const { login, register, error, clearError } = useAuth();
    const navigate = useNavigate();

    // Clear auth context error when component unmounts or tab changes
    useEffect(() => {
        return () => {
            if (clearError) clearError();
        };
    }, [activeTab, clearError]);

    // Update component error state when auth context error changes
    useEffect(() => {
        if (error) {
            setSubmitError(error);
        }
    }, [error]);

    const validateForm = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            console.log(`Attempting to ${activeTab}...`);

            if (activeTab === 'login') {
                await login(email, password);
            } else {
                await register(email, password);
            }

            console.log('Authentication successful, navigating to hotels page');
            navigate('/hotels');
        } catch (err) {
            console.error(`${activeTab} error:`, err);
            setSubmitError(err.message || `${activeTab === 'login' ? 'Login' : 'Registration'} failed`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setErrors({});
        setSubmitError('');
        if (clearError) clearError();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">
                            {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {activeTab === 'login'
                                ? 'Sign in to your account to continue'
                                : 'Register to start booking hotels'}
                        </CardDescription>
                    </CardHeader>

                    <div className="flex border-b">
                        <button
                            className={`flex-1 py-2 text-center transition-colors ${activeTab === 'login'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => switchTab('login')}
                        >
                            Login
                        </button>
                        <button
                            className={`flex-1 py-2 text-center transition-colors ${activeTab === 'register'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => switchTab('register')}
                        >
                            Register
                        </button>
                    </div>

                    <CardContent className="pt-6">
                        {submitError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{submitError}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <Label htmlFor="email" className="block mb-1">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <span className="text-sm text-red-500">{errors.email}</span>
                                )}
                            </div>

                            <div className="mb-6">
                                <Label htmlFor="password" className="block mb-1">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && (
                                    <span className="text-sm text-red-500">{errors.password}</span>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    'Please wait...'
                                ) : activeTab === 'login' ? (
                                    'Sign In'
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-gray-500">
                            {activeTab === 'login' ? (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline"
                                        onClick={() => switchTab('register')}
                                    >
                                        Register
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline"
                                        onClick={() => switchTab('login')}
                                    >
                                        Login
                                    </button>
                                </>
                            )}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;