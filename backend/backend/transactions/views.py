from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    user_id = request.user.id

    with connection.cursor() as cursor:

        # 1. User preferences (income + spending limit)
        cursor.execute("""
            SELECT MonthlyIncome, AnnualIncome, OverallSpendingLimit
            FROM preferences_userpreferences
            WHERE CustID_id = %s
        """, [user_id])
        prefs = cursor.fetchone()
        monthly_income    = float(prefs[0] or 0) if prefs else 0
        annual_income     = float(prefs[1] or 0) if prefs else 0
        spending_limit    = float(prefs[2] or 0) if prefs else 0

        # 2. Savings goal
        cursor.execute("""
            SELECT GoalAmount, CurrentSaved, TargetDate
            FROM savings_savingstracking
            WHERE CustID_id = %s
            ORDER BY SavingID DESC
            LIMIT 1
        """, [user_id])
        savings = cursor.fetchone()
        goal_amount   = float(savings[0] or 0) if savings else 0
        current_saved = float(savings[1] or 0) if savings else 0

        # 3. Total spent this month
        cursor.execute("""
            SELECT COALESCE(SUM(Amount), 0)
            FROM transactions_transaction
            WHERE CustID_id = %s
              AND TransactionType = 'Debit'
              AND DATE_TRUNC('month', Date) = DATE_TRUNC('month', CURRENT_DATE)
        """, [user_id])
        total_spent = float(cursor.fetchone()[0])

        # 4. Spending per category this month
        cursor.execute("""
            SELECT c.CategoryName, COALESCE(SUM(t.Amount), 0) as spent
            FROM categories_usercategory uc
            JOIN categories_category c ON uc.CategoryID_id = c.CategoryID
            LEFT JOIN transactions_transaction t
                ON t.CategoryID_id = c.CategoryID
                AND t.CustID_id = %s
                AND t.TransactionType = 'Debit'
                AND DATE_TRUNC('month', t.Date) = DATE_TRUNC('month', CURRENT_DATE)
            WHERE uc.CustID_id = %s
            GROUP BY c.CategoryName
        """, [user_id, user_id])
        category_rows = cursor.fetchall()
        category_data = [
            {"name": row[0], "value": float(row[1])}
            for row in category_rows
        ]

        # 5. Category limits
        cursor.execute("""
            SELECT c.CategoryName, cl.MonthlyLimit
            FROM preferences_categorylimit cl
            JOIN categories_category c ON cl.CategoryID_id = c.CategoryID
            WHERE cl.CustID_id = %s
        """, [user_id])
        limits = {row[0]: float(row[1]) for row in cursor.fetchall()}

        # 6. Recent 5 transactions
        cursor.execute("""
            SELECT t.TransactionID, t.NameOfSpend, c.CategoryName,
                   t.TransactionType, t.Amount, t.Date
            FROM transactions_transaction t
            LEFT JOIN categories_category c ON t.CategoryID_id = c.CategoryID
            WHERE t.CustID_id = %s
            ORDER BY t.Date DESC, t.TransactionID DESC
            LIMIT 5
        """, [user_id])
        tx_rows = cursor.fetchall()
        recent_tx = [
            {
                "id":     row[0],
                "name":   row[1],
                "cat":    row[2] or "Uncategorized",
                "type":   row[3].lower(),
                "amount": float(row[4]),
                "date":   row[5].strftime("%b %d"),
            }
            for row in tx_rows
        ]

        # 7. Monthly income vs expenses for last 8 months
        cursor.execute("""
            SELECT
                TO_CHAR(DATE_TRUNC('month', Date), 'Mon') as month,
                COALESCE(SUM(CASE WHEN TransactionType='Credit' THEN Amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN TransactionType='Debit'  THEN Amount ELSE 0 END), 0) as expenses
            FROM transactions_transaction
            WHERE CustID_id = %s
              AND Date >= CURRENT_DATE - INTERVAL '8 months'
            GROUP BY DATE_TRUNC('month', Date)
            ORDER BY DATE_TRUNC('month', Date)
        """, [user_id])
        monthly_rows = cursor.fetchall()
        monthly_data = [
            {"month": row[0], "income": float(row[1]), "expenses": float(row[2])}
            for row in monthly_rows
        ]

        # 8. This week's daily spending
        cursor.execute("""
            SELECT
                TO_CHAR(Date, 'Dy') as day,
                COALESCE(SUM(Amount), 0) as amount
            FROM transactions_transaction
            WHERE CustID_id = %s
              AND TransactionType = 'Debit'
              AND Date >= DATE_TRUNC('week', CURRENT_DATE)
            GROUP BY Date, TO_CHAR(Date, 'Dy')
            ORDER BY Date
        """, [user_id])
        weekly_rows = cursor.fetchall()
        weekly_data = [
            {"day": row[0], "amount": float(row[1])}
            for row in weekly_rows
        ]

    total_saved  = monthly_income - total_spent
    savings_rate = round((total_saved / monthly_income) * 100) if monthly_income else 0

    return Response({
        "monthlyIncome":  monthly_income,
        "totalSpent":     total_spent,
        "totalSaved":     total_saved,
        "savingsRate":    savings_rate,
        "goalAmount":     goal_amount,
        "currentSaved":   current_saved,
        "spendingLimit":  spending_limit,
        "categoryData":   category_data,
        "categoryLimits": limits,
        "recentTx":       recent_tx,
        "monthlyData":    monthly_data,
        "weeklyData":     weekly_data,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_transaction(request):
    user_id  = request.user.id
    data     = request.data

    name      = data.get('name')
    tx_type   = data.get('type')        # 'Debit' or 'Credit'
    amount    = data.get('amount')
    date      = data.get('date')
    note      = data.get('note') or None
    cat_name  = data.get('category')    # category name string

    with connection.cursor() as cursor:

        # Get category ID from name
        cursor.execute("""
            SELECT CategoryID FROM categories_category
            WHERE CategoryName = %s
        """, [cat_name])
        row = cursor.fetchone()

        if row is None:
            return Response(
                {'error': f'Category "{cat_name}" not found.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cat_id = row[0]

        # Insert transaction
        cursor.execute("""
            INSERT INTO transactions_transaction
                (CustID_id, CategoryID_id, NameOfSpend, TransactionType, Amount, Date, Notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING TransactionID
        """, [user_id, cat_id, name, tx_type, amount, date, note])

        tx_id = cursor.fetchone()[0]

    return Response({'id': tx_id, 'message': 'Transaction added.'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    user_id = request.user.id

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                t.TransactionID,
                t.NameOfSpend,
                c.CategoryName,
                t.TransactionType,
                t.Amount,
                t.Date,
                t.Notes
            FROM transactions_transaction t
            LEFT JOIN categories_category c ON t.CategoryID_id = c.CategoryID
            WHERE t.CustID_id = %s
            ORDER BY t.Date DESC, t.TransactionID DESC
        """, [user_id])
        rows = cursor.fetchall()

    transactions = [
        {
            'id':     row[0],
            'name':   row[1],
            'cat':    row[2] or 'Uncategorized',
            'type':   row[3].lower(),
            'amount': float(row[4]),
            'date':   row[5].strftime('%b %d, %Y'),
            'note':   row[6] or '',
        }
        for row in rows
    ]

    return Response({'transactions': transactions})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_transaction(request, tx_id):
    user_id = request.user.id

    with connection.cursor() as cursor:
        # Make sure the transaction belongs to this user before deleting
        cursor.execute("""
            DELETE FROM transactions_transaction
            WHERE TransactionID = %s AND CustID_id = %s
        """, [tx_id, user_id])

        if cursor.rowcount == 0:
            return Response(
                {'error': 'Transaction not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    return Response({'message': 'Deleted.'})