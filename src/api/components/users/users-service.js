const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users with pagination
 * @param {number} page_number - page number
 * @param {number} page_size - how many users in one page
 * @param {string} search - search user by email or name
 * @param {string} sort - sort user by email or name (ascending or decending)
 * @returns {array}
 */
async function getUsers(page_number, page_size, search, sort) {
  const users = await usersRepository.getUsers();

  // Filter users based on the search
  const [fieldName, searchKey] = search.split(':');
  const filteredUsers = users.filter((user) => {
    if (fieldName === 'email' || fieldName === 'name') {
      return user[fieldName].toLowerCase().includes(searchKey.toLowerCase());
    }
    return true;
  });

  // Filter users based on the sort (default ascending)
  const [sortField, sortOrder] = sort.split(':');
  filteredUsers.sort((a, b) => {
    if (a[sortField] < b[sortField]) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Calculate the total pages and determine if there has a previous pages or has a next pages
  const totalPages = Math.ceil(filteredUsers.length / page_size);
  const hasPreviousPages = page_number > 1;
  const hasNextPages = page_number < totalPages;

  const results = [];
  // Check if the filteredUsers is not empty before iterating
  if (filteredUsers.length > 0) {
    for (let i = 0; i < filteredUsers.length; i += 1) {
      const user = filteredUsers[i];
      results.push({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }
  }

  return { results, totalPages, hasPreviousPages, hasNextPages };
}

/**
 * Get list of users with pagination
 * @param {number} page_number - page number
 * @param {number} page_size - how many users in one page
 * @param {string} search - search user by email or name
 * @param {string} sort - sort user by email or name (ascending or decending)
 * @returns {array}
 */
async function getUsersWithPagination(page_number, page_size, search, sort) {
  const users = await usersRepository.getUsers();

  //Filter users based on the search
  const [fieldName, searchKey] = search.split(':');
  const filteredUsers = users.filter((user) => {
    if (fieldName === 'email' || fieldName === 'name') {
      return user[fieldName].toLowerCase().includes(searchKey.toLowerCase());
    }
    return true;
  });

  //Filter users based on the sort (default ascending)
  const [sortField, sortOrder] = sort.split(':');
  filteredUsers.sort((a, b) => {
    if (a[sortField] < b[sortField]) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // User not found
  if (!users) {
    return null;
  }

  //Limit the users data
  const nextUser = (page_number - 1) * page_size;
  const limits = page_size;

  const results = [];
  for (
    let i = nextUser;
    i < Math.min(nextUser + limits, filteredUsers.length);
    i += 1
  ) {
    const user = filteredUsers[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
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
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
  getUsersWithPagination,
};
