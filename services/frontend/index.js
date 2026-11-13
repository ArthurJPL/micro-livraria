const API_BASE_URL = 'http://localhost:3000';
const WISHLIST_USER_ID = 'frontend';

let wishlistItems = [];
const productsById = new Map();

function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-6">Disponível em estoque: 5</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button button-shipping is-info" data-id="${book.id}"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button button-buy is-success is-fullwidth">Comprar</button>
                    <button class="button button-wishlist is-link is-fullwidth" data-id="${book.id}">
                        Adicionar à lista
                    </button>
                </div>
            </div>
        </div>`;
    return div;
}

function calculateShipping(id, cep) {
    fetch(`${API_BASE_URL}/shipping/` + cep)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            swal('Frete', `O frete é: R$${data.value.toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}

function getWishlistItemByBookId(bookId) {
    return wishlistItems.find((item) => String(item.bookId) === String(bookId));
}

function updateWishlistButtons() {
    document.querySelectorAll('.button-wishlist').forEach((btn) => {
        const wishlistItem = getWishlistItemByBookId(btn.getAttribute('data-id'));

        if (wishlistItem) {
            btn.textContent = 'Remover da lista';
            btn.classList.add('is-danger');
            btn.classList.remove('is-link');
        } else {
            btn.textContent = 'Adicionar à lista';
            btn.classList.remove('is-danger');
            btn.classList.add('is-link');
        }

        btn.classList.remove('is-static');
        btn.disabled = false;
    });
}

function loadWishlist() {
    return fetch(`${API_BASE_URL}/wishlist`)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((items) => {
            wishlistItems = Array.isArray(items) ? items : [];
        })
        .catch((err) => {
            console.error(err);
            swal('Erro', 'Erro ao carregar a lista de desejos', 'error');
        })
        .then(() => {
            updateWishlistButtons();
            return wishlistItems;
        });
}

function addToWishlist(book) {
    return fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bookId: book.id,
            bookName: book.name,
            userId: WISHLIST_USER_ID,
        }),
    })
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((item) => {
            swal('Lista de desejos', `${item.bookName || 'Livro'} foi adicionado à sua lista`, 'success');
            return loadWishlist();
        })
        .catch((err) => {
            console.error(err);
            swal('Erro', 'Erro ao adicionar livro à lista de desejos', 'error');
        });
}

function removeFromWishlist(itemId) {
    return fetch(`${API_BASE_URL}/wishlist/${itemId}`, {
        method: 'DELETE',
    })
        .then((data) => {
            if (data.ok) {
                return data;
            }
            throw data.statusText;
        })
        .then(() => {
            swal('Lista de desejos', 'Livro removido da sua lista', 'success');
            return loadWishlist();
        })
        .catch((err) => {
            console.error(err);
            swal('Erro', 'Erro ao remover livro da lista de desejos', 'error');
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const books = document.querySelector('.books');

    const productsPromise = fetch(`${API_BASE_URL}/products`)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    productsById.set(String(book.id), book);
                    books.appendChild(newBook(book));
                });
            }
            return data;
        });

    Promise.all([productsPromise, loadWishlist()])
        .then(() => {
            document.querySelectorAll('.button-shipping').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                    calculateShipping(id, cep);
                });
            });

            document.querySelectorAll('.button-buy').forEach((btn) => {
                btn.addEventListener('click', () => {
                    swal('Compra de livro', 'Sua compra foi realizada com sucesso', 'success');
                });
            });

            document.querySelectorAll('.button-wishlist').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const book = productsById.get(btn.getAttribute('data-id'));

                    if (!book) {
                        return;
                    }

                    const wishlistItem = getWishlistItemByBookId(book.id);
                    btn.disabled = true;

                    if (wishlistItem) {
                        removeFromWishlist(wishlistItem.id).finally(() => updateWishlistButtons());
                    } else {
                        addToWishlist(book).finally(() => updateWishlistButtons());
                    }
                });
            });

            updateWishlistButtons();
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
});
