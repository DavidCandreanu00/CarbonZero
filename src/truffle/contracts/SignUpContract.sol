// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./Ownable.sol";

/// @title Sign Up contract
/// @author David Candreanu
/// @notice Any user can use this contract to join the platform, and the Owner can use it to grant permission rights.
/// @dev The status of an address represents its access level.
abstract contract SignUpContract is Ownable{
    mapping (address => string) private address_account_cid;
    mapping (address => uint8) private address_account_status;
    mapping (address => uint64) private address_base_year_emissions;

    /// @title Status change event
    /// @author David Candreanu
    /// @notice The event is emitted whenever the status of an address is modified.
    event status_change(address indexed target_address,
        uint8 indexed status);

    modifier is_approved() {
        require(address_account_status[msg.sender] == 2);
        _;
    }

    constructor() {
        address_account_status[msg.sender] = 3;
    }

    /// @title Change account status
    /// @author David Candreanu
    /// @notice The admin can change the status of any address.
    /// @dev Only the owner of the contract can change the status.
    function set_account_status (address _address, uint8 _status) external only_owner {
        address_account_status[_address] = _status;
        emit status_change(_address, _status);
    }

    /// @title Get account status
    /// @author David Candreanu
    /// @notice Any user can see the status of an address.
    function get_account_status (address _address) public view returns (uint8) {
        return address_account_status[_address];
    }

    /// @title Get account CID
    /// @author David Candreanu
    /// @notice Any user can see the CID of an address.
    function get_account_cid (address _address) external view returns (string memory) {
        return address_account_cid[_address];
    }

    /// @title Get account base year emissions
    /// @author David Candreanu
    /// @notice Any user can see the base year emissions of an address.
    function get_account_base_year_emissions (address _address) public view returns (uint64) {
        return address_base_year_emissions[_address];
    }

    /// @title Set the account's CID
    /// @author David Candreanu
    /// @notice Any user can change its own CID.
    function set_account_cid (address _address, string memory _cid) external {
        require(msg.sender == _address, "E1");
        address_account_cid[_address] = _cid;
    }

    /// @title Delete an account
    /// @author David Candreanu
    /// @notice Any user can delete their own account.
    /// @dev A status change event is emitted when the account is deleted.
    function delete_account (address _address) external {
        require(msg.sender == _address, "E1");
        address_account_status[_address] = 0;
        emit status_change(_address, 0);
    }

    /// @title Request access
    /// @author David Candreanu
    /// @notice A user can request to receive higher permissions to the platform.
    /// @dev The user's address must not already have a status different from 0.
    function request_access (string memory _cid, uint64 _emissions) external {
        require(address_account_status[msg.sender] == 0, "E2");

        address_account_status[msg.sender] = 1;
        address_account_cid[msg.sender] = _cid;
        address_base_year_emissions[msg.sender] = _emissions;

        emit status_change(msg.sender, 1);
    }
}
