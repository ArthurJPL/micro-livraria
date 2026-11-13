const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/wishlist.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const WishlistService = grpc.loadPackageDefinition(packageDefinition).WishlistService;
const client = new WishlistService(
    process.env.WISHLIST_ADDR || '127.0.0.1:3003',
    grpc.credentials.createInsecure()
);

module.exports = client;
