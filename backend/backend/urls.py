
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views import UserCreateView, UserDetailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/register/', UserCreateView.as_view(), name='user_register'),
    path('api/user/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path("api/user/me/", UserDetailView.as_view(), name="user_me"),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include('api.urls')),
]
