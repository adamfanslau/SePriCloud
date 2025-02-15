CREATE TABLE file_metadata (
    id TEXT PRIMARY KEY,
    datetime_added TIMESTAMP NOT NULL,
    filename TEXT NOT NULL,
    tags TEXT,
    description TEXT
);
