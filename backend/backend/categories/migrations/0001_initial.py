from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        # Must run after users app migration since UserCategory references users_user
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Stores all possible spend categories (food, travel, rent, etc.)
            -- CategoryID is auto-incrementing PK, CategoryName must be unique
            CREATE TABLE IF NOT EXISTS categories_category (
                CategoryID   SERIAL PRIMARY KEY,
                CategoryName VARCHAR(100) NOT NULL UNIQUE
            );

            -- Junction table: which categories does each user have active?
            -- CustID_id → references the built-in Django user table (users_user)
            -- CategoryID_id → references the category above
            -- UNIQUE constraint prevents a user from adding the same category twice
            CREATE TABLE IF NOT EXISTS categories_usercategory (
                id            SERIAL PRIMARY KEY,
                CustID_id     INTEGER NOT NULL 
                                REFERENCES users_user(id) 
                                ON DELETE CASCADE,
                CategoryID_id INTEGER NOT NULL 
                                REFERENCES categories_category(CategoryID) 
                                ON DELETE CASCADE,
                UNIQUE(CustID_id, CategoryID_id)
            );
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS categories_usercategory;
            DROP TABLE IF EXISTS categories_category;
            """
        )
    ]