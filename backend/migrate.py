import sqlite3
import os

def run_migration():
    # Construct absolute path to DB file
    db_path = os.path.join(os.path.dirname(__file__), "smart_nyaya.db")
    print(f"Connecting to {db_path}...")
    
    if not os.path.exists(db_path):
        print("Database file not found. It will be created on first start.")
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    columns_to_add = [
        ("gender", "VARCHAR(50)"),
        ("phone", "VARCHAR(20)")
    ]

    for col_name, col_type in columns_to_add:
        try:
            c.execute(f"ALTER TABLE complaints ADD COLUMN {col_name} {col_type}")
            print(f"Successfully added column: {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column '{col_name}' already exists. Skipping.")
            else:
                print(f"Error adding column '{col_name}': {e}")

    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    run_migration()
