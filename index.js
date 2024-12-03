const startServer = require("./src/server");
const mockData = require("./src/test/mockData");

// pass any initial state to the server to add mock data for menu items, orders, and loyalty accounts
startServer(mockData);
