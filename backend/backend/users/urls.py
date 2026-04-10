from django.urls import path
from . import views

urlpatterns = [
    path('login/',  views.login_view),
    path('signup/', views.signup_view),

    path('profile/',        views.profile_view),    # ← GET
    path('profile/update/', views.profile_update),  # ← PUT

    path('categories/',         views.get_user_categories),   # ← GET
    path('categories/add/',     views.add_user_category),     # ← POST
]