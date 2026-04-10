from django.db import connection
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

def get_tokens_for_user(user_id):
    # simplejwt needs a user object — we make a minimal one just for token generation
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = User()
    user.id = user_id
    user.pk = user_id
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


@api_view(['POST'])
def login_view(request):
    email    = request.data.get('email')
    password = request.data.get('password')

    with connection.cursor() as cursor:
        # Check if user exists by email
        cursor.execute("""
            SELECT id, first_name,last_name, email, password
            FROM users_user
            WHERE email = %s
        """, [email])
        row = cursor.fetchone()

    if row is None:
        return Response(
            {'error': 'No account found with this email.'},
            status=status.HTTP_404_NOT_FOUND
        )

    user_id, fname, lname, user_email, hashed_pw = row

    # check_password compares plain password against the stored hash
    if not check_password(password, hashed_pw):
        return Response(
            {'error': 'Incorrect password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response({
        'tokens': get_tokens_for_user(user_id),
        'user': { 'id': user_id, 'fname': fname, 'lname': lname, 'email': user_email }  # ← update here
    })


@api_view(['POST'])
def signup_view(request):
    fname     = request.data.get('fname')
    lname     = request.data.get('lname')
    email    = request.data.get('email')
    dob      = request.data.get('dob')
    password = request.data.get('password')

    with connection.cursor() as cursor:
        # Check if email is already taken
        cursor.execute("""
            SELECT id FROM users_user WHERE email = %s
        """, [email])
        existing = cursor.fetchone()

    if existing:
        return Response(
            {'error': 'An account with this email already exists.'},
            status=status.HTTP_409_CONFLICT
        )

    # make_password hashes the plain password before storing — never store plain text
    hashed_pw = make_password(password)

    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO users_user 
                (username, first_name,last_name, email, password, dob,
                 is_superuser, is_staff, is_active, date_joined)
            VALUES (%s, %s, %s, %s, %s,%s, false, false, true, NOW())
            RETURNING id
        """, [email, fname,lname, email, hashed_pw, dob])
        # RETURNING id gives us back the new user's id in one query
        new_user_id = cursor.fetchone()[0]

    return Response({
        'tokens': get_tokens_for_user(new_user_id),
        'user': { 'id': new_user_id, 'fname': fname,'lname':lname, 'email': email }
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user_id = request.user.id

    with connection.cursor() as cursor:

        # User basic info
        cursor.execute("""
            SELECT first_name, last_name, email, dob, date_joined
            FROM users_user
            WHERE id = %s
        """, [user_id])
        user_row = cursor.fetchone()
        fname, lname, email, dob, joined = user_row

        # Financial preferences
        cursor.execute("""
            SELECT MonthlyIncome, AnnualIncome, OverallSpendingLimit, OverallSavingGoal
            FROM preferences_userpreferences
            WHERE CustID_id = %s
        """, [user_id])
        prefs = cursor.fetchone()

        # Savings goal
        cursor.execute("""
            SELECT GoalAmount, CurrentSaved
            FROM savings_savingstracking
            WHERE CustID_id = %s
            ORDER BY SavingID DESC LIMIT 1
        """, [user_id])
        savings = cursor.fetchone()

        # User's categories
        cursor.execute("""
            SELECT c.CategoryName
            FROM categories_usercategory uc
            JOIN categories_category c ON uc.CategoryID_id = c.CategoryID
            WHERE uc.CustID_id = %s
        """, [user_id])
        categories = [row[0] for row in cursor.fetchall()]

        # Total spent this month (for progress bar)
        cursor.execute("""
            SELECT COALESCE(SUM(Amount), 0)
            FROM transactions_transaction
            WHERE CustID_id = %s
              AND TransactionType = 'Debit'
              AND DATE_TRUNC('month', Date) = DATE_TRUNC('month', CURRENT_DATE)
        """, [user_id])
        total_spent = float(cursor.fetchone()[0])

    return Response({
        "fname":         fname,
        "lname":         lname,
        "email":         email,
        "dob":           str(dob) if dob else "",
        "joinDate":      joined.strftime("%B %Y") if joined else "",
        "monthlyIncome": float(prefs[0] or 0) if prefs else 0,
        "annualIncome":  float(prefs[1] or 0) if prefs else 0,
        "spendingLimit": float(prefs[2] or 0) if prefs else 0,
        "savingTarget":  float(prefs[3] or 0) if prefs else 0,
        "goalAmount":    float(savings[0] or 0) if savings else 0,
        "savedSoFar":    float(savings[1] or 0) if savings else 0,
        "categories":    categories,
        "totalSpent":    total_spent,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def profile_update(request):
    user_id = request.user.id
    data    = request.data

    fname          = data.get('fname')
    lname          = data.get('lname')
    dob            = data.get('dob')
    income_type    = data.get('incomeType')
    income         = data.get('income')
    spending_limit = data.get('spendingLimit')
    saving_target  = data.get('savingTarget')

    monthly_income = income if income_type == 'Monthly' else None
    annual_income  = income if income_type == 'Annual'  else None

    with connection.cursor() as cursor:

        # Update user basic info
        cursor.execute("""
            UPDATE users_user
            SET first_name = %s, last_name = %s, dob = %s
            WHERE id = %s
        """, [fname, lname, dob, user_id])

        # Update preferences
        cursor.execute("""
            INSERT INTO preferences_userpreferences
                (CustID_id, MonthlyIncome, AnnualIncome, OverallSpendingLimit, OverallSavingGoal)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (CustID_id) DO UPDATE SET
                MonthlyIncome        = EXCLUDED.MonthlyIncome,
                AnnualIncome         = EXCLUDED.AnnualIncome,
                OverallSpendingLimit = EXCLUDED.OverallSpendingLimit,
                OverallSavingGoal    = EXCLUDED.OverallSavingGoal
        """, [user_id, monthly_income, annual_income, spending_limit, saving_target])

        # Update savings goal
        cursor.execute("""
            UPDATE savings_savingstracking
            SET GoalAmount = %s
            WHERE CustID_id = %s
        """, [saving_target, user_id])

    return Response({'message': 'Profile updated.'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_categories(request):
    user_id = request.user.id

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT c.CategoryID, c.CategoryName
            FROM categories_usercategory uc
            JOIN categories_category c ON uc.CategoryID_id = c.CategoryID
            WHERE uc.CustID_id = %s
            ORDER BY c.CategoryName
        """, [user_id])
        rows = cursor.fetchall()

    categories = [{'id': row[0], 'name': row[1]} for row in rows]
    return Response({'categories': categories})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_user_category(request):
    user_id  = request.user.id
    cat_name = request.data.get('name', '').strip()

    if not cat_name:
        return Response(
            {'error': 'Category name is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    with connection.cursor() as cursor:
        # Insert into master list if not exists
        cursor.execute("""
            INSERT INTO categories_category (CategoryName)
            VALUES (%s)
            ON CONFLICT (CategoryName) DO NOTHING
        """, [cat_name])

        # Get its ID
        cursor.execute("""
            SELECT CategoryID FROM categories_category WHERE CategoryName = %s
        """, [cat_name])
        cat_id = cursor.fetchone()[0]

        # Check if user already has this category
        cursor.execute("""
            SELECT 1 FROM categories_usercategory
            WHERE CustID_id = %s AND CategoryID_id = %s
        """, [user_id, cat_id])

        if cursor.fetchone():
            return Response(
                {'error': 'You already have this category.'},
                status=status.HTTP_409_CONFLICT
            )

        # Link to user
        cursor.execute("""
            INSERT INTO categories_usercategory (CustID_id, CategoryID_id)
            VALUES (%s, %s)
        """, [user_id, cat_id])

    # Invalidate profile cache since categories changed
    return Response(
        {'id': cat_id, 'name': cat_name},
        status=status.HTTP_201_CREATED
    )