from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/',          views.dashboard_data),
    path('add/',                views.add_transaction),
    path('list/',               views.get_transactions),
    path('delete/<int:tx_id>/', views.delete_transaction),
]