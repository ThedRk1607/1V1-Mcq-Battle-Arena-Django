# urls.py
from django.contrib import admin
from django.urls import path
from mcqs.views import test_pusher, MCQListCreateView, JoinGameView, ListGamesView, CreateGameView, MCQRetrieveUpdateDestroyView, GameDetailView
from auth_app.views import LoginView, ProtectedView, RegisterView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("register/", RegisterView.as_view(), name="register"),
    path('login/', LoginView.as_view(), name='login'),
    path("protected/", ProtectedView.as_view(), name="protected"),
    path("mcqs/", MCQListCreateView.as_view(), name="mcq-list-create"),
    path("mcqs/<uuid:pk>/", MCQRetrieveUpdateDestroyView.as_view(), name="mcq-detail"),
    path('create-game/', CreateGameView.as_view(), name='create-game'),
    path('join-game/<int:game_id>/', JoinGameView.as_view(), name='join-game'),
    path('test-pusher/', test_pusher, name='test_pusher'),
    path('list-games/', ListGamesView.as_view(), name='list-games'),
    path('games/<int:game_id>/', GameDetailView.as_view(), name='game-detail'),  # Add this line
]
