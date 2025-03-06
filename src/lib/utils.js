import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// API base URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Format a date object to ISO string format (YYYY-MM-DD)
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return null;

    // Create new date to avoid modifying the original
    const d = new Date(date);

    // Get date in YYYY-MM-DD format
    return d.toISOString().split('T')[0];
};

/**
 * Validates if a string is a valid 12-digit Aadhaar number
 * @param {string} aadhaar - Aadhaar number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidAadhaar = (aadhaar) => {
    return /^\d{12}$/.test(aadhaar);
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Format price in Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Calculate the number of nights between two dates
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @returns {number} Number of nights
 */
export const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};