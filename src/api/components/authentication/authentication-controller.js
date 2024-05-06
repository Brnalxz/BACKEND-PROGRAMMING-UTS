const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
const failedLoginAttempts = {};

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Check if the user has exceeded the limit failed attempts within 30 minutes
    const currentTime = Date.now();
    const lastFailedAttempt = failedLoginAttempts[email]?.lastAttempt || 0;
    const failedAttempt = failedLoginAttempts[email]?.attempts || 0;

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    //Check the failed attempt
    if (
      failedAttempt >= 5 &&
      currentTime - lastFailedAttempt < 30 * 60 * 1000
    ) {
      //Calculate the waitingTime(in minute) for user before the user can attempt to log in again
      const waitingTime = Math.ceil(
        (30 * 60 * 1000 - (currentTime - lastFailedAttempt)) / (60 * 1000)
      );
      throw errorResponder(
        errorTypes.FORBIDDEN,
        `Too many failed login attempts. Please try again in ${waitingTime} minutes`
      );
    }

    if (!loginSuccess) {
      //Update the failed attempts and the timestamp of the last failed attempt
      failedLoginAttempts[email] = {
        attempts: failedAttempt + 1,
        lastAttempt: currentTime,
      };
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    // Reset failed attempts counter if successful login
    delete failedLoginAttempts[email];

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
