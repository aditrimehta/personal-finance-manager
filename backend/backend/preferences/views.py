from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def onboarding_view(request):
    user_id        = request.user.id
    data           = request.data

    income_type    = data.get('incomeType')
    income         = data.get('income')
    spending_limit = data.get('spendingLimit')
    saving_target  = data.get('savingTarget')
    target_date    = data.get('targetDate') or None
    categories     = data.get('categories', [])

    monthly_income = income if income_type == 'Monthly' else None
    annual_income  = income if income_type == 'Annual'  else None

    with connection.cursor() as cursor:

        # 1. Save income + spending preferences
        cursor.execute("""
            INSERT INTO preferences_userpreferences
                (CustID_id, MonthlyIncome, AnnualIncome, OverallSavingGoal, OverallSpendingLimit)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (CustID_id) DO UPDATE SET
                MonthlyIncome        = EXCLUDED.MonthlyIncome,
                AnnualIncome         = EXCLUDED.AnnualIncome,
                OverallSavingGoal    = EXCLUDED.OverallSavingGoal,
                OverallSpendingLimit = EXCLUDED.OverallSpendingLimit
        """, [user_id, monthly_income, annual_income, saving_target, spending_limit])

        # 2. Save savings goal
        cursor.execute("""
            INSERT INTO savings_savingstracking
                (CustID_id, GoalAmount, CurrentSaved, TargetDate)
            VALUES (%s, %s, 0, %s)
        """, [user_id, saving_target, target_date])

        # 3. Insert categories and link to user
        for cat_name in categories:

            # Insert category if it doesn't already exist
            cursor.execute("""
                INSERT INTO categories_category (CategoryName)
                VALUES (%s)
                ON CONFLICT (CategoryName) DO NOTHING
            """, [cat_name])

            # Get the category ID
            cursor.execute("""
                SELECT CategoryID FROM categories_category WHERE CategoryName = %s
            """, [cat_name])
            cat_id = cursor.fetchone()[0]

            # Link category to this user
            cursor.execute("""
                INSERT INTO categories_usercategory (CustID_id, CategoryID_id)
                VALUES (%s, %s)
                ON CONFLICT (CustID_id, CategoryID_id) DO NOTHING
            """, [user_id, cat_id])

    return Response({'message': 'Onboarding complete.'}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def onboarding(request):
    user = request.user
    data = request.data
 
    income_type    = data.get("incomeType", "Monthly")
    income         = data.get("income", 0)
    spending_limit = data.get("spendingLimit", 0)
    saving_target  = data.get("savingTarget", 0)
    categories     = data.get("categories", [])  # list of category name strings
 
    monthly_income = income if income_type == "Monthly" else None
    annual_income  = income if income_type == "Annual"  else None
 
    with connection.cursor() as cursor:
        # Upsert user preferences
        cursor.execute("""
            INSERT INTO preferences_userpreferences
                (CustID_id, MonthlyIncome, AnnualIncome, OverallSavingGoal, OverallSpendingLimit)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (CustID_id) DO UPDATE SET
                MonthlyIncome       = EXCLUDED.MonthlyIncome,
                AnnualIncome        = EXCLUDED.AnnualIncome,
                OverallSavingGoal   = EXCLUDED.OverallSavingGoal,
                OverallSpendingLimit= EXCLUDED.OverallSpendingLimit
        """, [user.id, monthly_income, annual_income, saving_target, spending_limit])
 
        # Upsert savings tracking
        cursor.execute("""
            INSERT INTO savings_savingstracking (CustID_id, GoalAmount, CurrentSaved)
            VALUES (%s, %s, 0)
            ON CONFLICT DO NOTHING
        """, [user.id, saving_target])
 
        # Insert categories and link to user
        for cat_name in categories:
            cursor.execute("""
                INSERT INTO categories_category (CategoryName)
                VALUES (%s)
                ON CONFLICT (CategoryName) DO NOTHING
            """, [cat_name])
 
            cursor.execute("""
                SELECT CategoryID FROM categories_category WHERE CategoryName = %s
            """, [cat_name])
            row = cursor.fetchone()
            if row:
                cursor.execute("""
                    INSERT INTO categories_usercategory (CustID_id, CategoryID_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, [user.id, row[0]])
 
    return Response({"message": "Onboarding complete"}, status=status.HTTP_201_CREATED)
 
 
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def category_limit(request):
    """
    GET  → returns { limits: { "Food & Dining": 5000, ... } }
    POST → body { category: "Food & Dining", limit: 5000 }
           upserts the limit, returns updated limits dict
    """
    user = request.user
 
    if request.method == "GET":
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT c.CategoryName, cl.MonthlyLimit
                FROM preferences_categorylimit cl
                JOIN categories_category c ON c.CategoryID = cl.CategoryID_id
                WHERE cl.CustID_id = %s
            """, [user.id])
            rows = cursor.fetchall()
        limits = {row[0]: float(row[1]) for row in rows}
        return Response({"limits": limits})
 
    # POST — upsert a single category limit
    category_name = request.data.get("category")
    limit_amount  = request.data.get("limit")
 
    if not category_name or limit_amount is None:
        return Response({"error": "category and limit are required"}, status=status.HTTP_400_BAD_REQUEST)
 
    try:
        limit_amount = float(limit_amount)
        if limit_amount <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return Response({"error": "limit must be a positive number"}, status=status.HTTP_400_BAD_REQUEST)
 
    with connection.cursor() as cursor:
        # Ensure category exists and user is linked to it
        cursor.execute("""
            SELECT CategoryID FROM categories_category WHERE CategoryName = %s
        """, [category_name])
        row = cursor.fetchone()
 
        if not row:
            return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
 
        cat_id = row[0]
 
        # Upsert the limit
        cursor.execute("""
            INSERT INTO preferences_categorylimit (CustID_id, CategoryID_id, MonthlyLimit)
            VALUES (%s, %s, %s)
            ON CONFLICT (CustID_id, CategoryID_id) DO UPDATE SET MonthlyLimit = EXCLUDED.MonthlyLimit
        """, [user.id, cat_id, limit_amount])
 
        # Return all limits for this user
        cursor.execute("""
            SELECT c.CategoryName, cl.MonthlyLimit
            FROM preferences_categorylimit cl
            JOIN categories_category c ON c.CategoryID = cl.CategoryID_id
            WHERE cl.CustID_id = %s
        """, [user.id])
        rows = cursor.fetchall()
 
    limits = {r[0]: float(r[1]) for r in rows}
    return Response({"limits": limits}, status=status.HTTP_200_OK)