# Database Migration Troubleshooting Guide

## 🚨 **Common Migration Issues & Solutions**

### **Issue 1: "column does not exist" Error**

**Error**: `ERROR: 42703: column "session_id" does not exist`

**Cause**: The error occurs when trying to create an index on a column that doesn't exist, usually due to:
- Table creation failed earlier
- Column definition syntax error
- Foreign key constraint issues

**Solutions**:

#### **Option 1: Use the Minimal Migration (Recommended)**
```sql
-- Run this first (migrations/001_minimal_migration.sql)
-- It creates only essential tables without complex dependencies
```

#### **Option 2: Use the Safe Step-by-Step Migration**
```sql
-- Run this if you want full functionality (migrations/001_add_generative_ui_support_safe.sql)
-- It checks for existing tables/columns before creating anything
```

### **Issue 2: Foreign Key Constraint Errors**

**Error**: `ERROR: relation "table_name" does not exist`

**Cause**: Trying to create foreign key constraints to tables that don't exist yet.

**Solution**: The safe migration handles this by checking if tables exist before adding constraints.

### **Issue 3: Unique Constraint Violations**

**Error**: `ERROR: could not create unique index`

**Cause**: Trying to add unique constraints on columns that already have duplicate data.

**Solution**: 
```sql
-- Clean up any duplicate data first
DELETE FROM table_name WHERE id NOT IN (
    SELECT MIN(id) FROM table_name GROUP BY unique_column
);
```

## 🛠️ **Step-by-Step Migration Process**

### **Step 1: Choose Your Migration Strategy**

**For Production/Existing Database**: Use `001_minimal_migration.sql`
- ✅ Safe and minimal
- ✅ No foreign key dependencies
- ✅ Essential functionality only

**For Development/New Database**: Use `001_add_generative_ui_support_safe.sql`
- ✅ Full functionality
- ✅ Complete analytics tables
- ✅ All constraints and indexes

### **Step 2: Run the Migration**

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the chosen migration script**
4. **Run the script**

### **Step 3: Verify the Migration**

After running the migration, verify it worked:

```sql
-- Check if new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'content_adaptations',
    'user_content_interactions', 
    'ui_configurations',
    'user_speed_performance'
);

-- Check if new columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'lessons' 
AND column_name IN ('base_content', 'content_metadata', 'adaptive_variants');

-- Check if UI configurations were inserted
SELECT user_speed, lesson_type FROM ui_configurations;
```

### **Step 4: Test the API**

After migration, test that the adaptive API works:

```javascript
// Test in browser console or API client
const response = await fetch('/api/lessons/some-lesson-id?userId=user-id&speed=3');
console.log(await response.json());
```

## 🔍 **Debugging Commands**

### **Check Current Database Schema**
```sql
-- List all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'your_table_name';

-- Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'your_table_name';

-- Check constraints
SELECT constraint_name, constraint_type FROM information_schema.table_constraints 
WHERE table_name = 'your_table_name';
```

### **Check for Errors**
```sql
-- Check for recent errors in logs
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check if tables exist
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'content_adaptations'
);
```

## 🚀 **Quick Recovery Steps**

If migration fails completely:

### **Option 1: Clean Reset**
```sql
-- Drop the problematic tables (if they exist)
DROP TABLE IF EXISTS user_content_interactions CASCADE;
DROP TABLE IF EXISTS content_adaptations CASCADE;
DROP TABLE IF EXISTS ui_configurations CASCADE;
DROP TABLE IF EXISTS user_speed_performance CASCADE;

-- Remove added columns
ALTER TABLE lessons DROP COLUMN IF EXISTS base_content;
ALTER TABLE lessons DROP COLUMN IF EXISTS content_metadata;
ALTER TABLE lessons DROP COLUMN IF EXISTS adaptive_variants;
ALTER TABLE users DROP COLUMN IF EXISTS speed_adaptation_data;
```

### **Option 2: Manual Table Creation**
```sql
-- Create just the essential table for testing
CREATE TABLE content_adaptations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL,
    user_speed INTEGER NOT NULL CHECK (user_speed BETWEEN 1 AND 5),
    adapted_content JSONB NOT NULL,
    adaptation_type TEXT NOT NULL DEFAULT 'auto',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## 📋 **Migration Status Checklist**

**After successful migration, you should have:**

- [ ] ✅ `content_adaptations` table created
- [ ] ✅ `user_content_interactions` table created  
- [ ] ✅ `ui_configurations` table created
- [ ] ✅ `user_speed_performance` table created
- [ ] ✅ New columns added to `lessons` table
- [ ] ✅ New columns added to `users` table
- [ ] ✅ 5 default UI configurations inserted
- [ ] ✅ Basic indexes created
- [ ] ✅ No foreign key constraint errors

## 🆘 **Emergency Contact**

If you're still having issues:

1. **Check Supabase logs** for detailed error messages
2. **Try the minimal migration first** - it's safer
3. **Run migrations in parts** - don't try to do everything at once
4. **Test each table creation individually** if needed

## 📚 **Additional Resources**

- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [SQL Troubleshooting](https://www.postgresql.org/docs/current/sql-syntax.html)

**Remember**: The minimal migration is your safest bet for getting started! 🎯 