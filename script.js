
// ======================================
// DADOS DO AVENTUREIRO
// ======================================

// Elementos do HTML
const dicePoolElement = document.getElementById("dicePool");
const diceCountElement = document.getElementById("diceCount");

const rollButton = document.getElementById("rollButton");
const clearPoolButton = document.getElementById("clearPoolButton");

const resultSection = document.getElementById("resultSection");
const resultsList = document.getElementById("resultsList");
const totalValue = document.getElementById("totalValue");

const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");

// ======================================
// VARIÁVEIS
// ======================================

// Aqui ficam os dados escolhidos pelo jogador
let dicePool = [];

// Identificador individual de cada dado
let nextDiceId = 1;

// Nome usado para salvar o histórico no navegador
const HISTORY_KEY = "dados-aventureiro-historico";

// Carrega o histórico salvo
let history = loadHistory();


// ======================================
// ADICIONAR DADOS
// ======================================

const diceButtons = document.querySelectorAll(".dice-option");

diceButtons.forEach(button => {

    button.addEventListener("click", () => {

        const sides = Number(button.dataset.sides);

        // Cria um novo dado
        const newDie = {
            id: nextDiceId,
            sides: sides,
            result: null
        };

        nextDiceId++;

        // Adiciona ao conjunto
        dicePool.push(newDie);

        invalidateResults();
        renderPool();

    });

});


// ======================================
// REMOVER DADOS
// ======================================

dicePoolElement.addEventListener("click", event => {

    const removeButton = event.target.closest("[data-remove-id]");

    if (!removeButton) return;

    const id = Number(removeButton.dataset.removeId);

    // Retira somente o dado selecionado
    dicePool = dicePool.filter(die => die.id !== id);

    invalidateResults();
    renderPool();

});


// ======================================
// MOSTRAR DADOS NA TELA
// ======================================

function renderPool() {

    dicePoolElement.innerHTML = "";

    // Se não houver dados
    if (dicePool.length === 0) {

        dicePoolElement.innerHTML = `
            <p class="empty-state">
                Nenhum dado selecionado.
                <br>
                Adicione seus primeiros dados!
            </p>
        `;

    }

    // Cria um elemento para cada dado
    dicePool.forEach(die => {

        const item = document.createElement("div");
        item.className = "dice-item";

        const label = document.createElement("span");
        label.className = "dice-label";
        label.textContent = `D${die.sides}`;

        item.appendChild(label);

        // Mostra o resultado ao lado do dado, depois da rolagem
        if (die.result !== null) {

            const result = document.createElement("span");
            result.className = "dice-result";
            result.textContent = `= ${die.result}`;

            item.appendChild(result);

        }

        // Botão para remover o dado
        const removeButton = document.createElement("button");

        removeButton.className = "remove-die";
        removeButton.textContent = "×";
        removeButton.type = "button";

        removeButton.dataset.removeId = die.id;

        removeButton.setAttribute(
            "aria-label",
            `Remover dado D${die.sides}`
        );

        item.appendChild(removeButton);

        dicePoolElement.appendChild(item);

    });

    // Atualiza a quantidade de dados
    diceCountElement.textContent =
        `${dicePool.length} ${dicePool.length === 1 ? "dado" : "dados"}`;

    // Só permite jogar quando existe pelo menos um dado
    rollButton.disabled = dicePool.length === 0;

}


// ======================================
// INVALIDAR RESULTADOS ANTIGOS
// ======================================

function invalidateResults() {

    // Remove resultados anteriores do conjunto
    dicePool.forEach(die => {
        die.result = null;
    });

    // Esconde a área de resultados
    resultSection.hidden = true;

    resultsList.innerHTML = "";

    totalValue.textContent = "0";

}


// ======================================
// LIMPAR CONJUNTO
// ======================================

clearPoolButton.addEventListener("click", () => {

    dicePool = [];

    invalidateResults();
    renderPool();

});


// ======================================
// ROLAR OS DADOS
// ======================================

