from django.db import connection
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


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