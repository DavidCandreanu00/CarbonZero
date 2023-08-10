// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./Ownable.sol";

/// @title The contract that contains sign up functionality for the platform
/// @author David Candreanu
/// @notice Any user can use this contract to join the platform, and the Owner can use it to grant permission rights.
/// @dev The status of an address represents its access level.
abstract contract SignUpContract is Ownable{
    mapping (address => string) private address_account_cid;
    mapping (address => uint8) private address_account_status;
    mapping (address => uint64) private address_base_year_emissions;

    event status_change(address indexed target_address,
        uint8 indexed status);

    modifier is_approved() {
        require(address_account_status[msg.sender] == 2);
        _;
    }

    constructor() {
        address_account_status[msg.sender] = 3;
    }

    function set_account_status (address _address, uint8 _status) external only_owner {
        address_account_status[_address] = _status;
        emit status_change(_address, _status);
    }

    function get_account_status (address _address) public view returns (uint8) {
        return address_account_status[_address];
    }

    function get_account_cid (address _address) external view returns (string memory) {
        return address_account_cid[_address];
    }

    function get_account_base_year_emissions (address _address) public view returns (uint64) {
        return address_base_year_emissions[_address];
    }

    function set_account_cid (address _address, string memory _cid) external {
        require(msg.sender == _address, "E1");
        address_account_cid[_address] = _cid;
    }

    function delete_account (address _address) external {
        require(msg.sender == _address, "E1");
        address_account_status[_address] = 0;
        emit status_change(_address, 0);
    }

    function request_access (string memory _cid, uint64 _emissions) external {
        require(address_account_status[msg.sender] == 0, "E2");

        address_account_status[msg.sender] = 1;
        address_account_cid[msg.sender] = _cid;
        address_base_year_emissions[msg.sender] = _emissions;

        emit status_change(msg.sender, 1);
    }
}
