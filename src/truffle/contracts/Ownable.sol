// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
* @title Ownable
* @dev The Ownable contract has an owner address, and provides basic authorization control
* functions, this simplifies the implementation of "user permissions".
*/
contract Ownable {
  address private _owner;

  event ownership_transferred(
    address indexed previous_owner,
    address indexed new_owner
  );

  /**
  * @dev The Ownable constructor sets the original `owner` of the contract to the sender
  * account.
  */
  constructor() {
    _owner = msg.sender;
    emit ownership_transferred(address(0), _owner);
  }

  /**
  * @return the address of the owner.
  */
  function owner() public view returns(address) {
    return _owner;
  }

  /**
  * @dev Throws if called by any account other than the owner.
  */
  modifier only_owner() {
    require(is_owner());
    _;
  }

  /**
  * @return true if `msg.sender` is the owner of the contract.
  */
  function is_owner() public view returns(bool) {
    return msg.sender == _owner;
  }

  /**
  * @dev Allows the current owner to relinquish control of the contract.
  * @notice Renouncing to ownership will leave the contract without an owner.
  * It will not be possible to call the functions with the `onlyOwner`
  * modifier anymore.
  */
  function renounce_ownership() public only_owner {
    emit ownership_transferred(_owner, address(0));
    _owner = address(0);
  }

  /**
  * @dev Allows the current owner to transfer control of the contract to a newOwner.
  * @param new_owner The address to transfer ownership to.
  */
  function transfer_ownership(address new_owner) public only_owner {
    _transfer_ownership(new_owner);
  }

  /**
  * @dev Transfers control of the contract to a newOwner.
  * @param new_owner The address to transfer ownership to.
  */
  function _transfer_ownership(address new_owner) internal {
    require(new_owner != address(0));
    emit ownership_transferred(_owner, new_owner);
    _owner = new_owner;
  }
}