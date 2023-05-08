/*const Ownable = artifacts.require("Ownable");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
};

const SignUpContract = artifacts.require("SignUpContract");

module.exports = function(deployer) {
  deployer.deploy(SignUpContract).then((instance) => {
    console.log("SignUpContract deployed at address:", instance.address);
  });
};
*/

const TradingPlatform = artifacts.require("TradingPlatform");

module.exports = function(deployer) {
  deployer.deploy(TradingPlatform).then((instance) => {
    console.log("TradingPlatform deployed at address:", instance.address);
  });
};