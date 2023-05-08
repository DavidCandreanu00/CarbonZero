import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import React, {useState, useEffect, useContext} from 'react';
import TradingPlatform from './components/TradingPlatform';
import Navbar from './components/Navbar';
import Admin from './components/Admin';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Guide from './components/Guide';
import MetamaskLogin from './components/MetamaskLogin';
import useMetaMask from './components/Metamask';
import { collection, getDocs, query, where } from "firebase/firestore";
import {db} from './firebase'
import all from 'it-all'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { projectId, projectSecret } from './components/constants';
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { create as ipfsHttpClient } from "ipfs-http-client";

export const SmartContractContext = React.createContext();

function NewSmartContractProvider({ children }) {
const {library, account, trading_platform_contract} = useMetaMask();
const [pending_accounts_list, set_pending_accounts_list] = useState([]);
const [pending_accounts_list_loaded, set_pending_accounts_list_loaded] = useState(false);
const [dashboard_account_list, set_dashboard_account_list] = useState([]);
const [dashboard_account_list_loaded, set_dashboard_account_list_loaded] = useState(false);
const [account_status, set_account_status] = useState(0);
const [account_status_loaded, set_account_status_loaded] = useState(false);
const [company_cid, set_company_cid] = useState('');
const [company_emissions, set_company_emissions] = useState(0);
const [company_allowance, set_company_allowance] = useState(0);
const [trading_open, set_trading_open] = useState(false);
const [trading_open_loaded, set_trading_open_loaded] = useState(false);


const load_status_and_details = async () => {
	const status = await trading_platform_contract.methods.get_account_status(account).call();
	const cid = await trading_platform_contract.methods.get_account_cid(account).call();
	const ems = await trading_platform_contract.methods.get_account_base_year_emissions(account).call();
	const allowance = await trading_platform_contract.methods.get_allowance(account).call();
	set_account_status(status);
	set_company_cid(cid);
	set_company_emissions(ems);
	set_company_allowance(allowance);
	set_account_status_loaded(true);
};

// We update our trading_open hook with the current trading status
// from the Blockchain.
const get_trading_status = async () => {
	const status = await trading_platform_contract.methods.get_trading_open().call();
	set_trading_open(status);
	set_trading_open_loaded(true);
};

//This is where we listen to trading_open_events
//also get new allowance that was given to companies

useEffect(() => {
	const event = trading_platform_contract.events.trading_status_changed();

	const handledEvents = new Set();

	const handleData = async (event) => {
		if (!handledEvents.has(event.id)) {
			handledEvents.add(event.id);
			set_trading_open_loaded(false);

			console.log('Event data:', event.returnValues);
			const new_status = event.returnValues.new_status;

			set_trading_open(new_status);

			if (new_status) {
				const updated_company_allowance = await trading_platform_contract.methods.get_allowance(account).call();
				set_company_allowance(updated_company_allowance);

				// We fetch a list of all addresses that are permitted to trade
				// (they have status == 2) from Firestore.

				const fetch_statuses = async () => {
					const collectionRef = collection(db, 'status_changes');
					const orderedQuery = query(collectionRef, where('status', '==', 2));
					return getDocs(orderedQuery)
					.then((querySnapshot)=>{              
						const data_list = querySnapshot.docs
						.map((doc) => ({id: doc.id, ...doc.data(), })); 
						const address_list = []; 
						data_list.forEach((item) => {
							address_list.push(item.address);
						})
						return address_list;
					})
				}

				// We use batching to get the new trading allowance
				// for each of the addresses in address_list, and
				// update our hooks.
		
				fetch_statuses().then(async (addresses) => {
					const acc_updated_allowances = [];
					const batch = new library.BatchRequest();
					
					addresses.forEach(async (address) => {
						const method_allowance = trading_platform_contract.methods.get_allowance(address);
						batch.add(method_allowance.call.request({}, function(error, result) {
							if (!error) {
								acc_updated_allowances.push(result);
								checkDone();
							}
						}));
					});
					batch.execute();

					async function checkDone() {
						if (acc_updated_allowances.length === addresses.length) {
							for (let i = 0 ; i < addresses.length; i++) {
								set_dashboard_account_list(prevArray => prevArray.map(obj => obj.address === addresses[i] ? {...obj, allowance: acc_updated_allowances[i]} : obj));
							}
						}
					}
			});
			}
			set_trading_open_loaded(true);
		}
	};

	const handleError = (error) => {
		console.error('Error:', error);
	};

	event.on('data', handleData);
	event.on('error', handleError);

	return () => {
		event.off('data', handleData);
		event.off('error', handleError);
	};
}, [account, pending_accounts_list, dashboard_account_list, trading_open]);


// Listener for transaction event
// On every transaction event, we update the list of transactions
// hook inside the Dashboard and the allowance of the 
// current user.

useEffect(() => {
	const event = trading_platform_contract.events.buy_event();

	const handledEvents = new Set();

	const handleData = async (event) => {
	if (!handledEvents.has(event.id)) {
		handledEvents.add(event.id);

		console.log('Event data:', event.returnValues);
		const seller = event.returnValues.seller_address;
		const buyer = event.returnValues.buyer_address;
		const amount = event.returnValues.amount;
		const price = event.returnValues.price;

		if (account == seller) {
			set_company_allowance(Number(company_allowance) - Number(amount));
		} else if (account == buyer) {
			set_company_allowance(Number(company_allowance) + Number(amount));
		}

		const updated_dashboard_account_list = dashboard_account_list.map(obj => {
			if (obj.address === seller) {
				return { ...obj, allowance: Number(obj.allowance) - Number(amount) };
			} else if (obj.address === buyer) {
				return { ...obj, allowance: Number(obj.allowance) + Number(amount) };
			} else {
				return obj;
			}
		});
	
		set_dashboard_account_list(updated_dashboard_account_list);
	}
	};

	const handleError = (error) => {
	console.error('Error:', error);
	};

	event.on('data', handleData);
	event.on('error', handleError);

	return () => {
	event.off('data', handleData);
	event.off('error', handleError);
	};
}, [account, dashboard_account_list, company_allowance,set_dashboard_account_list]);


// We load the list of Trading addresses and Pending addresses

// We use the list of Trading addresses to build the Active Companies (Dashboard)
// page.

// We use the list of Pending addresses to build the Admin Dashboard, only visible
// to the Admin user.

// We fetch both lists of addresses from Firestore.

// This function will be called when the App.js page renders.


const load_list = async (set_target_list, set_target_list_loaded, target_status) => {
	const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

	const ipfs_instance = ipfsHttpClient({
		url: "https://ipfs.infura.io:5001/api/v0",
		headers:{
			authorization
		}
	});
	
	const fetch_statuses = async () => {
		const collectionRef = collection(db, 'status_changes');
		const orderedQuery = query(collectionRef, where('status', '==', target_status));
		
		return getDocs(orderedQuery)
			.then((querySnapshot)=>{              
			const data_list = querySnapshot.docs
				.map((doc) => ({id: doc.id, ...doc.data(), })); 
			const address_list = []; 
			data_list.forEach((item) => {
				address_list.push(item.address);
			})
			return address_list;
		})
	}

	fetch_statuses().then(async (addresses) => {
		const acc_details_list = [];
		const batch = new library.BatchRequest();
		
		addresses.forEach(async (address) => {
			const method_cid = trading_platform_contract.methods.get_account_cid(address);
			const method_ems = trading_platform_contract.methods.get_account_base_year_emissions(address);
			const method_allowance = trading_platform_contract.methods.get_allowance(address);
			batch.add(method_cid.call.request({}, function(error, result) {
			if (!error) {
				acc_details_list.push(result);
				checkDone();
			}
			}));
			batch.add(method_ems.call.request({}, function(error, result) {
			if (!error) {
				acc_details_list.push(result);
				checkDone();
			}
			}));
			batch.add(method_allowance.call.request({}, function(error, result) {
			if (!error) {
				acc_details_list.push(result);
				checkDone();
			}
		}));
	});
	batch.execute();

	async function checkDone() {
		if (acc_details_list.length === addresses.length * 3) {
		const account_json_list = [];
		for (let i = 0 ; i < addresses.length; i++) {
			const data = uint8ArrayConcat(await all(ipfs_instance.cat(acc_details_list[i * 3])))
			const company_json = JSON.parse(uint8ArrayToString(data))
			company_json.address = addresses[i];
			company_json.emissions = acc_details_list[i * 3 + 1];
			company_json.allowance = acc_details_list[i * 3 + 2];
			account_json_list.push(company_json);
			set_target_list([...account_json_list]);
		}
		}
	}
	}).catch(console.error);
	set_target_list_loaded(true);
};

// This is where we listen to the status changed event

// If the status of the logged user was changed to 2,
// we fetch their data from IPFS and update the
// Profile page.

useEffect(() => {
	const event = trading_platform_contract.events.status_change();

	const handledEvents = new Set();

	const handleData = async (event) => {
	if (!handledEvents.has(event.id)) {
		handledEvents.add(event.id);

		console.log('Event data:', event.returnValues);
		const target_address = event.returnValues.target_address;
		const target_status = event.returnValues.status;

		if (account == target_address) {
			set_account_status(target_status);
		}

		const new_pending_accounts_list = pending_accounts_list.filter(obj => obj.address !== target_address);
		set_pending_accounts_list(new_pending_accounts_list);
		const new_dashboard_account_list = dashboard_account_list.filter(obj => obj.address !== target_address);
		set_dashboard_account_list(new_dashboard_account_list);

		if(target_status == 1 || target_status == 2) {
		const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

		const ipfs_instance = ipfsHttpClient({
			url: "https://ipfs.infura.io:5001/api/v0",
			headers:{
			authorization
			}
		});

		const company_emissions = await trading_platform_contract.methods.get_account_base_year_emissions(target_address).call();
		const company_cid = await trading_platform_contract.methods.get_account_cid(target_address).call();
		const company_allowance = await trading_platform_contract.methods.get_allowance(target_address).call();
		const data = uint8ArrayConcat(await all(ipfs_instance.cat(company_cid)));
		const company_json = JSON.parse(uint8ArrayToString(data))
		
		company_json.address = target_address;
		company_json.emissions = company_emissions;
		company_json.allowance = company_allowance;

		if (target_status == 1) {
			set_pending_accounts_list([...pending_accounts_list, company_json]);
		} else if (target_status == 2) {
			set_dashboard_account_list([...dashboard_account_list, company_json]);
		}
		}
	}
	};

	const handleError = (error) => {
	console.error('Error:', error);
	};

	event.on('data', handleData);
	event.on('error', handleError);

	return () => {
	event.off('data', handleData);
	event.off('error', handleError);
	};
}, [account, pending_accounts_list, dashboard_account_list]);

useEffect(() => {
	get_trading_status();
	load_status_and_details();
	load_list(set_dashboard_account_list, set_dashboard_account_list_loaded, 2);
	load_list(set_pending_accounts_list, set_pending_accounts_list_loaded, 1);
}, [account])

const value = {account_status, company_cid, company_emissions,company_allowance, account_status_loaded,
	dashboard_account_list_loaded, dashboard_account_list,
	pending_accounts_list, pending_accounts_list_loaded,
	trading_open, trading_open_loaded};

return <SmartContractContext.Provider value={value}>{children}</SmartContractContext.Provider>;
}

function App() {

const { connect, isActive, account, trading_platform_contract, shouldDisable } = useMetaMask();

return (
	<div id="app_page">
	{isActive ? (
	<NewSmartContractProvider>
		<Router>
		<Navbar/>
		<div className="App">
		<Routes>
			<Route exact path="/" element={<Dashboard/>} />
			<Route path="/admin" element={<Admin/>} />
			<Route path="/trading_platform" element={<TradingPlatform/>} />
			<Route path="/profile" element={<Profile/>} />
			<Route path="/guide" element={<Guide/>} />
		</Routes>
		</div>
		<div className='footer_parent'>
			<footer id="footer">
			<span id="con_acc">Connected Account: </span>
			<span id="eth_address">{ isActive ? account : '' }</span>
			</footer>
		</div>
		</Router>
	</NewSmartContractProvider>) : (
		<div>
		<MetamaskLogin connect={connect} shouldDisable={shouldDisable} isActive={isActive}/>
		</div>
	)}
	</div>
);
}

export default App;
