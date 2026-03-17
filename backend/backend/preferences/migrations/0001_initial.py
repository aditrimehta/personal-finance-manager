from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('categories', '0001_initial'),  # CategoryLimits needs categories to exist first
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- One row per user: stores their income and overall saving/spending goals
            -- CustID_id is UNIQUE so each user can only have one preferences row
            -- REFERENCES users_user(id): Django names the custom user table as users_user
            --   (app name = users, model name = user)
            -- ON DELETE CASCADE: if a user is deleted, their preferences are deleted too
            CREATE TABLE IF NOT EXISTS preferences_userpreferences (
                id                   SERIAL PRIMARY KEY,
                CustID_id            INTEGER NOT NULL UNIQUE 
                                       REFERENCES users_user(id) 
                                       ON DELETE CASCADE,
                MonthlyIncome        NUMERIC(12, 2),
                AnnualIncome         NUMERIC(12, 2),
                OverallSavingGoal    NUMERIC(12, 2),
                OverallSpendingLimit NUMERIC(12, 2)
            );

            -- Stores the monthly spend limit per category per user
            -- This is the CategoryLimits table from your doc
            -- LimitID is the PK (auto-increment)
            -- CustID_id → FK to users_user(id)
            -- CategoryID_id → FK to categories_category(CategoryID)
            -- UNIQUE(CustID_id, CategoryID_id): one limit per category per user
            -- ON DELETE CASCADE on both FKs: if user or category is deleted, limit row is removed
            CREATE TABLE IF NOT EXISTS preferences_categorylimit (
                LimitID       SERIAL PRIMARY KEY,
                CustID_id     INTEGER NOT NULL 
                                REFERENCES users_user(id) 
                                ON DELETE CASCADE,
                CategoryID_id INTEGER NOT NULL 
                                REFERENCES categories_category(CategoryID) 
                                ON DELETE CASCADE,
                MonthlyLimit  NUMERIC(12, 2) NOT NULL,
                UNIQUE(CustID_id, CategoryID_id)
            );
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS preferences_categorylimit;
            DROP TABLE IF EXISTS preferences_userpreferences;
            """
        )
    ]