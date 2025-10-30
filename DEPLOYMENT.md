# Azure Deployment Guide

## Prerequisites

1. Azure Subscription
2. MongoDB Database (MongoDB Atlas recommended)
3. Google OAuth credentials (optional)

## Step-by-Step Deployment

### 1. Prepare Azure Resources

#### Create App Service
1. Go to Azure Portal
2. Create a new "Web App"
3. Select:
   - Runtime stack: Node.js 18 LTS
   - Operating System: Linux
   - Region: Choose appropriate region
   - Sku and size: Free F1 or higher (Free tier has limitations)

#### Configure Application Settings
In your App Service, go to "Settings" > "Configuration" and add these application settings:

#### Configure Startup Command (Optional)
If you want to use the custom startup script:
1. In your App Service, go to "Settings" > "Configuration"
2. Under "General settings", set the "Startup command" to `startup.sh`
3. This script will log environment information and start your application

| Name | Value | Notes |
|------|-------|-------|
| MONGO_URI | Your MongoDB connection string | Required |
| JWT_ACCESS_SECRET | Strong random string | Required for JWT tokens |
| JWT_REFRESH_SECRET | Different strong random string | Required for JWT tokens |
| GOOGLE_CLIENT_ID | Your Google OAuth client ID | Optional |
| GOOGLE_CLIENT_SECRET | Your Google OAuth client secret | Optional |

### 2. Set Up GitHub Actions

#### Get Publish Profile
1. In Azure Portal, go to your App Service
2. Click "Get publish profile" and download the file
3. Open the file and copy its contents

#### Configure GitHub Secrets
In your GitHub repository:
1. Go to "Settings" > "Secrets and variables" > "Actions"
2. Add these secrets:

| Name | Value |
|------|-------|
| AZURE_WEBAPP_NAME | Your Azure App Service name |
| AZURE_WEBAPP_PUBLISH_PROFILE | Contents of the publish profile file |

### 3. Deploy

Push to your main branch, and the GitHub Actions workflow will automatically deploy your application.

## Environment Variables Details

### Required Variables
- `MONGO_URI`: MongoDB connection string (e.g., mongodb+srv://username:password@cluster.mongodb.net/database)
- `JWT_ACCESS_SECRET`: Secret key for signing access tokens (use a strong random string)
- `JWT_REFRESH_SECRET`: Secret key for signing refresh tokens (different from access secret)

### Optional Variables
- `GOOGLE_CLIENT_ID`: For Google authentication
- `GOOGLE_CLIENT_SECRET`: For Google authentication
- `CLIENT_URL`: Frontend URL for CORS configuration

## Troubleshooting

### Common Issues

1. **Application crashes on startup**
   - Check logs in Azure Portal under "Monitoring" > "Log stream"
   - Verify all required environment variables are set

2. **Database connection fails**
   - Ensure your MongoDB Atlas cluster allows connections from Azure IP addresses
   - Check that your MONGO_URI is correct

3. **CORS errors**
   - Set CLIENT_URL environment variable to your frontend URL

### Viewing Logs
In Azure Portal:
1. Go to your App Service
2. Navigate to "Monitoring" > "Log stream"
3. Or check "App Service logs" for detailed logging configuration

## Scaling Options

### Vertical Scaling
Upgrade your App Service plan to increase:
- CPU cores
- Memory
- Disk space

### Horizontal Scaling
Configure auto-scaling rules based on:
- CPU usage
- Memory usage
- HTTP queue length

## Custom Domain (Optional)

1. In Azure Portal, go to your App Service
2. Navigate to "Custom domains"
3. Add your custom domain
4. Follow the DNS configuration instructions