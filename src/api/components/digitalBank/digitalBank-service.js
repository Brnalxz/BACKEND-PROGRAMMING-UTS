const digitalbankRepository = require('./digitalBank-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of bank accounts
 * @param {number} page_number - page number
 * @param {number} page_size - how many accounts in one page
 * @param {string} search - search account by ownerName
 * @param {string} sort - sort account by ownerName (ascending or decending)
 * @returns {array}
 */
async function getBankAccounts(page_number, page_size, search, sort) {
  const accounts = await digitalbankRepository.getBankAccounts();

  // Filter accounts based on the search
  const [fieldName, searchKey] = search.split(':');
  const filteredAccounts = accounts.filter(account => {
    if (fieldName === 'email' || fieldName === 'ownerName') {
      return account.ownerName.toLowerCase().includes(searchKey.toLowerCase());
    }
    return true;
  });

  // Filter accounts based on the sort (default ascending)
  const [sortField, sortOrder] = sort.split(':');
  filteredAccounts.sort((a, b) => {
    if (a[sortField] < b[sortField]) {
      return sortOrder === 'asc'? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortOrder === 'asc'? 1 : -1;
    }
    return 0;
  });

  // Calculate the total pages and determine if there has a previous pages or has a next pages
  const totalPages = Math.ceil(filteredAccounts.length / page_size);
  const hasPreviousPages = page_number > 1;
  const hasNextPages = page_number < totalPages;

  const results = [];
  // Check if the filteredAccounts is not empty before iterating
  if (filteredAccounts.length > 0) {
    for (let i = 0; i < filteredAccounts.length; i += 1) {
      const account = filteredAccounts[i];
      results.push({
        id: account.id,
        owner_name: account.ownerName,
        account_number: account.accountNumber,
        balance: account.balance,
      });
    }
  }

  return {results, totalPages, hasPreviousPages, hasNextPages};
}


/**
 * Get list of bank accounts
 * @param {number} page_number - page number
 * @param {number} page_size - how many accounts in one page
 * @param {string} search - search account by ownerName
 * @param {string} sort - sort account by ownerName (ascending or decending)
 * @returns {array}
 */
async function getBankAccountsWithPagination(page_number, page_size, search, sort) {
  const accounts = await digitalbankRepository.getBankAccounts();

  //Filter account based on the search
  const [fieldName, searchKey] = search.split(':');
  const filteredAccounts = accounts.filter(account => {
   if (fieldName === 'email' || fieldName === 'ownerName') {
     return account[fieldName].toLowerCase().includes(searchKey.toLowerCase());
   }
   return true;
  });

  //Filter account based on the sort (default ascending)
  const [sortField, sortOrder] = sort.split(':');
  filteredAccounts.sort((a, b) => {
     if (a[sortField] < b[sortField]) {
       return sortOrder === 'asc' ? -1 : 1;
     }
     if (a[sortField] > b[sortField]) {
       return sortOrder === 'asc' ? 1 : -1;
     }
     return 0;
  });

  //Limit the accounts data
  const nextAccount = (page_number - 1) * page_size;
  const limits = page_size;

  const results = [];
  for (let i = nextAccount; i < Math.min(nextAccount + limits, filteredAccounts.length); i += 1)  {
    const account = filteredAccounts[i];
    results.push({
      id: account.id,
      owner_name: account.ownerName,
      email: account.email,
      account_number: account.accountNumber,
      balance: account.balance
    });
  }

  return results;
}

/**
 * Get bankAccount
 * @param {string} id - account ID
 * @returns {Object}
 */
async function getBankAccount(id) {
  const account = await digitalbankRepository.getBankAccount(id);

  // account not found
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    owner_name: account.ownerName,
    email: account.email,
    accountNumber: account.accountNumber,
    balance: account.balance,
  };
}

/**
 * Get bankAccountByAccountNumber
 * @param {string} accountNumber - account number
 * @returns {Object}
 */
async function getBankAccountByAccountNumber(accountNumber) {
  const account = await digitalbankRepository.getBankAccountByAccountNumber(accountNumber);

  // Account not found
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    owner_name: account.ownerName,
    email: account.email,
    accountNumber: account.accountNumber,
    balance: account.balance,
  };
}

/**
 * To check account balance
 * @param {string} id - account ID
 * @returns {Object}
 */
async function getBalance(accountNumber) {
  const account = await digitalbankRepository.getBankAccountByAccountNumber(accountNumber);

  // account not found
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    owner_name: account.ownerName,
    email: account.email,
    balance: account.balance,
  };
}


