# Python Flask API for HRM System

This is a Python Flask implementation of the HRM API, converted from the original worker-service.js.

## Features

- ✅ Authentication (login/logout/session management)
- ✅ Employee management
- ✅ GPS-based attendance tracking
- ✅ Registration workflow
- ✅ SQLite database backend
- ✅ CORS enabled for frontend integration

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup Database

```bash
python setup_database.py
```

To reset the database:
```bash
python setup_database.py --reset
```

### 3. Run the API

```bash
python app.py
```

The API will be available at: `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Authentication
- `POST /auth/login` - Login with employeeId and password
- `POST /auth/logout` - Logout (requires auth)
- `GET /auth/me` - Get current user info (requires auth)
- `POST /auth/register` - Register new employee

### Employees
- `GET /employees` - Get employees list (requires auth)
  - Query params: `limit`, `storeId`, `companyId`

### Attendance
- `POST /gps/check` - Check GPS and record attendance (requires auth)
  - Body: `{latitude, longitude}`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <session_token>
```

## Database

The API uses SQLite with the schema defined in `../data/Tabbel-v2-optimized.sql`.

Database file: `hrm_database.db`

## Environment Variables

- `SECRET_KEY` - Secret key for session management (default: 'dev-secret-key-change-in-production')

## CORS

CORS is enabled for all origins by default. Modify `app.py` to restrict origins in production.

## Error Handling

All endpoints return JSON responses with the following structure:

Success:
```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

Error:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Development

- The API runs in debug mode by default
- Auto-reload is enabled during development
- Access logs are printed to console

## Production Deployment

For production:
1. Set `DEBUG=False` in app.py
2. Set a strong `SECRET_KEY` environment variable
3. Configure proper CORS origins
4. Use a production WSGI server (gunicorn, uwsgi, etc.)
5. Set up proper logging
6. Use environment-based configuration

Example with gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
