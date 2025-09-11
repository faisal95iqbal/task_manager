from django.urls import path
from .views import TaskListView, TaskDeleteView, TaskDetailView, CategoryListCreateView, CategoryDetailView, CompletedTaskListView, UncompletedTaskListView

urlpatterns = [
    #tasks related urls
    path('tasks/', TaskListView.as_view(), name='task_list_create'),
    #path('tasks/<int:pk>/', TaskDeleteView.as_view(), name='task_delete'),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task_detail"),
    path("tasks/completed/", CompletedTaskListView.as_view(), name="completed_tasks"),
    path("tasks/uncompleted/", UncompletedTaskListView.as_view(), name="uncompleted_tasks"),

    # Categories related urls
    path("categories/", CategoryListCreateView.as_view(), name="categories"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category_detail"),
]