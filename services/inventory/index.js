const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const products = require('./products.json');

const packageDefinition = protoLoader.loadSync('proto/inventory.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const inventoryProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// implementa os métodos do InventoryService
server.addService(inventoryProto.InventoryService.service, {
    searchAllProducts: (_, callback) => {
        callback(null, {
            products: products,
        });
    },
});

const host = process.env.INVENTORY_HOST || '127.0.0.1';
const port = process.env.INVENTORY_PORT || 3002;

server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Inventory Service running at http://${host}:${port}`);
    server.start();
});
