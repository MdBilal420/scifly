# Testing Your Supabase Database Setup

## Step 1: Create Environment File

Create a `.env` file in your project root with these contents:

```bash
# Replace with your actual Supabase values
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_API_KEY=your-anon-key-here
```

## Step 2: Get Your Supabase Credentials

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy your **Project URL** (example: `https://abcdefghijk.supabase.co`)
5. Copy your **anon public** key (starts with `eyJhbGciOiJIUzI1NiIs...`)

## Step 3: Update Your .env File

Replace the placeholder values in your `.env` file:

```bash
REACT_APP_SUPABASE_URL=https://abcdefghijk.supabase.co
REACT_APP_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

## Step 4: Run the Test

```bash
node test-supabase.js
```

## Expected Output

If everything is working correctly, you should see:

```
🚀 SciFly Supabase Database Test

✅ Environment variables configured
✅ Database connection successful
✅ All 12 tables exist
✅ Found 10 topics and 10 achievements

🎉 Supabase database setup is working correctly!
```

## Troubleshooting

### Connection Failed
- Check your Supabase URL and anon key
- Ensure your Supabase project is active
- Verify you ran the `supabase_schema.sql` script

### Tables Not Found
- Make sure you executed the entire `supabase_schema.sql` file in your Supabase SQL Editor
- Check for any SQL errors in the Supabase dashboard

### No Seed Data
- The schema includes INSERT statements for topics and achievements
- If missing, re-run the seed data section of the SQL script

## Next Steps

Once the test passes, you can start integrating Supabase with your SciFly app! 