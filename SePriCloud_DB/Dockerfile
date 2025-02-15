# Use the official PostgreSQL image as the base
FROM postgres:latest

# Set the working directory inside the container
WORKDIR /docker-entrypoint-initdb.d

# Copy migration files to the PostgreSQL initialization directory
# PostgreSQL automatically executes scripts in this folder when the container starts (if the database is new)
COPY migrations/ /docker-entrypoint-initdb.d/

# Ensure the scripts have the correct permissions
RUN chmod -R 755 /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432
