from django.contrib import admin
from .models import Poll, Option, Vote

@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("question",)

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ("id", "text", "poll")
    list_filter = ("poll",)
    search_fields = ("text",)

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ("id", "option", "created_at")
    list_filter = ("created_at",)