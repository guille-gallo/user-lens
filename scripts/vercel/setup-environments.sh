#!/bin/bash

# Vercel Environment Setup Script
# This script configures Vercel environments for staging and production

set -e

echo "🔧 Setting up Vercel environments..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Please install it first:${NC}"
    echo "npm i -g vercel"
    exit 1
fi

# Function to set environment variable
set_env_var() {
    local env_name=$1
    local var_name=$2
    local var_value=$3
    local var_type=${4:-"plaintext"}
    
    echo -e "${YELLOW}Setting $var_name for $env_name...${NC}"
    echo "$var_value" | vercel env add "$var_name" "$env_name" --force --scope user-lens
}

echo -e "${GREEN}📋 Setting up staging environment variables...${NC}"

# Staging Environment Variables
echo "Please provide the following staging environment variables:"

read -p "Redis Staging URL: " REDIS_STAGING_URL
read -p "Redis Staging Host: " REDIS_STAGING_HOST
read -p "JWT Secret for Staging: " JWT_SECRET_STAGING

set_env_var "preview" "REDIS_URL" "$REDIS_STAGING_URL"
set_env_var "preview" "REDIS_HOST" "$REDIS_STAGING_HOST"
set_env_var "preview" "JWT_SECRET" "$JWT_SECRET_STAGING"
set_env_var "preview" "NODE_ENV" "staging"
set_env_var "preview" "DB_SEED_SIZE" "10000"
set_env_var "preview" "DB_SEED_TYPE" "synthetic_plus_anonymized"
set_env_var "preview" "ENABLE_DEBUG_LOGS" "false"
set_env_var "preview" "LOG_LEVEL" "info"

echo -e "${GREEN}📋 Setting up production environment variables...${NC}"

# Production Environment Variables
echo "Please provide the following production environment variables:"

read -p "Redis Production URL: " REDIS_PRODUCTION_URL
read -p "Redis Production Host: " REDIS_PRODUCTION_HOST
read -p "JWT Secret for Production: " JWT_SECRET_PRODUCTION

set_env_var "production" "REDIS_URL" "$REDIS_PRODUCTION_URL"
set_env_var "production" "REDIS_HOST" "$REDIS_PRODUCTION_HOST"
set_env_var "production" "JWT_SECRET" "$JWT_SECRET_PRODUCTION"
set_env_var "production" "NODE_ENV" "production"
set_env_var "production" "DB_SEED_SIZE" "0"
set_env_var "production" "DB_SEED_TYPE" "none"
set_env_var "production" "ENABLE_DEBUG_LOGS" "false"
set_env_var "production" "LOG_LEVEL" "warn"
set_env_var "production" "ENABLE_COMPRESSION" "true"
set_env_var "production" "ENABLE_RATE_LIMITING" "true"

echo -e "${GREEN}✅ Vercel environments configured successfully!${NC}"

echo "🔗 Next steps:"
echo "1. Push to 'develop' branch to deploy to staging"
echo "2. Push to 'main' branch to deploy to production"
echo "3. Check deployments: vercel ls"
echo "4. View logs: vercel logs <deployment-url>"
