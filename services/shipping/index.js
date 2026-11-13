const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/shipping.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const shippingProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// implementa os métodos do ShippingService
server.addService(shippingProto.ShippingService.service, {
    GetShippingRate: (_, callback) => {
        const shippingValue = Math.random() * 100 + 1; // Random value from R$1 to R$100

        callback(null, {
            value: shippingValue,
        });
    },
});

const host = process.env.SHIPPING_HOST || '0.0.0.0';
const port = process.env.SHIPPING_PORT || 3001;

server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Shipping Service running at http://${host}:${port}`);
    server.start();
});
