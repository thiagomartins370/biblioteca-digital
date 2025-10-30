document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const statusMsg = document.getElementById('status-msg');
    statusMsg.style.color = 'black';
    statusMsg.textContent = '⏳ Enviando...';

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('cover', document.getElementById('cover').files[0]);
    formData.append('pdf', document.getElementById('pdf').files[0]);

    try {
        const res = await fetch('/api/books/upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        statusMsg.style.color = 'green';
        statusMsg.textContent = '✅ Livro cadastrado com sucesso!';

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error(error);
        statusMsg.style.color = 'red';
        statusMsg.textContent = '❌ Erro ao cadastrar o livro.';
    }
});
