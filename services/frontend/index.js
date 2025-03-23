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
                </div>
            </div>
        </div>`;
    return div;
}

function calculateShipping(id, cep) {
    fetch('http://localhost:3000/shipping/' + cep)
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

function insertAllBooks() {
    const books = document.querySelector('.books');

    
    fetch('http://localhost:3000/products')
    .then((data) => {
        if (data.ok) {
            return data.json();
        }
        throw data.statusText;
    })
    .then((data) => {
        if (data) {
                books.innerHTML = '';
                data.forEach((book) => {
                    books.appendChild(newBook(book));
                });

                document.querySelectorAll('.button-shipping').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                        calculateShipping(id, cep);
                    });
                });

                document.querySelectorAll('.button-buy').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        swal('Compra de livro', 'Sua compra foi realizada com sucesso', 'success');
                    });
                });
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
}

document.addEventListener('DOMContentLoaded', insertAllBooks);

function searchByID() {
    const id = document.querySelector('#searchByID').value;

    if (!id) {
        insertAllBooks();
        return;
    }

    const parsedId = parseInt(id);

    if (isNaN(parsedId)) {
        swal('Erro', 'ID deve ser um número', 'error');
        return;
    }

    fetch('http://localhost:3000/product/' + parsedId)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data;
        })
        .then((data) => {
            const books = document.querySelector('.books');
            books.innerHTML = '';
            books.appendChild(newBook(data));

            document.querySelectorAll('.button-shipping').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                    calculateShipping(id, cep);
                });
            });

            document.querySelectorAll('.button-buy').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    swal('Compra de livro', 'Sua compra foi realizada com sucesso', 'success');
                });
            });
        })
        .catch((err) => {
            if (err.status === 404) {
                swal('Erro', 'Produto não encontrado', 'error');
                console.error(err.statusText);
                return;
            }

            swal('Erro', 'Erro ao buscar produto', 'error');
            console.error(err.statusText);
        });
}

function addBook() {
    const name = document.querySelector('#addBookName').value;
    const author = document.querySelector('#addBookAuthor').value;
    const quantity = document.querySelector('#addBookQuantity').value;
    const price = document.querySelector('#addBookPrice').value;
    const photo = document.querySelector('#addBookPhoto').value;

    if (!name || !author || !quantity || !price || !photo) {
        swal('Erro', 'Preencha todos os campos', 'error');
        return;
    }

    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedQuantity) || isNaN(parsedPrice)) {
        swal('Erro', 'Quantidade e preço devem ser números', 'error');
        return;
    }

    const book = {
        name,
        author,
        quantity: parsedQuantity,
        price: parsedPrice,
        photo,
    };

    fetch('http://localhost:3000/product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    })
    .then((data) => {
        if (data.ok) {
            return data.json();
        }
        throw data.statusText;
    })
    .then((data) => {
        swal('Sucesso', 'Livro adicionado com sucesso', 'success');
        insertAllBooks();
    })
    .catch((err) => {
        swal('Erro', 'Erro ao adicionar livro', 'error');
        console.error(err);
    });
}