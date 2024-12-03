const createApp = require("./app");

const startServer = (initialState = {}) => {
  const port = 3000;
  const app = createApp(initialState);
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log("With initial state:");
    console.log(initialState);
  });

  return { server, app };
};

module.exports = startServer;
