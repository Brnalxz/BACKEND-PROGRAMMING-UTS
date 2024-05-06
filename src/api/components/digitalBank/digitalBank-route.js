const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const digitalbankControllers = require('./digitalBank-controller');
const digitalbankValidator = require('./digitalBank-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/digitalbank', route);

  // Get list of bank accounts
  route.get('/', authenticationMiddleware, digitalbankControllers.getBankAccounts);

  // Create user
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(digitalbankValidator.createBankAccount),
    digitalbankControllers.createBankAccount
  );

  // Check Balance user account
  route.get('/:accountNumber', authenticationMiddleware, digitalbankControllers.getBalance);

  // Update user
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(digitalbankValidator.updateBankAccount),
    digitalbankControllers.updateBankAccount
  );

  // Delete user
  route.delete(
    '/:id',
    authenticationMiddleware,
    celebrate(digitalbankValidator.deleteBankAccount),
    digitalbankControllers.deleteBankAccount
  );

  // Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(digitalbankValidator.changePassword),
    digitalbankControllers.changePassword
  );

  // Deposit or Topup balance
  route.put(
    '/:id/deposit',
    authenticationMiddleware,
    celebrate(digitalbankValidator.deposit),
    digitalbankControllers.deposit
  );

  // Payment 
route.post(
  '/:id/payment',
  authenticationMiddleware,
  celebrate(digitalbankValidator.payment),
  digitalbankControllers.payment
);

  // Transfer
  route.post(
    '/:id/:id2/transfer',
    authenticationMiddleware,
    celebrate(digitalbankValidator.transfer),
    digitalbankControllers.transferBalance
  );

};
