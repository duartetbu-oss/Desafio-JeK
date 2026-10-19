from django.urls import path
from . import views

urlpatterns = [
    path("polls/", views.list_polls, name="list-polls"),
    path("polls/<int:poll_id>/status/", views.update_poll_status, name="update_poll_status"),
    path("polls/<int:poll_id>/vote/", views.submit_vote, name="submit-vote"),
    path("polls/<int:poll_id>/results/", views.poll_results, name="poll-results"),
]