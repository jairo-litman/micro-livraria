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

const searchAllProducts = (_, callback) => {
    callback(null, {
        products: products,
    });
}

const SearchProductByID = (payload, callback) => {
    const product = products.find((product) => product.id === payload.request.id);
    if (!product) {
        return callback({
            code: grpc.status.NOT_FOUND,
            message: 'Product not found',
        });
    }

    callback(null, product);
}

const AddProduct = (payload, callback) => {
    const product = payload.request;
    product.id = products.length + 1;
    products.push(product);

    callback(null, product);
}

// implementa os métodos do InventoryService
server.addService(inventoryProto.InventoryService.service, {
    searchAllProducts: searchAllProducts,
    SearchProductByID: SearchProductByID,
    AddProduct: AddProduct,
});

server.bindAsync('127.0.0.1:3002', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Inventory Service running at http://127.0.0.1:3002');
    server.start();
});
