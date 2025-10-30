const jwt = require('jsonwebtoken');

const hasLocalAccount = (user) => {
  return !!user.password;
};

module.exports = {
  hasLocalAccount
};