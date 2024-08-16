const Config = require("../../config");
const CryptoHash = require("./src/utils/cryptoHash");

/**
 * Verifies API Service Secret
 * @param {*} secret
 * @returns boolean
 */
const VerifyAppSecret = async (secret) => {
  return (
    secret === (await CryptoHash(Config.TOUR.SERVICE.SECRET, Config.APP_SECRET))
  );
};

module.exports = VerifyAppSecret;
