# Use the official MongoDB image from Docker Hub
FROM mongo:latest

# Set up environment variables for the MongoDB database
ENV MONGO_INITDB_DATABASE=movie-manager

# Expose the default MongoDB port
EXPOSE 27017
