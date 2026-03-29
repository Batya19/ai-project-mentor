"""Database migration script to update schema."""

import psycopg2

try:
    conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/ai_project_mentor')
    cur = conn.cursor()
    
    # Drop projects table to recreate with new schema
    cur.execute("DROP TABLE IF EXISTS projects CASCADE;")
    conn.commit()
    print("✓ Dropped projects table")
    
    cur.close()
    conn.close()
    print("✓ Database migration complete")
except Exception as e:
    print(f"✗ Error: {e}")
