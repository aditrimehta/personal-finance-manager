from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Tracks a user's savings goal progress
            -- GoalAmount: what they want to save in total
            -- CurrentSaved: how much they've saved so far (starts at 0)
            -- TargetDate: optional deadline for the goal
            -- CustID_id → FK to users_user, CASCADE on delete
            CREATE TABLE IF NOT EXISTS savings_savingstracking (
                SavingID     SERIAL PRIMARY KEY,
                CustID_id    INTEGER NOT NULL 
                               REFERENCES users_user(id) 
                               ON DELETE CASCADE,
                GoalAmount   NUMERIC(12, 2) NOT NULL,
                CurrentSaved NUMERIC(12, 2) NOT NULL DEFAULT 0,
                TargetDate   DATE
            );

            -- One row per user per month: aggregated financial summary
            -- Month stored as DATE (use first day of month e.g. 2025-03-01)
            -- TotalIncome / TotalSpent / TotalSaved: computed and stored here
            -- UNIQUE(CustID_id, Month): only one summary per user per month
            -- ON DELETE CASCADE: summary removed if user is deleted
            CREATE TABLE IF NOT EXISTS savings_monthlysummary (
                SummaryID   SERIAL PRIMARY KEY,
                CustID_id   INTEGER NOT NULL 
                              REFERENCES users_user(id) 
                              ON DELETE CASCADE,
                Month       DATE NOT NULL,
                TotalIncome NUMERIC(12, 2) DEFAULT 0,
                TotalSpent  NUMERIC(12, 2) DEFAULT 0,
                TotalSaved  NUMERIC(12, 2) DEFAULT 0,
                UNIQUE(CustID_id, Month)
            );
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS savings_monthlysummary;
            DROP TABLE IF EXISTS savings_savingstracking;
            """
        )
    ]