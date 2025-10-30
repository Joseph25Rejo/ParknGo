#!/bin/bash
# Startup script for Azure App Service

# Print environment variables (for debugging)
echo "Starting ParknGo CRUD API..."
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "PORT: ${PORT:-not set}"

# Start the application
npm start