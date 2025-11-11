"""
Database Setup Script for SQLite
Initializes the database schema from Tabbel-v2-optimized.sql
"""

import sqlite3
import os
from pathlib import Path

def setup_database(db_path='hrm_database.db', sql_file='../data/Tabbel-v2-optimized.sql'):
    """
    Setup SQLite database using the schema file
    
    Args:
        db_path: Path to the SQLite database file
        sql_file: Path to the SQL schema file
    """
    # Get absolute paths
    script_dir = Path(__file__).parent
    db_full_path = script_dir / db_path
    sql_full_path = script_dir / sql_file
    
    print(f"Setting up database at: {db_full_path}")
    print(f"Using schema file: {sql_full_path}")
    
    # Check if SQL file exists
    if not sql_full_path.exists():
        raise FileNotFoundError(f"SQL schema file not found: {sql_full_path}")
    
    # Read SQL schema
    with open(sql_full_path, 'r', encoding='utf-8') as f:
        sql_schema = f.read()
    
    # Connect to database (creates if doesn't exist)
    conn = sqlite3.connect(str(db_full_path))
    cursor = conn.cursor()
    
    try:
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Execute schema (split by semicolon for multiple statements)
        cursor.executescript(sql_schema)
        
        conn.commit()
        print("✓ Database schema created successfully")
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"✓ Created {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")
            
        return True
        
    except sqlite3.Error as e:
        print(f"✗ Error setting up database: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

def reset_database(db_path='hrm_database.db'):
    """
    Reset database by deleting and recreating it
    
    Args:
        db_path: Path to the SQLite database file
    """
    script_dir = Path(__file__).parent
    db_full_path = script_dir / db_path
    
    if db_full_path.exists():
        os.remove(db_full_path)
        print(f"✓ Deleted existing database: {db_full_path}")
    
    return setup_database(db_path)

if __name__ == "__main__":
    import sys
    
    # Check command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == '--reset':
        print("Resetting database...")
        reset_database()
    else:
        print("Setting up database...")
        setup_database()
