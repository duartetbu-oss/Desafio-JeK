const API_URL = "http://127.0.0.1:8000/api";

async function obterVotacoes() {
    try {
        const resposta = await fetch(`${API_URL}/polls/`);

        if(!resposta.ok){
            throw new Error("Erro ao obter as votações.");
        }

        const votacoes = await resposta.json();

        console.log(votacoes);

        apresentarVotacoes(votacoes);

        return votacoes;

    } catch (erro){
        console.error(erro);

        document.getElementById("polls-container").innerHTML = "<p>Não foi possível carregar as votações.</p>";
        return [];
    }
}

function apresentarVotacoes(votacoes){
    const container = document.getElementById("polls-container");

    container.innerHTML = "";

    if(votacoes.length === 0){
        container.innerHTML = "<p>Não existem votações.</p>";
        return;
    }

    votacoes.forEach(votacao => {
        const cartao = document.createElement("div");

        const data = new Date(votacao.created_at).toLocaleDateString("pt-PT");

        cartao.innerHTML = `
            <h3>${votacao.question}</h3>
            <p>Estado: ${votacao.status}</p>
            <p>Data de criação: ${data}</p>
            <p>Número de opções: ${votacao.options.length}</p>
        `;

        if (votacao.status === "draft") {
            const botaoAbrir = document.createElement("button");

            botaoAbrir.textContent = "Abrir votação";

            botaoAbrir.addEventListener("click", () => {
                alterarEstadoVotacao(votacao.id, "open");
            });

            cartao.appendChild(botaoAbrir);
        }

        if (votacao.status === "open"){
            const botaoFechar = document.createElement("button");

            botaoFechar.textContent = "Fechar votação";

            botaoFechar.addEventListener("click", () => {
                alterarEstadoVotacao(votacao.id, "closed");
            });

            cartao.appendChild(botaoFechar);
        }

        if (votacao.status === "open" || votacao.status === "closed") {
            const botaoResultados = document.createElement("button");

            botaoResultados.type = "button";
            botaoResultados.textContent = "Ver resultados";

            botaoResultados.addEventListener("click", () => {
                obterResultados(votacao.id, cartao);
            });

            cartao.appendChild(botaoResultados);
        }
        container.appendChild(cartao);
    });
}

function adicionarOpcao() {
    const container = document.getElementById("options-container");

    const opcoes = container.querySelectorAll('input[name="options"]');

    if(opcoes.length >= 5){
        alert("Uma votação pode ter, no máximo, 5 opções.");
        return;
    }

    const novaOpcao = document.createElement("input");

    novaOpcao.type = "text";
    novaOpcao.name = "options";
    novaOpcao.placeholder = `Opção ${opcoes.length + 1}`
    novaOpcao.required = true;

    container.appendChild(novaOpcao);
}

async function criarVotacao(event){
    event.preventDefault();

    const formulario = document.getElementById("create-poll-form");
    const mensagem = document.getElementById("form-message");

    const pergunta = document.getElementById("poll-question").value.trim();

    const camposOpcoes = document.querySelectorAll(
        '#options-container input[name="options"]'
    );

    const opcoes = Array.from(camposOpcoes).map(campo =>
        campo.value.trim()
    );

    if(!pergunta) {
        mensagem.textContent = "A pergunta é obrigatória.";
        return;
    }

    if (opcoes.length < 2 || opcoes.length > 5) {
        mensagem.textContent = "Introduz entre 2 e 5 opções.";
        return;
    }

    if (opcoes.some(opcao => opcao === "")){
        mensagem.textContent = "Preenche todas as opções.";
        return;
    }

    try{
        const resposta = await fetch(`${API_URL}/polls/`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: pergunta,
                options: opcoes
            })
        });

        if (!resposta.ok) {
            const erro = await resposta.text();

            throw new Error(
                erro || "Não foi possível criar a votação."
            );
        }

        mensagem.textContent = "Votação criada com sucesso!";

        formulario.reset();

        const container = document.getElementById("options-container");

        const campos = container.querySelectorAll(
            'input[name="options"]'
        );

        campos.forEach((campo, indice) => {
            if (indice >= 2) {
                campo.remove();
            }
        });

        await obterVotacoes();

    } catch(erro) {
        console.error(erro);

        mensagem.textContent =
            `Erro ao criar votação: ${erro.message}`;
    }
}

async function alterarEstadoVotacao(id, novoEstado) {
    try {
        const resposta = await fetch(
            `${API_URL}/polls/${id}/status/`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: novoEstado
                })
            }
        );

        if (!resposta.ok) {
            const erro = await resposta.text();
            throw new Error(erro);
        }

        await obterVotacoes();

    } catch (erro) {
        console.error(erro);

        alert("Não foi possível alterar o estado da votação.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const botaoAtualizar = document.getElementById("refresh-polls");

    botaoAtualizar.addEventListener("click", obterVotacoes);

    const botaoAdicionarOpcao = document.getElementById("add-option");

    botaoAdicionarOpcao.addEventListener("click", adicionarOpcao);

    const formulario = document.getElementById("create-poll-form");

    formulario.addEventListener("submit", criarVotacao);

    obterVotacoes();
});

async function obterResultados(pollId, cartao) {
    try {
        const resposta = await fetch(
            `${API_URL}/polls/${pollId}/results/`
        );

        const dados = await resposta.json();

        console.log("Resutaldos recebidos da API:", dados);

        if (!resposta.ok) {
            throw new Error(
                dados.error || "Não foi possível obter os resultados."
            );
        }

        apresentarResultados(cartao, dados);

    } catch (erro) {
        console.error("Erro ao obter resultados:", erro);

        alert("Não foi possível carregar os resultados.");
    }
}

function apresentarResultados(cartao, dados) {
    let secao = cartao.querySelector(".poll-results");

    if (!secao) {
        secao = document.createElement("div");
        secao.className = "poll-results";

        cartao.appendChild(secao);
    }

    secao.replaceChildren();

    const titulo = document.createElement("h4");
    titulo.textContent = "Resultados";

    secao.appendChild(titulo);

    dados.results.forEach(resultado => {
        const linha = document.createElement("p");

        linha.textContent =
            `${resultado.text}: ${resultado.votes} voto(s)`;

            secao.appendChild(linha);
    });

    const total = document.createElement("p");

    total.textContent = `Total de votos: ${dados.total_votes}`;

    secao.appendChild(total);
}
