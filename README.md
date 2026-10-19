# Live Pulse

Aplicação web de votações: o anfitrião cria e gere votações, o público vota
e consulta os resultados depois de a votação fechar.

## Funcionalidades

- **Anfitrião:** criar votações (pergunta + 2 a 5 opções), alterar o estado
  (`draft` → `open` → `closed`) e ver os votos por opção.
- **Público:** ver votações abertas, votar e consultar resultados de votações
  encerradas.

## Stack

HTML, CSS e JavaScript (fetch) no frontend; Django + Django REST Framework
com SQLite no backend.

## Como executar

```bash
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

A API fica em `http://127.0.0.1:8000/api`. Para o frontend, abrir
`frontend/host.html` (anfitrião) e `frontend/public.html` (público) com o
Live Server ou outro servidor estático.

Testes: `python manage.py test`

## API

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/polls/` | Listar votações |
| POST | `/api/polls/` | Criar votação |
| PATCH | `/api/polls/<id>/status/` | Alterar estado |
| POST | `/api/polls/<id>/vote/` | Votar |
| GET | `/api/polls/<id>/results/` | Ver resultados |

## Limitações e próximos passos

Foi implementado o Nível 1 do desafio. Ficou de fora:

- atualização automática dos resultados (é preciso recarregar manualmente);
- prevenção de votos duplicados;
- testes mais abrangentes e melhor validação de erros;
- melhorias de interface e acessibilidade.

## Nota sobre o desenvolvimento

Sou estudante do 2.º ano de LEI e este projeto envolveu conceitos que ainda
estou a aprender, como APIs REST e Django. Por isso, utilizei uma ferramenta
de inteligência artificial como apoio no desenvolvimento.

Fui eu que testei a aplicação e revi o código, mas ainda não consigo justificar
em detalhe todas as decisões técnicas tomadas. Estou disponível para as discutir
e este desafio foi uma boa oportunidade para identificar o que ainda tenho de
estudar. Tenho muito interesse nesta área e vontade de continuar a evoluir.
