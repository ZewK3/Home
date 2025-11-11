"""
Flask API for HRM System
Converted from worker-service.js to Python Flask
"""

from flask import Flask, request, jsonify, g
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
import datetime
from functools import wraps
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
DATABASE = 'hrm_database.db'
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# =====================================================
# DATABASE HELPERS
# =====================================================

def get_db():
    """Get database connection"""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # Enable column access by name
        db.execute("PRAGMA foreign_keys = ON")
    return db

@app.teardown_appcontext
def close_connection(exception):
    """Close database connection"""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    """Execute a query and return results"""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    """Execute a query that modifies data"""
    db = get_db()
    cur = db.cursor()
    cur.execute(query, args)
    db.commit()
    return cur.lastrowid

# =====================================================
# UTILITY FUNCTIONS
# =====================================================

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_employee_id():
    """Generate unique employee ID"""
    return f"E{secrets.randbelow(9000) + 1000}"

def get_hanoi_timestamp():
    """Get current timestamp in Hanoi timezone (UTC+7)"""
    utc_now = datetime.datetime.utcnow()
    hanoi_time = utc_now + datetime.timedelta(hours=7)
    return hanoi_time.isoformat() + 'Z'

def verify_session(session_token):
    """Verify session token and return employee data"""
    session = query_db('''
        SELECT s.employeeId, s.expires_at, e.* 
        FROM sessions s
        JOIN employees e ON s.employeeId = e.employeeId
        WHERE s.session_token = ? AND s.is_active = 1
    ''', [session_token], one=True)
    
    if not session:
        return None
        
    # Check if session expired
    expires_at = datetime.datetime.fromisoformat(session['expires_at'].replace('Z', '+00:00'))
    if expires_at < datetime.datetime.now(datetime.timezone.utc):
        return None
        
    return dict(session)

# =====================================================
# AUTHENTICATION DECORATOR
# =====================================================

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'message': 'No authorization token provided'}), 401
            
        token = auth_header.split(' ')[1]
        user = verify_session(token)
        
        if not user:
            return jsonify({'success': False, 'message': 'Invalid or expired session'}), 401
            
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function

# =====================================================
# API ENDPOINTS
# =====================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'HRM Python API'})

# =====================================================
# AUTHENTICATION ENDPOINTS
# =====================================================

