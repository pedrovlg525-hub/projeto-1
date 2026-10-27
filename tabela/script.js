
const form = document.getElementById("formTarefa");
const campoNome = document.getElementById("nome");
const campoData = document.getElementById("data");
const campoCategoria = document.getElementById("categoria");
const campoPrioridade = document.getElementById("prioridade");
const filtroCategoria = document.getElementById("filtroCategoria");
const listaTarefas = document.getElementById("listaTarefas");

let tarefas = [];

try {
    const dadosSalvos = JSON.parse(
        localStorage.getItem("organizadorTarefas") || "[]"
    );

    if (Array.isArray(dadosSalvos)) {
        tarefas = dadosSalvos.filter(t =>
            t &&
            typeof t.id === "string" &&
            typeof t.nome === "string" &&
            typeof t.data === "string" &&
            ["Estudos", "Trabalho", "Pessoal", "Outros"].includes(t.categoria) &&
            ["Baixa", "Média", "Alta"].includes(t.prioridade) &&
            typeof t.concluida === "boolean"
        );
    }
} catch {
    tarefas = [];
}

function salvarTarefas() {
    try {
        localStorage.setItem(
            "organizadorTarefas",
            JSON.stringify(tarefas)
        );
    } catch {
        alert("Não foi possível salvar as tarefas neste navegador.");
    }
}

function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function atualizarProgresso() {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;

    const porcentagem = total === 0
        ? 0
        : Math.round((concluidas / total) * 100);

    document.getElementById("textoProgresso").textContent =
        `${concluidas} de ${total} tarefas concluídas`;

    document.getElementById("porcentagem").textContent =
        `${porcentagem}%`;

    document.getElementById("barraProgresso").style.width =
        `${porcentagem}%`;
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function renderizarTarefas() {
    listaTarefas.replaceChildren();

    const categoriaSelecionada = filtroCategoria.value;

    const tarefasFiltradas = tarefas.filter(t =>
        categoriaSelecionada === "Todas" ||
        t.categoria === categoriaSelecionada
    );

    if (tarefasFiltradas.length === 0) {
        const mensagem = categoriaSelecionada === "Todas"
            ? "Nenhuma atividade cadastrada."
            : "Nenhuma atividade encontrada nesta categoria.";

        listaTarefas.appendChild(
            criarElemento("p", "vazio", mensagem)
        );

        atualizarProgresso();
        return;
    }

    tarefasFiltradas.forEach(tarefa => {
        const cartao = criarElemento(
            "article",
            `tarefa${tarefa.concluida ? " concluida" : ""}`
        );

        const informacoes = criarElemento("div", "tarefa-info");

        informacoes.appendChild(
            criarElemento("h3", "tarefa-nome", tarefa.nome)
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "detalhes",
                `Entrega: ${formatarData(tarefa.data)}`
            )
        );

        const etiquetas = criarElemento("div", "etiquetas");

        etiquetas.appendChild(
            criarElemento("span", "etiqueta", tarefa.categoria)
        );

        const classePrioridade = {
            "Alta": "prioridade-alta",
            "Média": "prioridade-media",
            "Baixa": "prioridade-baixa"
        }[tarefa.prioridade];

        etiquetas.appendChild(
            criarElemento(
                "span",
                `etiqueta ${classePrioridade}`,
                `Prioridade ${tarefa.prioridade}`
            )
        );

        if (tarefa.concluida) {
            etiquetas.appendChild(
                criarElemento("span", "etiqueta", "Concluída")
            );
        }

        informacoes.appendChild(etiquetas);

        const acoes = criarElemento("div", "acoes");

        const botaoConcluir = criarElemento(
            "button",
            "btn-concluir",
            tarefa.concluida ? "Desfazer" : "Concluir"
        );

        botaoConcluir.type = "button";
        botaoConcluir.setAttribute(
            "aria-label",
            `${tarefa.concluida ? "Desfazer conclusão de" : "Concluir"} ${tarefa.nome}`
        );

        botaoConcluir.addEventListener("click", () => {
            tarefa.concluida = !tarefa.concluida;
            salvarTarefas();
            renderizarTarefas();
        });

        const botaoExcluir = criarElemento(
            "button",
            "btn-excluir",
            "Excluir"
        );

        botaoExcluir.type = "button";
        botaoExcluir.setAttribute(
            "aria-label",
            `Excluir ${tarefa.nome}`
        );

        botaoExcluir.addEventListener("click", () => {
            tarefas = tarefas.filter(t => t.id !== tarefa.id);
            salvarTarefas();
            renderizarTarefas();
        });

        acoes.append(botaoConcluir, botaoExcluir);
        cartao.append(informacoes, acoes);
        listaTarefas.appendChild(cartao);
    });

    atualizarProgresso();
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const nome = campoNome.value.trim();
    const data = campoData.value;
    const categoria = campoCategoria.value;
    const prioridade = campoPrioridade.value;

    if (!nome || !data || !categoria || !prioridade) {
        alert("Preencha todos os campos.");
        return;
    }

    tarefas.push({
        id: crypto.randomUUID(),
        nome,
        data,
        categoria,
        prioridade,
        concluida: false
    });

    salvarTarefas();
    form.reset();
    campoPrioridade.value = "Média";

    renderizarTarefas();
});

filtroCategoria.addEventListener("change", renderizarTarefas);

renderizarTarefas();
