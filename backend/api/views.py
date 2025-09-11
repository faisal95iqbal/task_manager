from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from rest_framework import generics, filters
from .serializers import UserSerializer, TaskSerializer, CategorySerializer,UserRegisterSerializer
from .models import Task, Category
from rest_framework.permissions import IsAuthenticated, AllowAny

#user related views
class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]  # Allow any user to create an account


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def get_object(self):
        return self.request.user

# Task related views
class TaskListView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["completed", "category"]     # e.g., ?completed=true&category=1
    search_fields = ["title", "description"]         # e.g., ?search=project
    ordering_fields = ["created_at", "title"]        # e.g., ?ordering=-created_at
    ordering = ["-created_at"]                       # ✅ Default ordering: newest first

    def get_queryset(self):
        task = Task.objects.filter(user=self.request.user)
        return task
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            raise serializer.ValidationError(serializer.errors)

class TaskDeleteView(generics.DestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can delete tasks

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(user=user)
    
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)  


# ✅ Completed tasks
class CompletedTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user, completed=True).order_by("-created_at")

# ✅ Uncompleted tasks
class UncompletedTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user, completed=False).order_by("-created_at")
    

# Categories related views
class CategoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]             # e.g., ?search=work
    ordering_fields = ["name", "id"]     # e.g., ?ordering=name
    ordering = ["name"]                  # Default ordering by name

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer