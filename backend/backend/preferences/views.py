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