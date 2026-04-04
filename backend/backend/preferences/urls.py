from django.urls import path
from . import views

urlpatterns = [
    path('onboarding/', views.onboarding_view),
]