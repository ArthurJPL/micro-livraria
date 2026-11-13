const fs = require('fs');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const dataFile = process.env.WISHLIST_DATA_FILE || path.join(__dirname, 'data', 'wishlist.json');

const packageDefinition = protoLoader.loadSync('proto/wishlist.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const wishlistProto = grpc.loadPackageDefinition(packageDefinition);

// carrega os itens do arquivo JSON, criando uma lista vazia quando ainda não existe
function loadItems() {
    try {
        return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            return [];
        }
        throw err;
    }
}

// persiste a lista completa de itens no arquivo JSON
function saveItems(items) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(items, null, 4));
}

const server = new grpc.Server();

// implementa os métodos do WishlistService
server.addService(wishlistProto.WishlistService.service, {
    AddWishlistItem: (payload, callback) => {
        try {
            const items = loadItems();
            const nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
            const item = {
                id: nextId,
                bookId: payload.request.bookId,
                bookName: payload.request.bookName || '',
                userId: payload.request.userId || '',
                createdAt: new Date().toISOString(),
            };

            items.push(item);
            saveItems(items);
            callback(null, item);
        } catch (err) {
            callback(err);
        }
    },
    ListWishlistItems: (_, callback) => {
        try {
            callback(null, { items: loadItems() });
        } catch (err) {
            callback(err);
        }
    },
    RemoveWishlistItem: (payload, callback) => {
        try {
            const items = loadItems();
            const remainingItems = items.filter((item) => item.id !== payload.request.id);

            if (remainingItems.length === items.length) {
                const err = new Error('Wishlist item not found');
                err.code = grpc.status.NOT_FOUND;
                return callback(err);
            }

            saveItems(remainingItems);
            callback(null, {});
        } catch (err) {
            callback(err);
        }
    },
});

const host = process.env.WISHLIST_HOST || '127.0.0.1';
const port = process.env.WISHLIST_PORT || 3003;

server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Wishlist Service running at http://${host}:${port}`);
    server.start();
});
