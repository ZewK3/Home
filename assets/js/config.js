// Constants and Configuration
const CONFIG = {
    API_URL: "https://hrm-api.tocotoco.workers.dev",
    API_BASE_URL: "https://hrm-api.tocotoco.workers.dev",
    STORAGE_KEYS: {
        AUTH_TOKEN: "authToken",
        USER_DATA: "loggedInUser",
        THEME: "theme",
        REMEMBER_ME: "rememberedEmployeeId"
    },
    POLLING_INTERVAL: 3000,
    MAX_RETRY_ATTEMPTS: 3,
    // API Version - set to 'restful' to use new RESTful endpoints, 'legacy' for old action-based
    API_VERSION: 'restful'
};