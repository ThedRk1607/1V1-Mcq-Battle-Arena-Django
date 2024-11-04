from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import MCQ, Game, Answer
from .serializers import MCQSerializer, GameSerializer, AnswerSerializer
import pusher
from django.conf import settings
import logging

logger = logging.getLogger(__name__)



# Pusher client setup
pusher_client = pusher.Pusher(
    app_id=settings.PUSHER_APP_ID,
    key=settings.PUSHER_KEY,
    secret=settings.PUSHER_SECRET,
    cluster=settings.PUSHER_CLUSTER,
    ssl=True
)

# Test Pusher endpoint
@api_view(['POST'])
def test_pusher(request):
    pusher_client.trigger('game-channel', 'game-start', {'message': 'Game has started!'})
    return Response({'status': 'Game started'})

# List games endpoint
@api_view(['GET'])
def list_games(request):
    games = Game.objects.filter(status='waiting')
    return Response(GameSerializer(games, many=True).data)

# Join game endpoint
@api_view(['POST'])
def join_game(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        if game.status != 'waiting':
            return Response({'error': 'Game is not available for joining'}, status=status.HTTP_400_BAD_REQUEST)
        game.participants.add(request.user)
        if game.participants.count() == 2:
            game.status = 'active'
            game.save()
        return Response({'status': 'joined'}, status=status.HTTP_200_OK)
    except Game.DoesNotExist:
        return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)


# User login endpoint
@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Submit answers endpoint
@api_view(['POST'])
def submit_answers(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        user = request.user
        answers = request.data.get('answers')
        score = 0
        incorrect_answers = 0

        for answer in answers:
            mcq = MCQ.objects.get(id=answer['mcq_id'])
            if mcq.correct_option == answer['selected_option']:
                score += 1
            else:
                incorrect_answers += 1

            # Save the answer
            Answer.objects.create(
                user=user,
                mcq=mcq,
                selected_option=answer['selected_option'],
                is_correct=(mcq.correct_option == answer['selected_option'])
            )

        # Update the user's score in the game
        game.participants_scores[user] = score
        game.save()

        # Check if the game should end
        if incorrect_answers >= 3:
            game.status = 'completed'
            game.save()

        return Response({'score': score, 'incorrect_answers': incorrect_answers}, status=status.HTTP_200_OK)
    except Game.DoesNotExist:
        return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)

# Get game results endpoint
@api_view(['GET'])
def get_results(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        results = {
            'game_id': game.id,
            'participants_scores': game.participants_scores,
            'winner': max(game.participants_scores, key=game.participants_scores.get)
        }
        return Response(results, status=status.HTTP_200_OK)
    except Game.DoesNotExist:
        return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)

# MCQ List and Create view
class MCQListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        mcqs = MCQ.objects.all()
        serializer = MCQSerializer(mcqs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MCQSerializer(data=request.data)
        if serializer.is_valid():
            mcq = MCQ.objects.create(
                body=serializer.validated_data['body'],
                explanation=serializer.validated_data['explanation'],
                options=serializer.validated_data['options']
            )
            mcq.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Create Game view
class CreateGameView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        game = Game.objects.create(owner=request.user)
        game.participants.add(request.user)
        game.save()
        pusher_client.trigger('game-channel', 'game-created', {'game': GameSerializer(game).data})
        return Response(GameSerializer(game).data, status=status.HTTP_201_CREATED)

# MCQ Retrieve, Update, and Destroy view
class MCQRetrieveUpdateDestroyView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return MCQ.objects.get(pk=pk)
        except MCQ.DoesNotExist:
            return None

    def get(self, request, pk):
        mcq = self.get_object(pk)
        if mcq is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = MCQSerializer(mcq)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        mcq = self.get_object(pk)
        if mcq is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = MCQSerializer(mcq, data=request.data)
        if serializer.is_valid():
            mcq.body = serializer.validated_data['body']
            mcq.explanation = serializer.validated_data['explanation']
            mcq.options = serializer.validated_data['options']
            mcq.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        mcq = self.get_object(pk)
        if mcq is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        mcq.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# List Games view
class ListGamesView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GameSerializer

    def get_queryset(self):
        return Game.objects.filter(status='waiting')

# views.py


class JoinGameView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, game_id):
        try:
            game = Game.objects.get(game_id=game_id)
            if game.status == 'waiting':
                game.participants.add(request.user)
                if game.participants.count() == 2:
                    game.status = 'active'
                game.save()
                return Response(GameSerializer(game).data, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Game is not available'}, status=status.HTTP_400_BAD_REQUEST)
        except Game.DoesNotExist:
            return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)


# Game Detail view
class GameDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, game_id):
        try:
            game = Game.objects.get(game_id=game_id)
            serializer = GameSerializer(game)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Game.DoesNotExist:
            return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)
