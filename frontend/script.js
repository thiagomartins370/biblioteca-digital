// frontend/script.js

async function carregarLivros() {
  const container = document.getElementById('books-container');
  container.innerHTML = '<p>Carregando livros...</p>';

  try {
    const response = await fetch('/api/books');
    const books = await response.json();

    if (books.length === 0) {
      container.innerHTML = '<p>Nenhum livro cadastrado ainda.</p>';
      return;
    }

    container.innerHTML = '';

    books.forEach(book => {
      const item = document.createElement('div');
      item.classList.add('book-item');

      const img = document.createElement('img');
      img.src = book.coverUrl;
      img.alt = book.title;
      img.title = book.title;

      img.addEventListener('click', () => {
        window.open(book.fileUrl, '_blank');
      });

      item.appendChild(img);
      container.appendChild(item);
    });

  } catch (error) {
    console.error('Erro ao carregar livros:', error);
    container.innerHTML = '<p>Erro ao carregar livros.</p>';
  }
}

carregarLivros();
