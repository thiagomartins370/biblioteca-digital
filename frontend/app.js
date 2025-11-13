// ============================================
// frontend/app.js – Biblioteca Digital Infantil
// Versão simplificada (sem capa)
// Desenvolvido pelo Grupo Biblioteca Digital Infantil – PI II Univesp 2025
// ============================================

// 🌐 Caminho base da API – detecta automaticamente o ambiente (local ou online)
const apiBase =
  location.hostname.includes("localhost")
    ? "http://localhost:3000/api/books"
    : "https://biblioteca-digital-1-gdjw.onrender.com/api/books";

// 🔐 Carrega o token salvo (login admin)
let authHeader = localStorage.getItem("authHeader") || null;

// 🧩 Atalhos de DOM
const $ = (sel) => document.querySelector(sel);
const lista = $("#lista");
const busca = $("#busca");
const btnBuscar = $("#btn-buscar");
const btnSair = $("#logoutBtn");
const btnCadastrar = $(".btn-cadastro");
const btnLogin = $("#loginBtn");

// --------------------------------------------
// 📚 Renderização simplificada – título + categoria + botões
// --------------------------------------------
function renderizarLivros(books) {
  if (!books.length) {
    lista.innerHTML = "<li><p>Nenhum livro encontrado.</p></li>";
    return;
  }

  lista.innerHTML = books
    .map(
      (b) => `
      <li class="livro-card simples">
        <h3>📘 ${b.title}</h3>
        <p>${b.category || "Sem categoria"}</p>
        <div class="buttons">

          <!-- 🔥 CORREÇÃO: PDF abre em nova aba SEM baixar -->
          <a href="${b.fileUrl}&embedded=true"
             target="_blank"
             rel="noopener noreferrer"
             class="btn-ler">📖 Ler</a>

          ${
            authHeader && authHeader.startsWith("Basic ")
              ? `<button class="btn-excluir" data-id="${b._id}">🗑️ Excluir</button>`
              : ""
          }
        </div>
      </li>
    `
    )
    .join("");
}

// --------------------------------------------
// 🔎 Função: listar livros (com busca opcional)
// --------------------------------------------
async function listar(filtro = "") {
  lista.innerHTML = "<li><p>Carregando livros...</p></li>";

  try {
    const res = await fetch(`${apiBase}`);
    const books = await res.json();

    const filtrados = filtro
      ? books.filter((b) =>
          b.title.toLowerCase().includes(filtro.toLowerCase())
        )
      : books;

    renderizarLivros(filtrados);
  } catch (err) {
    console.error("❌ Erro ao listar livros:", err);
    lista.innerHTML = "<li><p>Erro ao carregar livros.</p></li>";
  }
}

// --------------------------------------------
// 🗑️ Função: excluir livro (somente admin)
// --------------------------------------------
lista?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-excluir");
  if (!btn) return;

  const id = btn.dataset.id;
  if (!confirm("Deseja realmente excluir este livro?")) return;

  try {
    const res = await fetch(`${apiBase}/${id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader },
    });

    if (res.ok) {
      alert("✅ Livro removido com sucesso!");
      listar(busca.value);
    } else {
      const data = await res.json();
      alert("Erro: " + (data.error || "Não foi possível remover o livro."));
    }
  } catch (err) {
    console.error("❌ Erro ao excluir livro:", err);
    alert("Erro ao excluir o livro. Verifique o console para mais detalhes.");
  }
});

// --------------------------------------------
// 🔐 Login/Logout: mostrar/ocultar botões
// --------------------------------------------
function atualizarInterface() {
  if (authHeader) {
    btnCadastrar?.classList.remove("hidden");
    btnSair?.classList.remove("hidden");
    btnLogin?.classList.add("hidden");
  } else {
    btnCadastrar?.classList.add("hidden");
    btnSair?.classList.add("hidden");
    btnLogin?.classList.remove("hidden");
  }
}

btnSair?.addEventListener("click", () => {
  localStorage.removeItem("authHeader");
  authHeader = null;
  atualizarInterface();
  alert("Você saiu da conta de administrador.");
});

// --------------------------------------------
// 🔍 Busca
// --------------------------------------------
btnBuscar?.addEventListener("click", () => listar(busca.value));
busca?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") listar(busca.value);
});

// --------------------------------------------
// 🚀 Inicialização
// --------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("📚 App.js carregado com sucesso!");
  atualizarInterface();
  listar();
});
