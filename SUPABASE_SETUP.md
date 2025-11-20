# Supabase Setup for Vercel Deployment

This guide will help you set up a Supabase database for your Habesha ERP application when deploying to Vercel.

## Prerequisites

1. A Vercel account
2. A Supabase account (free tier available)

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Choose a name for your project (e.g., "habesha-erp")
4. Select a region closest to your users
5. Set a strong database password
6. Click "Create New Project"

## Step 2: Get Your Supabase Credentials

Once your project is created, you'll need to get your database credentials:

1. In your Supabase project dashboard, click on "Settings" (gear icon)
2. Click on "Database"
3. Under "Connection Info", you'll find:
   - **Host**: This will be used in your DATABASE_URL
   - **Database**: Usually "postgres"
   - **User**: Usually "postgres"
   - **Password**: The password you set during project creation

## Step 3: Update Your Environment Variables

Update your `.env.production` file with your actual Supabase credentials:

```env
# Replace these values with your actual Supabase credentials
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
NEXTAUTH_URL=https://your-actual-vercel-app.vercel.app
```

For example:
```env
DATABASE_URL=postgresql://postgres:mysecretpassword@db.abcd1234.supabase.co:5432/postgres
NEXTAUTH_URL=https://habesha-erp.vercel.app
```

## Step 4: Run Database Migrations

1. Make sure you have the correct DATABASE_URL in your environment
2. Run the following command to apply migrations:

```bash
npx prisma migrate deploy
```

## Step 5: Set Up Initial Data

Run the setup script to create the admin user and sample data:

```bash
npx tsx scripts/setup-supabase.ts
```

## Step 6: Deploy to Vercel

1. Commit your changes to git
2. Push to your repository
3. Connect your repository to Vercel
4. In Vercel, add your environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `NEXTAUTH_SECRET`: Your NextAuth secret
   - `NEXTAUTH_URL`: Your Vercel deployment URL

## Troubleshooting

### Connection Issues

If you encounter connection issues, try using the connection pooling URL for runtime:

```
DATABASE_URL=postgres://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?connection_limit=1
```

### Migration Errors

If you get migration errors, you might need to reset your database:

```bash
npx prisma migrate reset
```

### Admin Login Issues

If you can't log in as admin, reset the admin password:

```bash
npx tsx scripts/reset-admin-password.ts
```

## Admin Credentials

After setup, you can log in with:
- **Email**: admin@vanityhub.com
- **Password**: Admin33#

## Additional Notes

1. Always use environment variables for sensitive information
2. Never commit actual credentials to your repository
3. Use different secrets for development and production
4. Regularly backup your Supabase database