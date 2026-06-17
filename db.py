import sqlite3, os

# DB_PATH = os.path.join(os.path.dirname(__file__), "apex.db")
DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "apex.db"))


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.executescript("""
    CREATE TABLE IF NOT EXISTS events (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT NOT NULL,
        day     INTEGER NOT NULL CHECK(day BETWEEN 0 AND 6),
        time    TEXT NOT NULL,
        cat     TEXT NOT NULL DEFAULT 'personal',
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workouts (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        day     TEXT NOT NULL,
        type    TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exercises (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        sets       TEXT,
        weight     TEXT,
        sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT NOT NULL,
        amount  REAL NOT NULL,
        cat     TEXT NOT NULL DEFAULT 'Other',
        date    TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS groceries (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT NOT NULL,
        cat     TEXT NOT NULL DEFAULT 'Other',
        price   REAL DEFAULT 0,
        done    INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habits (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT NOT NULL,
        icon    TEXT DEFAULT '✓',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id  INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        log_date  TEXT NOT NULL,
        UNIQUE(habit_id, log_date)
    );

    CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings(key, value) VALUES ('monthly_budget', '2500');
    """)

    # Seed defaults only if tables are empty
    if c.execute("SELECT COUNT(*) FROM events").fetchone()[0] == 0:
        c.executemany("INSERT INTO events(name,day,time,cat) VALUES(?,?,?,?)", [
            ("Morning workout", 0, "07:00", "health"),
            ("Team standup",    0, "09:30", "work"),
            ("Deep work block", 0, "10:00", "work"),
            ("Lunch break",     0, "12:30", "personal"),
            ("Client call",     1, "14:00", "work"),
            ("Gym",             2, "07:00", "health"),
            ("Friends dinner",  4, "19:00", "social"),
        ])

    if c.execute("SELECT COUNT(*) FROM workouts").fetchone()[0] == 0:
        days = [
            ("Mon", "upper", [("Bench press","4×8","80"),("Barbell rows","4×10","70"),("Shoulder press","3×10","50")]),
            ("Tue", "lower", [("Squat","4×8","100"),("Romanian DL","3×10","80"),("Leg press","3×12","120")]),
            ("Wed", "cardio",[("Zone 2 run","45 min",""),("Stretching","10 min","")]),
            ("Thu", "upper", [("Pull-ups","4×8","BW"),("Dips","3×12","BW"),("Bicep curls","3×12","20")]),
            ("Fri", "lower", [("Deadlift","4×5","120"),("Lunges","3×12","40"),("Calf raises","4×15","60")]),
            ("Sat", "rest",  []),
            ("Sun", "rest",  []),
        ]
        for day, wtype, exs in days:
            c.execute("INSERT INTO workouts(day,type) VALUES(?,?)", (day, wtype))
            wid = c.lastrowid
            for i, (nm, sets, wt) in enumerate(exs):
                c.execute("INSERT INTO exercises(workout_id,name,sets,weight,sort_order) VALUES(?,?,?,?,?)", (wid,nm,sets,wt,i))

    if c.execute("SELECT COUNT(*) FROM transactions").fetchone()[0] == 0:
        c.executemany("INSERT INTO transactions(name,amount,cat,date) VALUES(?,?,?,?)", [
            ("Groceries run",   65.40, "Groceries", "Jun 12"),
            ("Gym membership",  40.00, "Health",    "Jun 1"),
            ("Coffee",           4.50, "Food",      "Jun 14"),
            ("Monthly bus pass",55.00, "Transport", "Jun 1"),
        ])

    if c.execute("SELECT COUNT(*) FROM groceries").fetchone()[0] == 0:
        c.executemany("INSERT INTO groceries(name,cat,price,done,sort_order) VALUES(?,?,?,?,?)", [
            ("Chicken breast", "Protein", 12.00, 0, 0),
            ("Greek yoghurt",  "Dairy",    4.50, 0, 1),
            ("Broccoli",       "Veg",      2.50, 1, 2),
            ("Brown rice",     "Carbs",    3.00, 0, 3),
            ("Eggs (12)",      "Protein",  5.50, 0, 4),
            ("Spinach",        "Veg",      2.00, 1, 5),
            ("Oats",           "Carbs",    3.50, 0, 6),
        ])

    if c.execute("SELECT COUNT(*) FROM habits").fetchone()[0] == 0:
        c.executemany("INSERT INTO habits(name,icon,sort_order) VALUES(?,?,?)", [
            ("Morning workout", "💪", 0),
            ("Drink 2L water",  "💧", 1),
            ("Read 30 mins",    "📚", 2),
            ("No junk food",    "🥗", 3),
            ("Sleep by 11pm",   "😴", 4),
        ])

    conn.commit()
    conn.close()
    print(f"[DB] Initialized at {DB_PATH}")