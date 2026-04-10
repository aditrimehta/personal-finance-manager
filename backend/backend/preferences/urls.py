from django.urls import path
from . import views

urlpatterns = [
    path('onboarding/', views.onboarding_view),

    path("category-limit/", views.category_limit,  name="category-limit"),
]