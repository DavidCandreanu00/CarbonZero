import React, { useState, useEffect, useContext } from 'react';
import {useNavigate} from 'react-router-dom';
import useMetaMask from './Metamask';
import { SmartContractContext } from '../App';
import { collection, orderBy, query, limit, onSnapshot } from "firebase/firestore";
import {db} from '../firebase'
import bigInt from 'big-integer'; 
import '../style/Dashboard.css';

const Dashboard = () => {

const [first_render, set_first_render] = useState(true);
const [all_transactions, set_all_transactions] = useState([]);
const [accounts_list, set_accounts_list] = useState([]);

const [transactions_loaded, set_transactions_loaded] = useState(false);

const {account} = useMetaMask();
const { dashboard_account_list_loaded, dashboard_account_list } = useContext(SmartContractContext);
const navigate = useNavigate();
	
const wei = bigInt(1000000000000000000n);

useEffect(() => {
	if (first_render) {
	set_first_render(false)
	} else {
	navigate('/');
	}
}, [account]);

useEffect(() => {
	set_accounts_list(dashboard_account_list);
}, [dashboard_account_list]);


useEffect(() => {
	console.log(accounts_list);
}, [accounts_list]);

useEffect(() => {
	if (!dashboard_account_list_loaded) return;

	const updated_list = dashboard_account_list.map((obj) => {
		const involved_trans = all_transactions.filter(
			(trans) => trans.seller_address === obj.address || trans.buyer_address === obj.address
		);
		
		return { ...obj, transactions: involved_trans };
	});

	set_accounts_list(updated_list);
}, [all_transactions, dashboard_account_list, dashboard_account_list_loaded]);


//Fetch all trades
	
const fetch_transactions = () => {
	const collectionRef = collection(db, 'transactions');
	const orderedQuery = query(collectionRef, orderBy('log_order', 'desc'));
		
	const unsubscribe = onSnapshot(orderedQuery, (querySnapshot) => {
	const data_list = querySnapshot.docs
		.map((doc) => ({ id: doc.id, ...doc.data() }));
	set_all_transactions(data_list);
	set_transactions_loaded(true);
	});
		
		// Return the unsubscribe function in case you need to stop listening to updates later
return unsubscribe;
};

useEffect(()=>{
	const transactions_unsubscribe = fetch_transactions();

	return (() => {
		transactions_unsubscribe();
	});
}, [])

if (!dashboard_account_list_loaded && !transactions_loaded) {
	return (
	<section className="todo-container">
		<div className="todo">
			<h1 className="header">
			Loading...
			</h1>
		</div>
	</section>
	);
} else {
	if (accounts_list.length > 0) {
	return (
		<section className="todo-container">
			<h1 id="dashboard_title">
			Active carbon trading companies:  
			</h1>
			<div className="todo">
			{accounts_list.map((account, id) => (
				<div key={id} className="company_div">
				<div className='company_details' id="details_left">
					<h2 className="make_orange">Company name:</h2>
					<p className='details'><b>{account.name}</b></p>
					<h3 className="make_light_gray">Trading allowance:</h3>
					<p className='details'><span className="make_orange">{account.allowance}</span> CX</p>
					<h3 className="make_light_gray">Base-year emissions:</h3>
					<p className='details'><span className="make_orange">{account.emissions}</span> tonnes of CO2</p>
					<h3 className="make_light_gray">Blockchain address:</h3>
					<p className='details'>{account.address.slice(0, 8) + "..." + account.address.slice(-6)}</p>
					<h3 className="make_light_gray">Description:</h3>
					<p className='details'>{account.description}</p>
					<h3 className="make_light_gray">Activity domain:</h3>
					<p className='details'>{account.domain}</p>
				</div>
				<div className='company_details'>
					<h2 className="make_light_gray">Transactions made (newest first):</h2>
					<div className='transactions' id="details_right">
					{account.transactions && account.transactions.map((trans, id) => (
						<div key={id}>
						{trans.seller_address == account.address ? (
							<p>
							<span className="make_blue">{trans.seller_address.slice(0, 8) + "..." + trans.seller_address.slice(-6)}</span> sold <span className="make_orange">{trans.amount}</span> <b>CX</b>
							at <span className="make_orange">{bigInt(trans.price)/wei}</span> <b>ETH</b> to {trans.buyer_address.slice(0, 8) + "..." + trans.buyer_address.slice(-6)}
							</p>
							) : (
							<p>
							{trans.seller_address.slice(0, 8) + "..." + trans.seller_address.slice(-6)} sold <span className="make_orange">{trans.amount}</span> <b>CX</b>
						at <span className="make_orange">{bigInt(trans.price)/wei}</span> <b>ETH</b> to <span className="make_blue">{trans.buyer_address.slice(0, 8) + "..." + trans.buyer_address.slice(-6)}</span>
						</p> 
						)}
					</div>
					))}
					</div>
				</div>
				</div>
			))}
			</div>
		</section>
	);
	} else {
	return (
		<section className="todo-container">
			<div className="todo">
				<h1 className="header">
				
				</h1>
			</div>
		</section>
	);
	}
}
};

export default Dashboard;