const API_URL = "http://127.0.0.1:8000/api";

async function obterVotacoes() {
    const container = document.getElementById("polls-container");

    container.textContent = "A carregar votações...";

    try{
        const resposta = await fetch(`${API_URL}/polls/`);

        if (!resposta.ok) {
            throw new Error("Erro ao obter as votações.");
        }
        
        const votacoes = await resposta.json();

        const votacoesVisiveis = votacoes.filter(
            votacao => 
                votacao.status === "open" ||
                votacao.status === "closed"
        );

        apresentarVotacoes(votacoesVisiveis);

    } catch (erro) {
        console.error(erro);

        container.textContent = "Não foi possível carregar as votações. Tenta novamente.";
    }
}

function apresentarVotacoes(votacoes) {
    const container = document.getElementById("polls-container");

    container.replaceChildren();

    if (votacoes.length === 0) {
        container.textContent = "Não existem votações disponíveis.";
        return;
    }

    votacoes.forEach(votacao => {
        const cartao = document.createElement("article");

        const titulo = document.createElement("h3");
        titulo.textContent = votacao.question;

        const estado = document.createElement("p");

        estado.textContent = votacao.status === "open" ? "Estado: Aberta" : "Estado: Fechada";

        cartao.append(titulo, estado);

        if (votacao.status === "open") {
            criarFomularioVoto(cartao, votacao);
        } else {
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

function criarFomularioVoto(cartao, votacao) {
    const formulario = document.createElement("form");

    const grupoOpcoes = document.createElement("div");

    votacao.options.forEach(opcao => {
        const label = document.createElement("label");
        const radio = document.createElement("input");

        radio.type = "radio";
        radio.name = `poll-${votacao.id}`;
        radio.value = opcao.id;
        radio.required = true;

        label.append(
            radio,
            document.createTextNode(` ${opcao.text}`)
        );

        grupoOpcoes.appendChild(label);
        grupoOpcoes.appendChild(document.createElement("br"));
    });

    const botaoVotar = document.createElement("button");

    botaoVotar.type = "submit";
    botaoVotar.textContent = "Submeter voto";

    const mensagem = document.createElement("p");
    mensagem.setAttribute("role", "status");

    formulario.append(
        grupoOpcoes,
        botaoVotar,
        mensagem
    );

    formulario.addEventListener("submit", async event => {
        event.preventDefault();

        const selecionada = formulario.querySelector(
            'input[type="radio"]:checked'
        );

        if (!selecionada) {
            mensagem.textContent = "Seleciona uma opçao.";
            return;
        }

        botaoVotar.disabled = true;
        mensagem.textContent = "A registar o voto...";

        try {
            const resposta = await fetch(
                `${API_URL}/polls/${votacao.id}/vote/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        option_id: Number(selecionada.value)
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                console.error("Erro da API:", dados);

                throw new Error(
                    dados.error || "Não foi possível registar o voto."
                );
            }

            mensagem.textContent = "Obrigado! O teu voto foi registado.";

            formulario.querySelectorAll("input").forEach(input => {
                input.disabled = true;
            });

            botaoVotar.disabled = true;
        } catch (erro) {
            console.error(erro);

            mensagem.textContent = erro.message;

            botaoVotar.disabled = false;
        }
    });

    cartao.appendChild(formulario);
}

async function obterResultados(pollId, cartao) {
    const botao = cartao.querySelector("button");

    if (botao) {
        botao.disabled = true;
    }

    try {
        const resposta = await fetch(`${API_URL}/polls/${pollId}/results/`);

        if (!resposta.ok) {
            throw new Error("Não foi possível obter os resultados.");
        }

        const dados = await resposta.json();

        if (dados.status !== "closed") {
            throw new Error("Os resultados só estão disponíveis após fechar a votação.");
        }

        apresentarResutaldos(cartao, dados);
    } catch (erro) {
        console.error(erro);
        alert(erro.message);
    } finally {
        if (botao && botao.isConnected) {
            botao.disabled = false;
        }
    }
}

function apresentarResutaldos(cartao, dados) {
    let secaoResultados = cartao.querySelector(".poll-results");

    if (!secaoResultados) {
        secaoResultados = document.createElement("div");
        secaoResultados.className = "poll-results";
        cartao.appendChild(secaoResultados);
    }

    secaoResultados.replaceChildren();

    const titulo = document.createElement("h4");
    titulo.textContent = "Resultados finais";

    secaoResultados.appendChild(titulo);

    dados.results.forEach(resultado => {
        const linha = document.createElement("p");

        linha.textContent = `${resultado.text}: ${resultado.votes} voto(s)`;

        secaoResultados.appendChild(linha);
    });

    const total = document.createElement("p");

    total.textContent = `Total de votos: ${dados.total_votes}`;

    secaoResultados.appendChild(total);
}

document.addEventListener("DOMContentLoaded", () => {
    const botaoAtualizar = document.getElementById("refresh-polls");

    botaoAtualizar.addEventListener("click", obterVotacoes);

    obterVotacoes();
});

