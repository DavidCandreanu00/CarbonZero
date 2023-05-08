// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./SignUpContract.sol";

contract TradingPlatform is SignUpContract{
    mapping (address => uint64) private allowance;
    mapping (address => bytes32) private sell_orders;
    mapping (address => bytes32) private buy_orders;

    uint64 private total_allowance;

    bool private trading_open;

    event sell_order_event (address indexed seller_address,
        uint64 amount, uint256 price);
    
    event buy_order_event(address indexed buyer_address,
        uint64 amount, uint256 price);

    event buy_event(address indexed seller_address, address indexed buyer_address, 
        uint64 amount, uint256 price);

    event trading_status_changed(bool indexed new_status);

    event minted( uint8 trading_period_length, uint8 target_reduction, uint256 indexed timestamp);

    function set_trading_open (bool _status) public only_owner {
        trading_open = _status;
        emit trading_status_changed(_status);
    }


    function get_trading_open () external view returns (bool){
        return trading_open;
    }


    function get_allowance (address _address) external view returns (uint64) {
        return allowance[_address];
    }


    function mint (address[] memory _pending_addresses, uint8 _trading_period_length, uint8 _target_reduction) external only_owner {
        uint64 total = 0;
        uint64 company_allowance = 0;
        for (uint i = 0; i < _pending_addresses.length; i++) {
            require(get_account_status(_pending_addresses[i]) == 2, "E3");
            company_allowance = get_account_base_year_emissions(_pending_addresses[i]);
            company_allowance = company_allowance - ((company_allowance * _target_reduction) / 100);
            company_allowance *= _trading_period_length;
            allowance[_pending_addresses[i]] += company_allowance;
            total += company_allowance;
        }
        uint64 spare_allowance = (total * 5) / 100;
        total += spare_allowance;
        allowance[msg.sender] += spare_allowance;
        total_allowance += total;
        set_trading_open(true);
        emit minted(_trading_period_length, _target_reduction, block.timestamp);
    }


    function create_sell_order (uint64 _amount, uint256 _price) external is_approved {
        require(trading_open, "E4");
        require(allowance[msg.sender] >= _amount, "E5");
        require(sell_orders[msg.sender] == 0, "E6");
        sell_orders[msg.sender] = keccak256(abi.encodePacked(_amount, _price));
        emit sell_order_event(msg.sender, _amount, _price);
    }


    function delete_sell_order () external {
        require(sell_orders[msg.sender] != 0);
        sell_orders[msg.sender] = 0;
        emit sell_order_event(msg.sender, 0, 0);
    }


    function buy (address payable _seller, uint64 _amount, uint64 _on_sale, uint256 _price) external payable is_approved {
        require(trading_open, "E4");
        require(keccak256(abi.encodePacked(_on_sale, _price)) == sell_orders[_seller], "E7");
        require(_amount <= _on_sale, "E8");
        require(msg.value >= (_amount * _price), "E9");

        allowance[_seller] -= _amount;
        allowance[msg.sender] += _amount;
        uint64 amount_left = _on_sale - _amount;

        if(amount_left == 0) {
            sell_orders[_seller] = 0;
            emit sell_order_event(_seller, amount_left, 0);
        } else {
            sell_orders[_seller] = keccak256(abi.encodePacked(amount_left, _price));
            emit sell_order_event(_seller, amount_left, _price);
        }

        emit buy_event(_seller, msg.sender, _amount, _price);

        (bool sent,) = _seller.call{value: msg.value}("");
        require(sent, "E10");
    }


    function create_buy_order (uint64 _amount, uint256 _price) external payable is_approved {
        require(trading_open, "E4");
        require(msg.value >= (_amount * _price), "E11");
        require(buy_orders[msg.sender] == 0, "E12");

        buy_orders[msg.sender] = keccak256(abi.encodePacked(_amount, _price));

        emit buy_order_event(msg.sender, _amount, _price);
    }


    function delete_buy_order (uint64 _amount, uint256 _price) external {
        require(keccak256(abi.encodePacked(_amount, _price)) == buy_orders[msg.sender], "E13");

        address payable to = payable(msg.sender);
        
        buy_orders[msg.sender] = 0;
        emit buy_order_event(msg.sender, 0, 0);

        (bool sent,) = to.call{value: (_amount * _price)}("");
        require(sent, "E10");
    }


    function sell (address _buyer, uint64 _amount, uint64 _on_request, uint256 _price) external is_approved {
        require(trading_open, "E4");
        require(keccak256(abi.encodePacked(_on_request, _price)) == buy_orders[_buyer], "E14");
        require(allowance[msg.sender] >= _amount, "E16");
        require(_amount <= _on_request, "E15");

        allowance[msg.sender] -= _amount;
        allowance[_buyer] += _amount;

        uint64 amount_left = _on_request - _amount;

        if(amount_left == 0) {
            buy_orders[_buyer] = 0;
            emit buy_order_event(_buyer, amount_left, 0);
        } else {
            buy_orders[_buyer] = keccak256(abi.encodePacked(amount_left, _price));
            emit buy_order_event(_buyer, amount_left, _price);
        }

        emit buy_event(msg.sender, _buyer, _amount, _price);

        address payable to = payable(msg.sender);
        (bool sent,) = to.call{value: (_amount * _price)}("");
        require(sent, "E10");
    }


    function get_balance() public view returns(uint) {
        return address(this).balance;
    }


    function withdraw_eth_after_trading_close () external only_owner {
        require(trading_open == false, "E17");
        address payable to = payable(msg.sender);
        (bool sent,) = to.call{value: get_balance()}("");
        require(sent, "E10");
    }

}