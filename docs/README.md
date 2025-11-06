# 🍵 Kulhad Chai - Internal Documentation

## Overview
This documentation is for the internal development team. It covers the complete workflow, architecture, and operational procedures for the Kulhad Chai restaurant management system.

## Documentation Structure

### 📁 Setup
- [Installation Guide](./setup/installation.md) - Complete setup instructions
- [Environment Configuration](./setup/environment.md) - Environment variables and configuration
- [Database Setup](./setup/database.md) - Supabase and PostgreSQL setup
- [Admin User Creation](./setup/admin-creation.md) - Creating admin accounts

### 🏗️ Architecture
- [System Architecture](./architecture/system-overview.md) - High-level system design
- [Database Schema](./architecture/database-schema.md) - Complete database structure
- [Authentication Flow](./architecture/authentication.md) - Auth system implementation
- [File Structure](./architecture/file-structure.md) - Project organization

### 🎯 Features
- [Customer Portal](./features/customer-portal.md) - QR ordering system
- [Admin Dashboard](./features/admin-dashboard.md) - Business management
- [Billing System](./features/billing.md) - Invoice and payment processing
- [Analytics](./features/analytics.md) - Reporting and insights
- [Menu Management](./features/menu-management.md) - Product catalog

### 🚀 Deployment
- [Production Deployment](./deployment/production.md) - Deployment procedures
- [Environment Setup](./deployment/environments.md) - Dev, staging, production
- [CI/CD Pipeline](./deployment/cicd.md) - Automated deployment

### 🔧 Troubleshooting
- [Common Issues](./troubleshooting/common-issues.md) - Known problems and fixes
- [Debug Guide](./troubleshooting/debugging.md) - Debugging procedures
- [Performance](./troubleshooting/performance.md) - Performance optimization

## Quick Links
- [Main README](../README.md) - Public-facing documentation
- [Codebase Overview](../CODEBASE_OVERVIEW.md) - Code structure reference
- [Setup Complete](../SETUP_COMPLETE.md) - Initial setup verification

## Development Workflow

### 1. Local Development
```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Configure Supabase credentials

# Run development server
pnpm dev
```

### 2. Making Changes
- Create feature branch from `main`
- Implement changes with proper testing
- Update documentation if needed
- Submit for code review

### 3. Testing
- Test locally with dev database
- Verify all features work as expected
- Check responsive design on mobile
- Test authentication flows

### 4. Deployment
- Merge to `main` after approval
- Automatic deployment via Vercel
- Monitor for errors in production

## Key Contacts
- **Tech Lead**: [Add contact]
- **Database Admin**: [Add contact]
- **DevOps**: [Add contact]

## Last Updated
October 28, 2025
