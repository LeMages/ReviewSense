const { authJwt } = require('./authJwt');

function authSession(req, res, next) {
  return authJwt(req, res, next);
}

module.exports = { authSession };
