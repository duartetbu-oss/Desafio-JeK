from django.db import models

class Poll(models.Model):
    STATUS_CHOICES = [
    ("draft", "Rascunho"),
    ("open", "Aberta"),
    ("closed", "Fechada"),
    ]

    question = models.CharField(max_length = 255)

    status = models.CharField(
        max_length = 10,
        choices = STATUS_CHOICES,
        default = "draft"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question

class Option(models.Model):

    poll = models.ForeignKey(
        Poll,
        on_delete=models.CASCADE,
        related_name="options"
    )

    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text

class Vote(models.Model):

    option = models.ForeignKey(
        Option,
        on_delete=models.CASCADE,
        related_name="votes"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Voto na opção: {self.option.text}"