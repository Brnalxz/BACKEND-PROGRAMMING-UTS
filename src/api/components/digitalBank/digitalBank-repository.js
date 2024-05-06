const { bankUser } = require('../../../models');

/**
 * Get a list of bankUsers
 * @returns {Promise}
 */
async function getBankAccounts() {
  return bankUser.find({});
}

/**
 * Get bankUser detail
 * @param {string} id - bankUser ID
 * @returns {Promise}
 */
async function getBankAccount(id) {
  return bankUser.findById(id);
}

/**
 * Check bankUser balance
 * @param {string} id - bankUser ID
 * @returns {Promise}
 */
async function getBalance(id) {
  return bankUser.findById(id);
}

/**
 * Create new bank account
 * @param {string} ownerName
 * @param {number} accountNumber
 * @param {number} balance
 * @param {string} password
 * @returns {Promise}
 */
async function createBankAccount(
  ownerName,
  email,
  accountNumber,
  balance,
  password
) {
  return bankUser.create({
    ownerName,
    email,
    accountNumber,
    balance,
    password,
  });
}

/**
 * Update existing bankAccount
 * @param {string} id - Bank Account ID
 * @param {string} ownerName - Owner Name
 * @param {number} accountNumber - Account Number
 * @returns {Promise}
 */
async function updateBankAccount(id, ownerName, email, accountNumber) {
  return bankUser.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        ownerName,
        email,
        accountNumber,
      },
    }
  );
}

/**
 * balance
 * @param {string} id - account ID
 * @param {number} total - total balance
 * @returns {Promise}
 */
async function balance(id, total) {
  return bankUser.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        balance: total,
      },
    }
  );
}

/**
 * Delete a bank account
 * @param {string} id - bank account ID
 * @returns {Promise}
 */
async function deleteBankAccount(id) {
  return bankUser.deleteOne({ _id: id });
}

/**
 * Get account by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getBankAccountByEmail(email) {
  return bankUser.findOne({ email });
}

/**
 * Get account by accountNumber to prevent duplicate account
 * @param {string} accountNumber - accountNumber
 * @returns {Promise}
 */
async function getBankAccountByAccountNumber(accountNumber) {
  return bankUser.findOne({ accountNumber });
}

/**
 * Update account password
 * @param {string} id - bank account ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return bankUser.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getBankAccounts,
  getBankAccount,
  getBalance,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getBankAccountByAccountNumber,
  getBankAccountByEmail,
  changePassword,
  balance,
};
