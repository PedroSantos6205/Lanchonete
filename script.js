// CAIXA DA LANCHONETE
// O valor 0 é a condição de parada (sentinela).

const form = document.getElementById("form-lanche");
const campoValor = document.getElementById("valor-lanche");
const mensagem = document.getElementById("mensagem");
const botaoAdicionar = form.querySelector("button[type='submit']");
const botaoEncerrar = document.getElementById("encerrar-caixa");
const statusCaixa = document.querySelector(".status");

let quantidadeLanches = 0;
let totalArrecadado = 0;
let caixaEncerrado = false;
let numeroLancamento = 0;

// Converte um número para o formato de moeda brasileiro.
function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Atualiza os três indicadores do painel.
function atualizarResumo() {
  const media = quantidadeLanches > 0
    ? totalArrecadado / quantidadeLanches
    : 0;

  document.getElementById("quantidade").textContent = quantidadeLanches;
  document.getElementById("total").textContent = moeda(totalArrecadado);
  document.getElementById("media").textContent = moeda(media);
  document.getElementById("contador-historico").textContent =
    `${quantidadeLanches} ${quantidadeLanches === 1 ? "registro" : "registros"}`;
}

// Adiciona uma venda ao histórico visual.
function adicionarAoHistorico(valor) {
  const lista = document.getElementById("lista-vendas");

  // Remove a mensagem inicial quando a primeira venda é registrada.
  if (quantidadeLanches === 1) {
    lista.innerHTML = "";
  }

  numeroLancamento++;

  const linha = document.createElement("tr");
  linha.innerHTML = `
    <td>Venda ${String(numeroLancamento).padStart(2, "0")}</td>
    <td>${moeda(valor)}</td>
    <td><span class="tag">Registrada</span></td>
  `;
  lista.prepend(linha);
}

// Registra um valor informado pelo operador.
function registrarValor(valor) {
  // O while processa os valores que aguardam registro.
  const fila = [valor];

  while (fila.length > 0) {
    const valorAtual = fila.shift();

    // Zero encerra o caixa e não entra na soma nem na contagem.
    if (valorAtual === 0) {
      encerrarCaixa();
    } else {
      quantidadeLanches++;
      totalArrecadado += valorAtual;
      adicionarAoHistorico(valorAtual);
      atualizarResumo();

      mensagem.textContent = `Venda ${numeroLancamento} registrada com sucesso.`;
      mensagem.className = "feedback success";
    }
  }
}

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (caixaEncerrado) return;

  const texto = campoValor.value.trim();
  const valor = Number(texto);

  if (texto === "" || !Number.isFinite(valor) || valor < 0) {
    mensagem.textContent = "Digite um valor válido, igual ou maior que zero.";
    mensagem.className = "feedback error";
    campoValor.focus();
    return;
  }

  registrarValor(valor);
  campoValor.value = "";

  if (!caixaEncerrado) {
    campoValor.focus();
  }
});

// Também permite encerrar pelo botão, sem precisar digitar zero.
botaoEncerrar.addEventListener("click", encerrarCaixa);

function encerrarCaixa() {
  if (caixaEncerrado) return;

  caixaEncerrado = true;
  campoValor.disabled = true;
  botaoAdicionar.disabled = true;
  botaoEncerrar.disabled = true;
  statusCaixa.classList.add("closed");
  document.getElementById("status-caixa").textContent = "Caixa encerrado";

  const media = quantidadeLanches > 0
    ? totalArrecadado / quantidadeLanches
    : 0;

  mensagem.textContent =
    `Atendimento encerrado. ${quantidadeLanches} lanche(s) vendido(s), ` +
    `${moeda(totalArrecadado)} arrecadados e média de ${moeda(media)}.`;
  mensagem.className = "feedback success";
  atualizarResumo();
}

// Prepara o sistema para um novo intervalo.
document.getElementById("reiniciar").addEventListener("click", function () {
  quantidadeLanches = 0;
  totalArrecadado = 0;
  numeroLancamento = 0;
  caixaEncerrado = false;

  campoValor.disabled = false;
  campoValor.value = "";
  botaoAdicionar.disabled = false;
  botaoEncerrar.disabled = false;
  statusCaixa.classList.remove("closed");
  document.getElementById("status-caixa").textContent = "Caixa aberto";

  document.getElementById("lista-vendas").innerHTML =
    '<tr class="empty-row"><td colspan="3">Nenhuma venda registrada até o momento.</td></tr>';

  mensagem.textContent = "Novo atendimento iniciado. Aguardando o primeiro lançamento.";
  mensagem.className = "feedback";
  atualizarResumo();
  campoValor.focus();
});