/**
 * Create new bankAccount
 * @param {string} ownerName - Owner Name
 * @param {number} accountNumber - Account Number
 * @param {number} balance - Balance
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createBankAccount(ownerName, accountNumber, bank, balance, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await digitalbankRepository.createBankAccount(ownerName, accountNumber, bank, balance, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing bank Account
 * @param {string} id - account ID
 * @param {string} name - Name
 * @param {number} accountNumber - Account Number
 * @returns {boolean}
 */
async function updateBankAccount(id, name, email, accountNumber, password) {
  const account = await digitalbankRepository.getBankAccount(id);

  // Check if account not found
  if (!account) {
    return null;
  }

  try {
    await digitalbankRepository.updateBankAccount(id, name, email, accountNumber);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete bankAccount
 * @param {string} id - account ID
 * @returns {boolean}
 */
async function deleteBankAccount(id) {
  const bankAccount = await digitalbankRepository.getBankAccount(id);

  // Check if bankAccount not found
  if (!bankAccount) {
    return null;
  }

  try {
    await digitalbankRepository.deleteBankAccount(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await digitalbankRepository.getBankAccountByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the accountNumber is registered
 * @param {number} accountNumber - accountNumber
 * @returns {boolean}
 */
async function accountNumberIsRegistered(accountNumber) {
  const bankAccount = await digitalbankRepository.getBankAccountByAccountNumber(accountNumber);

  if (bankAccount) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} bankAccountId - account ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(bankAccountId, password) {
  const bankAccount = await digitalbankRepository.getBankAccount(bankAccountId);
  return passwordMatched(password, bankAccount.password);
}

/**
 * Change account password
 * @param {string} bankAccountId - account ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(bankAccountId, password) {
  const bankAccount = await digitalbankRepository.getBankAccount(bankAccountId);

  // Check if account not found
  if (!bankAccount) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await digitalbankRepository.changePassword(
    bankAccountId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Deposit or Topup amount of balance to bank account
 * @param {string} id - account ID
 * @param {number} amount - amount of balance to deposit
 * @returns {boolean}
 */
async function deposit(id, amount){
  const account = await digitalbankRepository.getBankAccount(id);

  // Check if account not found
  if (!account) {
    return null;
  }

  const total = account.balance + amount;

  const depositSuccess = await digitalbankRepository.balance(id, total);
  
  if(!depositSuccess){
    return null;
  }

  return true;
}

/**
 * Payment
 * @param {string} id - account ID
 * @param {number} amount - amount of balance to deposit
 * @returns {boolean}
 */
async function payment(id, amount){
  const account = await digitalbankRepository.getBankAccount(id);

  // Check if account not found
  if (!account) {
    return null;
  }

  // Check if current balance more than amount of payment
  if(account.balance < amount){
    return null;
  }

  const total = account.balance - amount;

  const paymentSuccess = await digitalbankRepository.balance(id, total);
  
  if(!paymentSuccess){
    return null;
  }

  return true;
}

/**
 * Transfer balance between two bank accounts
 * @param {string} sourceId - Source account ID
 * @param {string} targetId - Target account ID
 * @param {number} amount - Amount to transfer
 * @returns {boolean}
 */
async function transferBalance(id, id2, amount) {
  // Retrieve source account details
  const sourceAccount = await digitalbankRepository.getBankAccount(id);
  if (!sourceAccount) {
    return false;
  }

  // Retrieve target account details
  const targetAccount = await digitalbankRepository.getBankAccount(id2);
  if (!targetAccount) {
    return false;
  }

  // Check if source account has enough balance
  if (sourceAccount.balance < amount) {
    return false;
  }

  // Deduct amount from source account
  const total = sourceAccount.balance -= amount;

  // Add amount to target account
  const total2 = targetAccount.balance += amount;

  const transferSuccess = await digitalbankRepository.balance(id, total);
  const targetSuccess = await digitalbankRepository.balance(id2, total2);

  if(!transferSuccess){
    return null;
  }

  if(!targetSuccess){
    return null;
  }

  return true;
}



module.exports = {
  getBankAccounts,
  getBankAccount,
  getBankAccountByAccountNumber,
  getBalance,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  emailIsRegistered,
  accountNumberIsRegistered,
  checkPassword,
  changePassword,
  getBankAccountsWithPagination,
  transferBalance,
  deposit,
  payment,
};
