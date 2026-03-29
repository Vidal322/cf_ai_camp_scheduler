CREATE TABLE Activity (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('sport', 'cultural', 'slow')),
    is_indoor INTEGER NOT NULL CHECK (is_indoor IN (0, 1)),
    description TEXT NOT NULL
);

CREATE TABLE Room (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    is_indoor INTEGER NOT NULL CHECK (is_indoor IN (0, 1)),
    description TEXT NOT NULL
);

CREATE TABLE Camp (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL
);

CREATE TABLE Schedule (
    id INTEGER PRIMARY KEY,
    camp_id INTEGER NOT NULL,
    FOREIGN KEY (camp_id) REFERENCES Camp(id)
);

CREATE TABLE ScheduleSlot (
    id INTEGER PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 7),
    period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon')),
    FOREIGN KEY (schedule_id) REFERENCES Schedule(id),
    FOREIGN KEY (activity_id) REFERENCES Activity(id),
    FOREIGN KEY (room_id) REFERENCES Room(id)
);

CREATE TABLE ChatMessage (
    id INTEGER PRIMARY KEY,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    camp_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (camp_id) REFERENCES Camp(id)
);