rollButton.addEventListener("click", () => {

    // Impede rolagem sem dados
    if (dicePool.length === 0) return;

    // Sorteia um resultado para cada dado
    dicePool.forEach(die => {

        die.result = Math.floor(Math.random() * die.sides) + 1;

    });

    // Atualiza os dados na tela
    renderPool();

    // Mostra os resultados individuais
    renderResults();

    // Calcula a soma
    const total = dicePool.reduce((sum, die) => {

        return sum + die.result;

    }, 0);

    // Cria o registro do histórico
    const newRecord = {

        date: new Date().toLocaleString("pt-BR"),

        dice: dicePool.map(die => ({

            sides: die.sides,
            result: die.result

        })),

        total: total

    };

    // Coloca o registro mais recente no início
    history.unshift(newRecord);

    // Mantém somente as últimas 10 rolagens
    history = history.slice(0, 10);

    // Salva e atualiza o histórico
    saveHistory();
    renderHistory();

});


// ======================================
// MOSTRAR RESULTADOS INDIVIDUAIS
// ======================================

function renderResults() {

    resultsList.innerHTML = "";

    let total = 0;

    dicePool.forEach(die => {

        const tile = document.createElement("div");
        tile.className = "result-tile";

        const name = document.createElement("span");
        name.textContent = `D${die.sides}`;

        const value = document.createElement("strong");
        value.textContent = die.result;

        tile.appendChild(name);
        tile.appendChild(value);

        resultsList.appendChild(tile);

        // Soma os valores
        total += die.result;

    });

    // Exibe o total
    totalValue.textContent = total;

    // Mostra a seção de resultados
    resultSection.hidden = false;

}


// ======================================
// SALVAR HISTÓRICO
// ======================================

function saveHistory() {

    try {

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(history)
        );

    } catch (error) {

        console.error("Não foi possível salvar o histórico:", error);

    }

}


// ======================================
// CARREGAR HISTÓRICO
// ======================================

function loadHistory() {

    try {

        const saved = localStorage.getItem(HISTORY_KEY);

        if (!saved) return [];

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) return [];

        return parsed.filter(record => {

            return record &&
                Array.isArray(record.dice) &&
                Number.isFinite(record.total);

        }).slice(0, 10);

    } catch (error) {

        console.error("Não foi possível carregar o histórico:", error);

        return [];

    }

}


// ======================================
// MOSTRAR HISTÓRICO
// ======================================

function renderHistory() {

    historyList.innerHTML = "";

    // Se ainda não houve nenhuma rolagem
    if (history.length === 0) {

        historyList.innerHTML = `
            <p class="empty-state">
                Nenhuma rolagem realizada ainda.
            </p>
        `;

    }

    history.forEach(record => {

        const entry = document.createElement("div");
        entry.className = "history-entry";

        const details = document.createElement("div");
        details.className = "history-details";

        // Exemplo: D20 (15) + D8 (4) + D10 (8)
        const composition = document.createElement("p");
        composition.className = "history-composition";

        composition.textContent = record.dice
            .map(die => `D${die.sides} (${die.result})`)
            .join(" + ");

        const date = document.createElement("p");
        date.className = "history-date";
        date.textContent = record.date || "Data indisponível";

        const total = document.createElement("strong");
        total.className = "history-total";
        total.textContent = `Total: ${record.total}`;

        details.appendChild(composition);
        details.appendChild(date);

        entry.appendChild(details);
        entry.appendChild(total);

        historyList.appendChild(entry);

    });

    // Desabilita o botão quando não existe histórico
    clearHistoryButton.disabled = history.length === 0;

}


// ======================================
// LIMPAR HISTÓRICO
// ======================================

clearHistoryButton.addEventListener("click", () => {

    history = [];

    saveHistory();
    renderHistory();

});


// ======================================
// INICIALIZAÇÃO DO APLICATIVO
// ======================================

renderPool();
renderHistory();
