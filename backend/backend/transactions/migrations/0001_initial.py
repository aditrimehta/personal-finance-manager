from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('categories', '0001_initial'),  # transaction references category
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Every spend/income entry by the user lives here
            -- TransactionID: auto-increment PK
            -- CustID_id → FK to users_user(id), CASCADE so transactions are deleted with user
            -- CategoryID_id → FK to categories_category(CategoryID)
            --   ON DELETE SET NULL: if a category is deleted, transaction is kept but category becomes NULL
            --   This is safer than CASCADE — you don't lose financial history
            -- TransactionType: constrained to only 'Debit' or 'Credit' via CHECK
            -- Date defaults to today if not provided
            -- Notes is optional (nullable TEXT)
            CREATE TABLE IF NOT EXISTS transactions_transaction (
                TransactionID   SERIAL PRIMARY KEY,
                CustID_id       INTEGER NOT NULL 
                                  REFERENCES users_user(id) 
                                  ON DELETE CASCADE,
                CategoryID_id   INTEGER 
                                  REFERENCES categories_category(CategoryID) 
                                  ON DELETE SET NULL,
                NameOfSpend     VARCHAR(255) NOT NULL,
                TransactionType VARCHAR(10)  NOT NULL 
                                  CHECK (TransactionType IN ('Debit', 'Credit')),
                Amount          NUMERIC(12, 2) NOT NULL,
                Date            DATE NOT NULL DEFAULT CURRENT_DATE,
                Notes           TEXT
            );
            """,
            reverse_sql="DROP TABLE IF EXISTS transactions_transaction;"
        )
    ]