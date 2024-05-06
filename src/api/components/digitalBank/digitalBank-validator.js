const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createBankAccount: {
    body: {
      name: joi.string().uppercase().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      accountNumber: joi.string().length(9).pattern(/^[0-9]+$/).required().label("Account Number"),
      deposit: joi.number().min(1).required().label('Deposit'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },

  updateBankAccount: {
    body: {
      name: joi.string().uppercase().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      accountNumber: joi.string().length(9).pattern(/^[0-9]+$/).required().label("Account Number"),
      password: joi.string().required().label('Password'),
    },
  },
  
  deleteBankAccount: {
    body: {
      password: joi.string().required().label('Password'),
    },
  },

  changePassword: {
    body: {
      password_old: joi.string().required().label('Old password'),
      password_new: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('New password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },

  deposit: {
    body: {
      amount: joi.number().min(1).required().label('Deposit Amount'),
    },
  },

  payment: {
    body: {
      amount: joi.number().min(1).required().label('Deposit Amount'),
      title: joi.string().max(200).required().label('Title'),
      password: joi.string().required().label('Password'),
    },
  },

  transfer: {
    body: {
      amount: joi.number().min(1).required().label('Transfer Amount'),
      password: joi.string().required().label('Password'),
    }
  }
};
