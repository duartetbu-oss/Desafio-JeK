from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Poll, Option, Vote
from .serializers import PollSerializer

@api_view(["GET", "POST"])
def list_polls(request):

    if request.method == "GET":
        polls = Poll.objects.all().order_by("-created_at")

        serializer = PollSerializer(polls, many=True)

        return Response(serializer.data)

    elif request.method == "POST":
        question = request.data.get("question")
        options = request.data.get("options")

        if not question or not question.strip():
            return Response(
                {"error": "A pergunta é obrigatória."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(options, list) or not 2 <= len(options) <= 5:
            return Response(
                {"error": "A votação deve ter entre 2 e 5 opções."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if any(not isinstance(opcao, str) or not opcao.strip()
               for opcao in options):
            return Response(
                {"error": "Todas as opções devem ter texto."},
                status=status.HTTP_400_BAD_REQUEST
            )

        poll = Poll.objects.create(
            question=question.strip()
        )

        for opcao in options:
            Option.objects.create(
                poll=poll,
                text=opcao.strip()
            )

        serializer = PollSerializer(poll)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

@api_view(["PATCH"])
def update_poll_status(request, poll_id):
    try:
        poll = Poll.objects.get(id=poll_id)
    except Poll.DoesNotExist:
        return Response(
            {"error": "Votação não encontrada."},
            status=status.HTTP_404_NOT_FOUND
        )

    novo_estado = request.data.get("status")

    estados_validos = ["draft", "open", "closed"]

    if novo_estado not in estados_validos:
        return Response(
            {"error": "Estado inválido."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if poll.status == "closed":
        return Response(
            {"error": "Uma votação fechada não pode ser reaberta."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if poll.status == "draft" and novo_estado == "closed":
        return Response(
            {"error": "Abre a votação antes de a fechar."},
            status=status.HTTP_400_BAD_REQUEST
        )

    poll.status = novo_estado
    poll.save()

    serializer = PollSerializer(poll)

    return Response(serializer.data)

@api_view(["POST"])
def submit_vote(request, poll_id):
    option_id = request.data.get("option_id")

    try:
        poll = Poll.objects.get(id=poll_id)
    except Poll.DoesNotExist:
        return Response(
            {"error": "Votação não encontrada."},
            status=status.HTTP_404_NOT_FOUND
        )

    if poll.status != "open":
        return Response(
            {"error": "Esta votação não está aberta."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        option = Option.objects.get(
            id=option_id,
            poll=poll
        )
    except (Option.DoesNotExist, ValueError, TypeError):
        return Response(
            {"error": "Opção inválida."},
            status=status.HTTP_400_BAD_REQUEST
        )

    Vote.objects.create(option=option)

    return Response(
        {"message": "O teu voto foi registado com sucesso!"},
        status=status.HTTP_201_CREATED
    )

@api_view(["GET"])
def poll_results(request, poll_id):
    try:
        poll = Poll.objects.get(id=poll_id)
    except Poll.DoesNotExist:
        return Response(
            {"error": "Votação não encontrada."},
            status=status.HTTP_404_NOT_FOUND
        )

    resultados = []

    for opcao in poll.options.all():
        resultados.append({
            "option_id": opcao.id,
            "text": opcao.text,
            "votes": opcao.votes.count()
        })

    total_votos = sum(
        resultado["votes"]
        for resultado in resultados
    )

    return Response({
        "poll_id": poll.id,
        "question": poll.question,
        "status": poll.status,
        "total_votes": total_votos,
        "results": resultados
    })