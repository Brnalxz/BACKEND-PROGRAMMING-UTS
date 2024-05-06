const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const digitalbank = require('./components/digitalBank/digitalBank-route');
const users = require('./components/users/users-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  digitalbank(app);

  return app;
};
