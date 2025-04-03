CREATE TABLE file_metadata (
    id TEXT PRIMARY KEY,
    added_by TEXT,
    datetime_added TIMESTAMP NOT NULL,
    filename TEXT NOT NULL,
    tags TEXT,
    description TEXT
);

CREATE TABLE api_keys (
    api_key TEXT PRIMARY KEY,
    username TEXT NOT NULL
);
