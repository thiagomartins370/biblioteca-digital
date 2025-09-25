// Base da API
const apiBase = '/api/books';

// Guarda o login do admin (Basic Auth)
let authHeader = null;

// Atalhos de DOM
const $ = (sel) => document.querySelector(sel);
const lista = $('#lista');
const busca = $('#busca');
const btnBuscar = $('#btn-buscar');

// ------------------------------
// LOGIN DO ADMIN (valida no backend)
// ------------------------------
const formLogin = document.querySelector('#form-login');
formLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = document.querySelector('#userInput').value.trim();
  const pass = document.querySelector('#passInput').value;

  if (!user || !pass) {
    $('#login-status').textContent = 'Preencha usuário e senha.';
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    });

    if (res.ok) {
      authHeader = 'Basic ' + btoa(`${user}:${pass}`);
      $('#login-status').textContent = '🔑 Logado como admin!';
    } else {
      $('#login-status').textContent = '❌ Credenciais inválidas';
    }
  } catch (err) {
    console.error(err);
    $('#login-status').textContent = '⚠️ Erro ao conectar ao servidor';
  }
});

// ------------------------------
// LISTAGEM
// ------------------------------
async function listar(q = '') {
  const url = q ? `${apiBase}?q=${encodeURIComponent(q)}` : apiBase;
  const res = await fetch(url);
  const data = await res.json();
  renderLista(data);
}

function renderLista(books) {
  lista.innerHTML = '';
  if (!books.length) {
    lista.innerHTML = '<li>Nenhum livro encontrado.</li>';
    return;
  }
  for (const b of books) {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `
      ${b.coverUrl ? `<img src="${b.coverUrl}" alt="Capa do livro ${b.title}">` : ''}
      <h3>${b.title}</h3>
      <p><strong>Autor:</strong> ${b.author || 'Desconhecido'}</p>
      <div class="action-row">
        <a href="${b.pdfUrl}" target="_blank" rel="noopener">Abrir PDF</a>
        <button data-id="${b._id}" class="btn-remover" aria-label="Remover ${b.title}">Remover</button>
      </div>
    `;
    lista.appendChild(li);
  }

  // Remover
  document.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (!authHeader) {
        alert('⚠️ Faça login de administrador antes de remover.');
        return;
      }
      const id = e.currentTarget.getAttribute('data-id');
      if (!confirm('Remover este livro?')) return;

      const res = await fetch(`${apiBase}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader }
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert('Erro ao remover: ' + (j.message || res.status));
        return;
      }
      listar(busca.value.trim());
    });
  });
}

// ------------------------------
// FORMULÁRIO (CRIAR)
// ------------------------------
const form = $('#form-livro');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!authHeader) {
    alert('⚠️ Faça login de administrador antes de salvar.');
    return;
  }

  const body = {
    title: $('#tituloInput').value.trim(),
    author: $('#autorInput').value.trim(),
    pdfUrl: $('#pdfUrlInput').value.trim(),
    coverUrl: $('#coverUrlInput').value.trim()
  };

  const res = await fetch(apiBase, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    alert('Erro ao salvar: ' + (j.message || j.error || res.status));
    return;
  }

  form.reset();
  listar();
});

// ------------------------------
// BUSCA
// ------------------------------
btnBuscar?.addEventListener('click', () => listar(busca.value.trim()));
busca?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    listar(busca.value.trim());
  }
});

// ------------------------------
// INICIAL
// ------------------------------
listar();
