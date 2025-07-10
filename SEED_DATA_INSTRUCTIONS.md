# 🌱 Seed Data Instructions

## How to Add Seed Data to Your Supabase Database

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your SciFly project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Copy the Seed Data Script
1. Open the file `supabase_seed_data.sql` in your project
2. Copy the **entire contents** of the file (Ctrl+A, then Ctrl+C)

### Step 3: Run the Script
1. In the Supabase SQL Editor, paste the script
2. Click **"Run"** or press Ctrl+Enter to execute
3. Wait for the execution to complete

### Step 4: Verify the Results
You should see output like this:
```
Achievements inserted: 10
Topics inserted: 10

Sample achievements:
achievement_key | title        | category
first_lesson   | First Steps  | learning
quiz_master    | Quiz Master  | quiz
...

Sample topics:
slug           | title                  | difficulty
water-cycle    | Water Cycle & Weather  | 1
animals-hab... | Animals & Habitats     | 1
...

🎉 Seed data insertion completed successfully!
```

## 📊 What Gets Added

### 🏆 10 Achievements
- **First Steps** - Complete your first lesson
- **Quiz Master** - Get 100% on a quiz  
- **Curious Mind** - Ask Simba 10 questions
- **Streak Starter** - Learn for 3 days in a row
- **Science Explorer** - Complete 5 different lessons
- **Speed Learner** - Complete a lesson in under 5 minutes
- **Perfectionist** - Get 100% on 5 quizzes
- **Chat Champion** - Have 50 conversations with Simba
- **Knowledge Seeker** - Complete all available topics
- **Daily Hero** - Achieve your daily goal 7 days in a row

### 🔬 10 Science Topics
1. **Water Cycle & Weather** (Easy) - 8 minutes
2. **Animals & Habitats** (Easy) - 10 minutes  
3. **Solar System & Space** (Medium) - 15 minutes
4. **Plants & Photosynthesis** (Medium) - 12 minutes
5. **Forces & Motion** (Medium) - 10 minutes
6. **Matter & Materials** (Medium) - 14 minutes
7. **Earth's Surface** (Medium) - 12 minutes
8. **Light & Sound** (Medium) - 11 minutes
9. **Human Body Systems** (Hard) - 18 minutes
10. **Ecosystems & Environment** (Hard) - 16 minutes

## ✅ Test Your Setup

After running the seed data, test your API:

```bash
node test-api.js
```

You should now see:
```
✅ Found 10 topics
✅ Found 10 achievements
```

## 🔧 Troubleshooting

### If you get errors:
1. **"relation does not exist"** - Run the main schema first (`supabase_schema.sql`)
2. **"duplicate key value"** - The data already exists (this is normal)
3. **"permission denied"** - Check your Supabase project permissions

### Safe to re-run:
The script includes `ON CONFLICT ... DO NOTHING` clauses, so it's safe to run multiple times without creating duplicates.

## 🚀 Next Steps

Once seed data is loaded:
1. Run `node test-api.js` to verify
2. Start implementing authentication in your UI
3. Connect Redux slices to database APIs
4. Begin user registration flow

Your database is ready for a full SciFly experience! 🎉 