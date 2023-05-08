const TradingPlatform = artifacts.require("TradingPlatform");

contract("TradingPlatform", async accounts => {
		it("Does not allow non-owner to change sign up status - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.set_account_status(accounts[1], 2,
					{ from: accounts[2] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non permitted operation");
		});

		it("Does not allow non-owner to change sign up status - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.set_account_status(accounts[1], 0,
					{ from: accounts[3] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non permitted operation");
		});

		it("Does not allow non-owner to change sign up status - 3", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.set_account_status(accounts[0], 0,
					{ from: accounts[2] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non permitted operation");
		});

		it("Request access function sets the company details correctly - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.request_access('cid', 9999999,
					{ from: accounts[2] });

			const new_cid = await tp_contract.get_account_cid(accounts[2]);
			const new_emissions = await tp_contract.get_account_base_year_emissions(accounts[2]);
			const new_status = await tp_contract.get_account_status(accounts[2]);

			assert.equal((new_cid, new_emissions, new_status), ('cid', 9999999, 1));
		});

		it("Request access function sets the company details correctly - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.request_access('xxxxxxxxxxxxxxxxx', 59876,
					{ from: accounts[1] });

			const new_cid = await tp_contract.get_account_cid(accounts[1]);
			const new_emissions = await tp_contract.get_account_base_year_emissions(accounts[1]);
			const new_status = await tp_contract.get_account_status(accounts[1]);

			assert.equal((new_cid, new_emissions, new_status), ('xxxxxxxxxxxxxxxxx', 59876, 1));
		});

		it("Request access function sets the company details correctly - 3", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.request_access('', 10000,
					{ from: accounts[3] });

			const new_cid = await tp_contract.get_account_cid(accounts[3]);
			const new_emissions = await tp_contract.get_account_base_year_emissions(accounts[3]);
			const new_status = await tp_contract.get_account_status(accounts[3]);

			assert.equal((new_cid, new_emissions, new_status), ('', 10000, 1));
		});

		it("Request access function sets the company details correctly - 4", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.request_access('test', 12345,
					{ from: accounts[4] });

			const new_cid = await tp_contract.get_account_cid(accounts[4]);
			const new_emissions = await tp_contract.get_account_base_year_emissions(accounts[4]);
			const new_status = await tp_contract.get_account_status(accounts[4]);

			assert.equal((new_cid, new_emissions, new_status), ('test', 12345, 1));
		});

		it("Status changed succesfully by owner - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_status(accounts[1], 0,
					{ from: accounts[0] });
			const status_check = await tp_contract.get_account_status(accounts[1]);
			assert.equal(status_check, 0);
		});


		it("Status changed succesfully by owner - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_status(accounts[1], 2,
					{ from: accounts[0] });
			const status_check = await tp_contract.get_account_status(accounts[1]);
			assert.equal(status_check, 2);
		});

		it("Status changed succesfully by owner - 3", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_status(accounts[2], 0,
					{ from: accounts[0] });
			const status_check = await tp_contract.get_account_status(accounts[2]);
			assert.equal(status_check, 0);
		});

		it("Status changed succesfully by owner - 4", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_status(accounts[2], 2,
					{ from: accounts[0] });
			const status_check = await tp_contract.get_account_status(accounts[2]);
			assert.equal(status_check, 2);
		});

		it("Status changed succesfully by owner - 5", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_status(accounts[3], 2,
					{ from: accounts[0] });
			const status_check = await tp_contract.get_account_status(accounts[3]);
			assert.equal(status_check, 2);
		});

		it("Status changed succesfully by owner - 6", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_status(accounts[4], 2,
					{ from: accounts[0] });
			const status_check = await tp_contract.get_account_status(accounts[4]);
			assert.equal(status_check, 2);
		});

		it("Sets account cid succsesfully - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_cid(accounts[2], 'test',
					{ from: accounts[2] });
			const status_check = await tp_contract.get_account_cid(accounts[2]);
			assert.equal(status_check, 'test');
		});

		it("Sets account cid succsesfully - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_cid(accounts[1], '',
					{ from: accounts[1] });
			const status_check = await tp_contract.get_account_cid(accounts[1]);
			assert.equal(status_check, '');
		});

		it("Does not allow cid change for different address - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.set_account_cid(accounts[1], '',
						{ from: accounts[0] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non permitted operation");
		});

		it("Does not allow cid change for different address - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.set_account_cid(accounts[0], 'xxxxxxxxxxxxx',
						{ from: accounts[2] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non permitted operation");
		});

		it("Does not allow to delete account for different address - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.delete_account(accounts[2], 
						{ from: accounts[0] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non permitted operation");
		});

		it("Does not allow to delete account for different address - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.delete_account(accounts[1], 
						{ from: accounts[2] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non permitted operation");
		});

		it("Deletes account succsesfully - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.delete_account(accounts[5], 
					{ from: accounts[5] });
			const status_check = await tp_contract.get_account_status(accounts[5]);
			assert.equal(status_check, 0);
		});

		it("Deletes account succsesfully - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_status(accounts[6], 2,
				{ from: accounts[0] });

			await tp_contract.delete_account(accounts[6], 
					{ from: accounts[6] });
			const status_check = await tp_contract.get_account_status(accounts[6]);
			assert.equal(status_check, 0);
		});

		it("Deletes account succsesfully - 3", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_account_status(accounts[7], 1,
				{ from: accounts[0] });

			await tp_contract.delete_account(accounts[7], 
					{ from: accounts[7] });
			const status_check = await tp_contract.get_account_status(accounts[7]);
			assert.equal(status_check, 0);
		});

		it("Returns correct account status - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const status_check = await tp_contract.get_account_status(accounts[1]);
			assert.equal(status_check, 2);
		});

		it("Returns correct account status - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const status_check = await tp_contract.get_account_status(accounts[7]);
			assert.equal(status_check, 0);
		});

		it("Contract deployment assigns the correct status to owner.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const status_check = await tp_contract.get_account_status(accounts[0]);
			assert.equal(status_check, 3);
		});

		it("Trading period is closed before mint.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const status_check = await tp_contract.get_trading_open();
			assert.equal(status_check, false);
		});

		it("Mint sets the correct target reduction and trading period length.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const mint = await tp_contract.mint([accounts[1], accounts[2],
				accounts[3], accounts[4]], 5, 10,
				{ from: accounts[0] });

    		assert.equal((mint.logs[1].args.trading_period_length.toNumber(), mint.logs[1].args.target_reduction.toNumber()), (5, 10), 'Mint function did not assign the correct details.');
		});

		it("Trading period is open after mint.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const status_check = await tp_contract.get_trading_open();
			assert.equal(status_check, true);
		});

		it("Mint sets the correct company allowance - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const allowance = await tp_contract.get_allowance(accounts[1]);
			const base_emissions = await tp_contract.get_account_base_year_emissions(accounts[1]);

			assert.equal(allowance.toNumber(), (base_emissions - Math.floor((base_emissions * 10 / 100))) * 5);
		});

		it("Mint sets the correct company allowance - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const allowance = await tp_contract.get_allowance(accounts[2]);
			const base_emissions = await tp_contract.get_account_base_year_emissions(accounts[2]);

			assert.equal(allowance.toNumber(), (base_emissions - Math.floor((base_emissions * 10 / 100))) * 5);
		});

		it("Mint sets the correct company allowance - 3", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const allowance = await tp_contract.get_allowance(accounts[3]);
			const base_emissions = await tp_contract.get_account_base_year_emissions(accounts[3]);

			assert.equal(allowance.toNumber(), (base_emissions - Math.floor((base_emissions * 10 / 100))) * 5);
		});

		it("Mint sets the correct company allowance - 4", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const allowance = await tp_contract.get_allowance(accounts[4]);
			const base_emissions = await tp_contract.get_account_base_year_emissions(accounts[4]);

			assert.equal(allowance.toNumber(), (base_emissions - Math.floor((base_emissions * 10 / 100))) * 5);
		});

		it("Does not allow to place sell order for a higher amount than the current allowance - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_sell_order(1000000000, 1 , 
						{ from: accounts[1] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing sell order for more funds than available");
		});

		it("Does not allow to place sell order for a higher amount than the current allowance - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_sell_order(45001, 99999, 
						{ from: accounts[3] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing sell order for more funds than available");
		});

		it("Does not allow to place sell order for a higher amount than the current allowance - 3", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_sell_order(99999999999, 100321, 
						{ from: accounts[4] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing sell order for more funds than available");
		});

		it("Succesfully places sell order - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.create_sell_order(3000, 100, 
				{ from: accounts[1] });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price), (3000, 100), 'Sell order creation was unsuccesful');
		});

		it("Succesfully places sell order - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.create_sell_order(15000, 10, 
				{ from: accounts[2] });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber()), (15000, 10), 'Sell order creation was unsuccesful');
		});

		it("Succesfully places sell order - 3", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.create_sell_order(20, 2, 
				{ from: accounts[3] });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber()), (20, 2), 'Sell order creation was unsuccesful');
		});

		it("Succesfully places sell order - 4", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.create_sell_order(1000, 999999999999, 
				{ from: accounts[4] });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber()), (1000, 999999999999), 'Sell order creation was unsuccesful');
		});

		it("Does not allow unregistered users to place sell order.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_sell_order(30, 1.1, 
						{ from: accounts[7] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing sell order to unregistered user.");
		});

		it("Does not allow user to place sell order if they already have a sell order open.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_sell_order(30, 1.1, 
						{ from: accounts[1] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing sell order although user already had a sell order open.");
		});

		it("Succesfully deletes sell order - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.delete_sell_order(
				{ from: accounts[4] });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber()), (0, 0), 'Sell order deletion was unsuccesful');
		});

		it("Succesfully deletes sell order - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.delete_sell_order(
				{ from: accounts[3] });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber()), (0, 0), 'Sell order deletion was unsuccesful');
		});

		it("Does not allow to place buy order with less funds than amount * price - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_buy_order(100, 100, 
						{ from: accounts[4], value: 1 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing buy order with insuficient funds");
		});

		it("Does not allow to place buy order with less funds than amount * price - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_buy_order(100, 100, 
						{ from: accounts[4], value: 9999 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing buy order with insuficient funds");
		});

		it("Does not allow unregistered users to place buy order.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_buy_order(30, 1.1, 
						{ from: accounts[7], value: 9999 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing sell order to unregistered user.");
		});

		it("Succesfully places buy order - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.create_buy_order(100, 10, 
				{ from: accounts[1], value: 1000 });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber()), (100, 10), 'Buy order creation was unsuccesful');
		});

		it("Succesfully places buy order - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.create_buy_order(100000, 10000, 
				{ from: accounts[2], value: 1000000000 });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber()), (100000, 10000), 'Buy order creation was unsuccesful');
		});

		it("Succesfully places buy order - 3", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.create_buy_order(10, 100, 
				{ from: accounts[3], value: 1000 });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber()), (10, 100), 'Buy order creation was unsuccesful');
		});

		it("Does not allow user to place buy order if they already have a buy order open.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_buy_order(10, 10, 
						{ from: accounts[3], value: 100 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing buy order to user with open buy order.");
		});

		it("Does not allow user to place buy order if they already have a buy order open.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_buy_order(10, 10, 
						{ from: accounts[3], value: 100 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed placing buy order to user with open buy order.");
		});

		it("Does not allow user to delete buy orders with incorrect arguments.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.delete_buy_order(930, 3210, 
						{ from: accounts[3]});
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed deleting buy order with incorrect arguments.");
		});

		it("Succesfully deletes buy order.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			const sell = await tp_contract.delete_buy_order(10, 100, 
				{ from: accounts[3] });

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber()), (0, 0), 'Buy order deletion was unsuccesful');
		});

		it("Does not allow user to sell more tokens than they own - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.sell(accounts[2], 100000, 100000, 10000, 
						{ from: accounts[4]});
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed selling more than user owns.");
		});

		it("Does not allow user to sell more tokens than they own - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.sell(accounts[2], 99999, 100000, 10000, 
						{ from: accounts[3]});
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed selling more than user owns.");
		});

		it("Does not allow user to sell with incorrect arguments - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.sell(accounts[2], 100, 100000, 12, 
						{ from: accounts[3]});
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed selling with incorrect arguments.");
		});

		it("Does not allow user to sell with incorrect arguments - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.sell(accounts[3], 10, 123, 123, 
						{ from: accounts[1]});
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed selling with incorrect arguments.");
		});

		it("Succesfully fulfills partial sell - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();

			const allowance_seller_before = await tp_contract.get_allowance(accounts[3]);
			const allowance_buyer_before = await tp_contract.get_allowance(accounts[2]);

			const sell = await tp_contract.sell(accounts[2], 10, 100000, 10000, 
				{ from: accounts[3] });

			const allowance_seller_after = await tp_contract.get_allowance(accounts[3]);
			const allowance_buyer_after = await tp_contract.get_allowance(accounts[2]);

			const difference_seller = allowance_seller_after - allowance_seller_before;
			const difference_buyer = allowance_buyer_after - allowance_buyer_before;

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber(),
			difference_seller, difference_buyer),
			(100000 - 10, 10000, -10, 10));
		});

		it("Succesfully fulfills partial sell - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();

			const allowance_seller_before = await tp_contract.get_allowance(accounts[3]);
			const allowance_buyer_before = await tp_contract.get_allowance(accounts[2]);

			const sell = await tp_contract.sell(accounts[2], 90, 99990, 10000, 
				{ from: accounts[3] });

			const allowance_seller_after = await tp_contract.get_allowance(accounts[3]);
			const allowance_buyer_after = await tp_contract.get_allowance(accounts[2]);

			const difference_seller = allowance_seller_after - allowance_seller_before;
			const difference_buyer = allowance_buyer_after - allowance_buyer_before;

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber(),
			difference_seller, difference_buyer),
			(99990 - 90, 10000, -90, 90));
		});

		it("Does not allow non-registered user to sell.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.sell(accounts[2], 90, 99900, 10000, 
					{ from: accounts[8] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non-registered user to sell.");
		});

		it("Does not allow owner to sell.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.sell(accounts[2], 90, 99900, 10000, 
					{ from: accounts[0] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non-registered user to sell.");
		});

		it("Succesfully fulfills total sell - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();

			const allowance_seller_before = await tp_contract.get_allowance(accounts[1]);
			const allowance_buyer_before = await tp_contract.get_allowance(accounts[2]);

			const sell = await tp_contract.sell(accounts[2], 99900, 99900, 10000, 
				{ from: accounts[1] });

			const allowance_seller_after = await tp_contract.get_allowance(accounts[1]);
			const allowance_buyer_after = await tp_contract.get_allowance(accounts[2]);

			const difference_seller = allowance_seller_after - allowance_seller_before;
			const difference_buyer = allowance_buyer_after - allowance_buyer_before;

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber(),
			difference_seller, difference_buyer),
			(0, 0, -99900, 99900));
		});

		it("Succesfully fulfills total sell - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();

			const allowance_seller_before = await tp_contract.get_allowance(accounts[3]);
			const allowance_buyer_before = await tp_contract.get_allowance(accounts[1]);

			const sell = await tp_contract.sell(accounts[1], 100, 100, 10, 
				{ from: accounts[3] });

			const allowance_seller_after = await tp_contract.get_allowance(accounts[3]);
			const allowance_buyer_after = await tp_contract.get_allowance(accounts[1]);

			const difference_seller = allowance_seller_after - allowance_seller_before;
			const difference_buyer = allowance_buyer_after - allowance_buyer_before;

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber(),
			difference_seller, difference_buyer),
			(0, 0, -100, 100));
		});

		it("Does not allow non-registered user to buy.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.buy(accounts[2], 1, 3000, 100, 
					{ from: accounts[8], value: 100 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non-registered user to buy.");
		});

		it("Does not allow owner user to buy.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.buy(accounts[2], 1, 3000, 100, 
					{ from: accounts[0], value: 100 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed non-registered user to buy.");
		});

		it("Does not allow user to buy with incorrect arguments - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.buy(accounts[1], 1, 1, 1, 
						{ from: accounts[2], value: 1 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed buying with incorrect arguments.");
		});

		it("Does not allow user to buy with incorrect arguments - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.buy(accounts[1], 3001, 3000, 100, 
						{ from: accounts[2], value:  300100});
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed buying with incorrect arguments.");
		});

		it("Does not allow user to buy when funds are not enough for seller's request - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.buy(accounts[1], 100, 3000, 100, 
						{ from: accounts[2], value:  1});
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed buying with too little funds.");
		});

		it("Does not allow user to buy when funds are not enough for seller's request - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.buy(accounts[2], 100, 15000, 10, 
						{ from: accounts[1], value:  100});
			} catch (error) {
				assert;
				return;
			}
			assert.fail("Contract allowed buying with too little funds.");
		});

		it("Succesfully fulfills partial buy - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();

			const allowance_seller_before = await tp_contract.get_allowance(accounts[2]);
			const allowance_buyer_before = await tp_contract.get_allowance(accounts[1]);

			const sell = await tp_contract.buy(accounts[2], 100, 15000, 10, 
				{ from: accounts[1], value:  1000});

			const allowance_seller_after = await tp_contract.get_allowance(accounts[2]);
			const allowance_buyer_after = await tp_contract.get_allowance(accounts[1]);

			const difference_seller = allowance_seller_after - allowance_seller_before;
			const difference_buyer = allowance_buyer_after - allowance_buyer_before;

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber(),
			difference_seller, difference_buyer),
			(15000 - 100, 10, -100, 100));
		});

		it("Succesfully fulfills partial buy - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();

			const allowance_seller_before = await tp_contract.get_allowance(accounts[2]);
			const allowance_buyer_before = await tp_contract.get_allowance(accounts[1]);

			const sell = await tp_contract.buy(accounts[2], 1000, 14900, 10, 
				{ from: accounts[1], value:  10000});

			const allowance_seller_after = await tp_contract.get_allowance(accounts[2]);
			const allowance_buyer_after = await tp_contract.get_allowance(accounts[1]);

			const difference_seller = allowance_seller_after - allowance_seller_before;
			const difference_buyer = allowance_buyer_after - allowance_buyer_before;

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber(),
			difference_seller, difference_buyer),
			(14900 - 1000, 10, -1000, 1000));
		});

		it("Succesfully fulfills partial buy - 3", async () => {
			const tp_contract = await TradingPlatform.deployed();

			const allowance_seller_before = await tp_contract.get_allowance(accounts[2]);
			const allowance_buyer_before = await tp_contract.get_allowance(accounts[1]);

			const sell = await tp_contract.buy(accounts[2], 10000, 13900, 10, 
				{ from: accounts[1], value:  100000});

			const allowance_seller_after = await tp_contract.get_allowance(accounts[2]);
			const allowance_buyer_after = await tp_contract.get_allowance(accounts[1]);

			const difference_seller = allowance_seller_after - allowance_seller_before;
			const difference_buyer = allowance_buyer_after - allowance_buyer_before;

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber(),
			difference_seller, difference_buyer),
			(13900 - 10000, 10, -10000, 10000));
		});

		it("Succesfully fulfills total buy - 1", async () => {
			const tp_contract = await TradingPlatform.deployed();

			const allowance_seller_before = await tp_contract.get_allowance(accounts[2]);
			const allowance_buyer_before = await tp_contract.get_allowance(accounts[1]);

			const sell = await tp_contract.buy(accounts[2], 3900, 3900, 10, 
				{ from: accounts[1], value:  39000});

			const allowance_seller_after = await tp_contract.get_allowance(accounts[2]);
			const allowance_buyer_after = await tp_contract.get_allowance(accounts[1]);

			const difference_seller = allowance_seller_after - allowance_seller_before;
			const difference_buyer = allowance_buyer_after - allowance_buyer_before;

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber(),
			difference_seller, difference_buyer),
			(0, 0, -3900, 3900));
		});

		it("Succesfully fulfills total buy - 2", async () => {
			const tp_contract = await TradingPlatform.deployed();

			const allowance_seller_before = await tp_contract.get_allowance(accounts[1]);
			const allowance_buyer_before = await tp_contract.get_allowance(accounts[3]);

			const sell = await tp_contract.buy(accounts[1], 3000, 3000, 100, 
				{ from: accounts[3], value:  300000});

			const allowance_seller_after = await tp_contract.get_allowance(accounts[1]);
			const allowance_buyer_after = await tp_contract.get_allowance(accounts[3]);

			const difference_seller = allowance_seller_after - allowance_seller_before;
			const difference_buyer = allowance_buyer_after - allowance_buyer_before;

    		assert.equal((sell.logs[0].args.amount.toNumber(), sell.logs[0].args.price.toNumber(),
			difference_seller, difference_buyer),
			(0, 0, -3000, 3000));
		});
		
		it("Does not allow non-owner to modify the trading period open condition.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.set_trading_open(false, 
						{ from: accounts[1]});
			} catch (error) {
				assert;
				return;
			}
			assert.fail();
		});

		it("Owner succesfully modifies the trading period open condition.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			await tp_contract.set_trading_open(false, 
				{ from: accounts[0]});
			const trading_open = await tp_contract.get_trading_open();
			assert.equal(trading_open, false);
		});

		it("Does not allow user to place buy order if trading is closed.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_buy_order(10, 10, 
						{ from: accounts[3], value: 100 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail();
		});

		it("Does not allow user to place sell order if trading is closed.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.create_sell_order(10, 10, 
						{ from: accounts[3] });
			} catch (error) {
				assert;
				return;
			}
			assert.fail();
		});

		it("Does not allow user to buy if trading is closed.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.buy(accounts[1], 1, 10, 10, 
						{ from: accounts[3], value: 100 });
			} catch (error) {
				assert;
				return;
			}
			assert.fail();
		});

		it("Does not allow user to sell if trading is closed.", async () => {
			const tp_contract = await TradingPlatform.deployed();
			try {
				await tp_contract.buy(accounts[3], 1, 10, 10, 
						{ from: accounts[1]});
			} catch (error) {
				assert;
				return;
			}
			assert.fail();
		});
});