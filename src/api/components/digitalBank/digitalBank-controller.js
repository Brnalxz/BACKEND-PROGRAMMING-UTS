const digitalbankService = require('./digitalBank-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of bank accounts request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getBankAccounts(request, response, next) {
  try {
    const page_number = parseInt(request.query.page_number) || 1;
    const page_size = parseInt(request.query.page_size) || 15;
    const search = request.query.search || "";
    const sort = request.query.sort || 'asc';

    const bankAccounts = await digitalbankService.getBankAccountsWithPagination(page_number, page_size, search, sort);
    const totalDataBankAccounts = await digitalbankService.getBankAccounts(page_number, page_size, search, sort);

    if (bankAccounts.length === 0) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY, 
        'Bank Account not found'
      );
    }

    return response.status(200).json({
      page_number: page_number,
      page_size: page_size,
      count: bankAccounts.length,
      total_pages: totalDataBankAccounts.totalPages,
      has_previous_page: totalDataBankAccounts.hasPreviousPages,
      has_next_page: totalDataBankAccounts.hasNextPages,
      data: bankAccounts,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get bank account detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getBankAccount(request, response, next) {
  const id = request.params.id;

  try {
    const bankAccount = await digitalbankService.getBankAccount(id);

    if (!bankAccount) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY, 
        'Unknown Bank Account'
      );
    }

    return response.status(200).json(bankAccount);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get bank account detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getBalance(request, response, next) {
  const accountNumber = request.params.accountNumber;

  try {
    const bankAccount = await digitalbankService.getBalance(accountNumber);

    if (!bankAccount) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY, 
        'Unknown Bank Account'
      );
    }

    return response.status(200).json(bankAccount);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create bank account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createBankAccount(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const accountNumber = request.body.accountNumber;
    const deposit = request.body.deposit;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await digitalbankService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // Account number must be unique
    const accountNumberIsRegistered = await digitalbankService.accountNumberIsRegistered(accountNumber);
    if (accountNumberIsRegistered) {
      throw errorResponder(
        errorTypes.ACCOUNT_NUMBER_ALREADY_TAKEN,
        'Account Number is already registered'
      );
    }

    const success = await digitalbankService.createBankAccount(name, email, accountNumber, deposit, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create bank account'
      );
    }

    return response.status(200).json({
       ownerName: name,
       email,
       account_number: accountNumber, 
       balance: `Rp. ${deposit}`, 
      });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update bank account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateBankAccount(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;
    const accountNumber = request.body.accountNumber;
    const password = request.body.password;

    // Email must be unique
    const emailIsRegistered = await digitalbankService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // Account number must be unique
    const accountNumberIsRegistered = await digitalbankService.accountNumberIsRegistered(accountNumber);
    if (accountNumberIsRegistered) {
      throw errorResponder(
        errorTypes.ACCOUNT_NUMBER_ALREADY_TAKEN,
        'Account number is already registered'
      );
    }

    // Check password
    if (
      !(await digitalbankService.checkPassword(id, password))
    ) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS, 
        'Wrong password');
    }

    const success = await digitalbankService.updateBankAccount(id, name, email, accountNumber, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update Bank Account'
      );
    }

    return response.status(200).json({ 
      id, 
      owner_name: name, 
      email,
      account_number: accountNumber,
      message: "Account changed successfully"
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete Bank Account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteBankAccount(request, response, next) {
  try {
    const id = request.params.id;
    const password = request.body.password;

    // Check password
    if (
      !(await digitalbankService.checkPassword(id, password))
    ) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS, 
        'Wrong password');
    }

    const account = await digitalbankService.getBankAccount(id);
    const success = await digitalbankService.deleteBankAccount(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete Bank Account'
      );
    }

    return response.status(200).json({ 
      id,
      owner_name: account.ownerName,
      account_number: account.accountNumber,
      message: "Account deleted successfully"
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change Bank Account password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    const id = request.params.id;
    const password_old = request.body.password_old;
    const password_new = request.body.password_new;
    const password_confirm = request.body.password_confirm;

    // Check password confirmation
    if (password_new !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await digitalbankService.checkPassword(id, password_old))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await digitalbankService.changePassword(id, password_new);

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ 
      id: id,
      message: "Password changed successfully"
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle deposit request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deposit(request, response, next){
  try{
    const id = request.params.id;
    const amount = request.body.amount;

    const bankAccount = await digitalbankService.getBankAccount(id);
    const depositSuccess = await digitalbankService.deposit(id, amount);

    if (!depositSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to deposit'
      );
    }

    return response.status(200).json({ 
      id,
      owner_name: bankAccount.OwnerName,
      message: "Deposit success",
      amount: `Rp. ${amount}`,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle payment request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function payment(request, response, next){
  try{
    const id = request.params.id;
    const bank = request.body.bank;
    const amount = request.body.amount;
    const title = request.body.title;
    const password = request.body.password;

    // Check password
    if (
      !(await digitalbankService.checkPassword(id, password))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const userAccount = await digitalbankService.getBankAccount(id);
    const paymentSuccess = await digitalbankService.payment(id, amount);

    if(userAccount.balance < amount){
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Balance not enough'
      );
    }

    if (!paymentSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to payment'
      );
    }

    return response.status(200).json({ 
      id,
      bank,
      amount: `Rp. ${amount}`,
      message: "Payment success",
      title,
    });
  } catch (error) {
    return next(error);
  }
}

async function transferBalance(request, response, next){
  try{
    const id = request.params.id;
    const id2 = request.params.id2;
    const amount = request.body.amount;
    const password = request.body.password;

    // Check password
    if (
      !(await digitalbankService.checkPassword(id, password))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const sourceAccount = await digitalbankService.getBankAccount(id);
    const targetAccount = await digitalbankService.getBankAccount(id2);
    const transferSuccess = await digitalbankService.transferBalance(id, id2, amount)

    if(sourceAccount.balance < amount){
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        `Balance not enough`
      );
    }

    if(!transferSuccess){
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to transfer balance'
      );
    }

    return response.status(200).json({ 
      id,
      owner_name: targetAccount.ownerName,
      amount: `Rp. ${amount}`,
      message: "transfer successfully"
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getBankAccounts,
  getBankAccount,
  getBalance,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  changePassword,
  deposit,
  payment,
  transferBalance,
};
