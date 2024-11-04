from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
    game_id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(User, related_name='owned_games', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[('waiting', 'Waiting'), ('active', 'Active'), ('completed', 'Completed')])
    participants = models.ManyToManyField(User, related_name='games')
    created_at = models.DateTimeField(auto_now_add=True)
