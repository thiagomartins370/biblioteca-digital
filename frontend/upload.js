// ============================================
// frontend/upload.js – Biblioteca Digital Infantil
// Revisão final – 2025-11-12 – Thiago Martins
// ============================================

// 🌐 Detecta ambiente automático (localhost ou Render)
const apiBase = location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://biblioteca-digital-1-gdjw.onrender.com";

// --------------------------------------------
// Evento principal: envio do formulário de cadastro de livro
// --------------------------------------------
document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("upload-status");
  const form = e.target;

  const title = form.title.value.trim();
  const category = form.category.value.trim();
  const cover = form.cover.files[0];
  const pdf = form.pdf.files[0];

  // 🧩 Validação de campos obrigatórios
  if (!title || !category || !cover || !pdf) {
    status.innerHTML = "⚠️ <b>Preencha todos os campos antes de enviar.</b>";
    status.style.color = "red";
    return;
  }

  // 🔒 Verifica login do administrador
  const authHeader = localStorage.getItem("authHeader");
  if (!authHeader) {
    status.innerHTML = "🔒 <b>Faça login como administrador para cadastrar livros.</b>";
    status.style.color = "red";
    return;
  }

  // 🔄 Exibe status de envio
  status.innerHTML = "📤 <b>Enviando livro para a biblioteca...</b>";
  status.style.color = "#1a85ff";

  // Monta o corpo da requisição com FormData
  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", category);
  formData.append("cover", cover);
  formData.append("pdf", pdf);

  try {
    const res = await fetch(`${apiBase}/api/books/upload`, {
      method: "POST",
      headers: { Authorization: authHeader },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      console.log("📘 Livro cadastrado com sucesso:", data);

      // ✅ Feedback positivo
      status.innerHTML = "✅ <b>Livro cadastrado com sucesso!</b>";
      status.style.color = "green";

      // Limpa formulário e redireciona após 2 segundos
      form.reset();
      setTimeout(() => (window.location.href = "index.html"), 2000);
    } else {
      const errData = await res.json();
      status.innerHTML =
        "❌ <b>Erro:</b> " + (errData.error || "Falha no upload. Verifique os dados.");
      status.style.color = "red";
    }
  } catch (err) {
    console.error("❌ Erro ao enviar livro:", err);
    status.innerHTML =
      "⚠️ <b>Erro de conexão com o servidor.</b><br>Tente novamente mais tarde.";
    status.style.color = "red";
  }
});
