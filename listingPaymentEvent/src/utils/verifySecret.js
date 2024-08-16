const CryptoHash = require("./src/utils/cryptoHash");

/**
 * Verifies API Service Secret
 * @param {*} secret
 * @param {*} value
 * @param {*} key
 * @returns boolean
 */
const VerifySecret = async (secret, value, key) => {
  return secret === (await CryptoHash(value, key));
};

module.exports = VerifySecret;
