// Utility Functions - Converted for React
import { CONFIG } from './config.js';

export const formatDate = (date) => {
    return new Date(date).toLocaleString({
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString({
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

export const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// API rate limiting - 1 call per minute per API endpoint
const apiCallTimestamps = {};

export const isApiCallAllowed = (apiAction) => {
    const now = Date.now();
    const lastCall = apiCallTimestamps[apiAction];
    const oneMinute = 60 * 1000; // 60 seconds in milliseconds
    
    if (!lastCall || (now - lastCall) >= oneMinute) {
        apiCallTimestamps[apiAction] = now;
        return true;
    }
    
    const remainingTime = Math.ceil((oneMinute - (now - lastCall)) / 1000);
    console.warn(`API call ${apiAction} blocked. Try again in ${remainingTime} seconds.`);
    return false;
};

export const fetchAPI = async (endpoint, options = {}) => {
    // Extract API action from endpoint for rate limiting
    const urlParams = new URLSearchParams(endpoint.substring(1)); // Remove '?' prefix
    const apiAction = urlParams.get('action');
    
    // Apply rate limiting only if it's a recognized API action
    if (apiAction && !isApiCallAllowed(apiAction)) {
        throw new Error(`API call ${apiAction} rate limited. Please wait before trying again.`);
    }

    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    console.log(`API Call: ${endpoint}`); // Debug logging for API tracking
    try {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Utility object for backward compatibility
export const utils = {
    formatDate,
    formatDateTime,
    escapeHtml,
    isApiCallAllowed,
    fetchAPI
};