@app.route('/auth/login', methods=['POST'])
def login():
    """Login endpoint"""
    try:
        data = request.get_json()
        employee_id = data.get('employeeId')
        password = data.get('password')
        remember_me = data.get('rememberMe', False)
        
        if not employee_id or not password:
            return jsonify({'success': False, 'message': 'Missing credentials'}), 400
        
        # Hash password
        password_hash = hash_password(password)
        
        # Find employee
        employee = query_db('''
            SELECT e.*, p.permissions, p.positionName
            FROM employees e
            LEFT JOIN positions p ON e.positionId = p.positionId
            WHERE e.employeeId = ? AND e.password = ? AND e.is_active = 1
        ''', [employee_id, password_hash], one=True)
        
        if not employee:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        # Check approval status
        if employee['approval_status'] != 'approved':
            return jsonify({
                'success': False, 
                'message': f'Account status: {employee["approval_status"]}'
            }), 403
        
        # Create session
        session_token = secrets.token_urlsafe(32)
        expires_hours = 720 if remember_me else 24  # 30 days or 24 hours
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=expires_hours)
        
        execute_db('''
            INSERT INTO sessions (employeeId, session_token, expires_at, last_activity)
            VALUES (?, ?, ?, ?)
        ''', [employee_id, session_token, expires_at.isoformat() + 'Z', get_hanoi_timestamp()])
        
        # Update last login
        execute_db('''
            UPDATE employees SET last_login_at = ? WHERE employeeId = ?
        ''', [get_hanoi_timestamp(), employee_id])
        
        # Prepare response
        user_data = {
            'employeeId': employee['employeeId'],
            'fullName': employee['fullName'],
            'email': employee['email'],
            'storeId': employee['storeId'],
            'companyId': employee['companyId'],
            'positionId': employee['positionId'],
            'positionName': employee['positionName'],
            'permissions': employee['permissions'],
            'contract': employee.get('contract', 'fulltime'),
            'birthdate': employee.get('birthdate'),
            'hire_date': employee.get('hire_date')
        }
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': session_token,
            'user': user_data,
            'expiresIn': expires_hours * 3600
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/auth/logout', methods=['POST'])
@require_auth
def logout():
    """Logout endpoint"""
    try:
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.split(' ')[1]
        
        execute_db('''
            UPDATE sessions SET is_active = 0 WHERE session_token = ?
        ''', [token])
        
        return jsonify({'success': True, 'message': 'Logged out successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/auth/me', methods=['GET'])
@require_auth
def get_current_user():
    """Get current user info"""
    return jsonify({'success': True, 'user': g.current_user})

# =====================================================
# EMPLOYEE ENDPOINTS
# =====================================================

@app.route('/employees', methods=['GET'])
@require_auth
def get_employees():
    """Get employees list with optional filters"""
    try:
        # Get query parameters
        limit = request.args.get('limit', type=int)
        store_id = request.args.get('storeId')
        company_id = request.args.get('companyId')
        
        # Build query
        query = '''
            SELECT e.*, p.positionName, p.permissions
            FROM employees e
            LEFT JOIN positions p ON e.positionId = p.positionId
            WHERE e.is_active = 1
        '''
        params = []
        
        if store_id:
            query += ' AND e.storeId = ?'
            params.append(store_id)
            
        if company_id:
            query += ' AND e.companyId = ?'
            params.append(company_id)
            
        query += ' ORDER BY e.created_at DESC'
        
        if limit:
            query += ' LIMIT ?'
            params.append(limit)
        
        employees = query_db(query, params)
        
        # Get total count
        count_query = 'SELECT COUNT(*) as total FROM employees WHERE is_active = 1'
        count_params = []
        
        if store_id:
            count_query += ' AND storeId = ?'
            count_params.append(store_id)
            
        if company_id:
            count_query += ' AND companyId = ?'
            count_params.append(company_id)
        
        total = query_db(count_query, count_params, one=True)['total']
        
        return jsonify({
            'success': True,
            'data': [dict(row) for row in employees],
            'total': total
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# ATTENDANCE ENDPOINTS
# =====================================================

@app.route('/gps/check', methods=['POST'])
@require_auth
def check_gps_attendance():
    """Check GPS and record attendance"""
    try:
        data = request.get_json()
        employee_id = g.current_user['employeeId']
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not latitude or not longitude:
            return jsonify({'success': False, 'message': 'Missing GPS coordinates'}), 400
        
        # Get employee's store location
        store = query_db('''
            SELECT s.latitude, s.longitude, s.radius
            FROM employees e
            JOIN stores s ON e.storeId = s.storeId
            WHERE e.employeeId = ?
        ''', [employee_id], one=True)
        
        if not store:
            return jsonify({'success': False, 'message': 'Store not found'}), 404
        
        # Calculate distance using Haversine formula (simplified)
        from math import radians, cos, sin, asin, sqrt
        
        lat1, lon1 = radians(store['latitude']), radians(store['longitude'])
        lat2, lon2 = radians(float(latitude)), radians(float(longitude))
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        distance = 6371000 * c  # Earth radius in meters
        
        # Check if within radius
        if distance > (store['radius'] or 50):
            return jsonify({
                'success': False,
                'message': f'Too far from store ({int(distance)}m). Must be within {int(store["radius"] or 50)}m'
            }), 403
        
        # Record attendance
        now = get_hanoi_timestamp()
        check_date = now.split('T')[0]
        check_time = now.split('T')[1].split('.')[0]
        
        execute_db('''
            INSERT INTO attendance (employeeId, checkDate, checkTime, checkLocation, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', [employee_id, check_date, check_time, f"{latitude},{longitude}", latitude, longitude])
        
        return jsonify({
            'success': True,
            'message': 'Attendance recorded successfully',
            'distance': int(distance),
            'time': check_time
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# REGISTRATION ENDPOINTS
# =====================================================

@app.route('/auth/register', methods=['POST'])
def register():
    """Register new employee"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'password', 'phone', 'storeId']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'Missing field: {field}'}), 400
        
        # Check if email already exists
        existing = query_db('SELECT employeeId FROM employees WHERE email = ?', [data['email']], one=True)
        if existing:
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        
        # Generate employee ID
        employee_id = generate_employee_id()
        password_hash = hash_password(data['password'])
        
        # Create pending registration
        verification_code = secrets.token_hex(4).upper()
        
        execute_db('''
            INSERT INTO pending_registrations 
            (employeeId, email, password, fullName, phone, storeId, companyId, positionId, verification_code, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        ''', [
            employee_id,
            data['email'],
            password_hash,
            data['fullName'],
            data['phone'],
            data['storeId'],
            data.get('companyId', 'CH'),
            data.get('positionId', 'CH_NV'),
            verification_code
        ])
        
        return jsonify({
            'success': True,
            'message': 'Registration submitted. Awaiting approval.',
            'employeeId': employee_id,
            'requiresVerification': False
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# RUN APPLICATION
# =====================================================

if __name__ == '__main__':
    # Check if database exists
    if not os.path.exists(DATABASE):
        print("Database not found. Please run setup_database.py first.")
        exit(1)
    
    print("Starting Flask HRM API...")
    print("API will be available at: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
