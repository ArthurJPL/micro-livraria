const express = require('express');
const grpc = require('@grpc/grpc-js');
const shipping = require('./shipping');
const inventory = require('./inventory');
const wishlist = require('./wishlist');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res, next) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res, next) => {
    shipping.GetShippingRate(
        {
            cep: req.params.cep,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.cep,
                    value: data.value,
                });
            }
        }
    );
});

/**
 * Adiciona um livro à lista de desejos via WishlistService
 */
app.post('/wishlist', (req, res, next) => {
    const { bookId, bookName, userId } = req.body || {};
    const parsedBookId = Number(bookId);

    if (!Number.isInteger(parsedBookId) || parsedBookId <= 0) {
        return res.status(400).send({ error: 'bookId is required and must be a positive integer' });
    }

    wishlist.AddWishlistItem(
        {
            bookId: parsedBookId,
            bookName: typeof bookName === 'string' ? bookName : '',
            userId: typeof userId === 'string' ? userId : '',
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.status(201).json(data);
            }
        }
    );
});

/**
 * Retorna a lista de desejos via WishlistService
 */
app.get('/wishlist', (req, res, next) => {
    wishlist.ListWishlistItems({}, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.items);
        }
    });
});

/**
 * Remove um item da lista de desejos via WishlistService
 */
app.delete('/wishlist/:id', (req, res, next) => {
    const parsedId = Number(req.params.id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return res.status(400).send({ error: 'id is required and must be a positive integer' });
    }

    wishlist.RemoveWishlistItem({ id: parsedId }, (err) => {
        if (err) {
            console.error(err);

            if (err.code === grpc.status.NOT_FOUND) {
                return res.status(404).send({ error: 'wishlist item not found' });
            }

            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.status(204).send();
        }
    });
});

/**
 * Inicia o router
 */
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Controller Service running on http://127.0.0.1:${port}`);
});
