'use strict';
const http = require('http');
const app = require('./app');
const port = process.env.PORT || 4000;
const server = http.createServer(app);

app.set('PORT_NUMBER', port);

//  Start the app on the specific interface (and port).
server.listen(port, () => {
  console.log(`Nodejs Server application started on port ${port} at Date ${new Date()}`);
});

module.exports = server;
