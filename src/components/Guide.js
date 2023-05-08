import React, { useState, useEffect, useContext } from 'react';
import {useNavigate} from 'react-router-dom';
import useMetaMask from './Metamask';
import '../style/Dashboard.css';

const Guide = () => {
const [first_render, set_first_render] = useState(true);

const {account} = useMetaMask();

const navigate = useNavigate();

useEffect(() => {
	if (first_render) {
		set_first_render(false)
	} else {
		navigate('/');
	}
}, [account]);


return (
	<section className="table_of_contents">
		<div className="instruction_div" id="page_title">
			<h1 className='heading_instructions'>Table of contents:</h1>
			<h3 className='link'><a href="#trading_platform_instructions" className='link'>1. How to use the Trading Platform?</a></h3>
			<h3 className='link'><a href="#sign_up_instructions" className='link'>2. How to Sign up for the Trading Platform?</a></h3>
			<h3 className='link'><a href="#dashboard_instructions" className='link'>3. How to use the Active companies dashboard?</a></h3>
		</div>

		<div className="instruction_div" id="trading_platform_instructions">
			<h1 className='heading_instructions'>How does the Trading Platform work?</h1>

			<hr></hr>

			<h3 className='subtitle'>Who can place trades?</h3>
			<p>Only users approved by the Admin can place trades.</p>

			<h3 className='subtitle'>When can you make trades?</h3>
			<p>Approved users can make trades when the trading period is open.</p>

			<h3 className='subtitle'>Types of trades</h3>
			<p>There are 2 types of trades: <b>Future orders</b> and <b>Spot orders</b>.</p>
			<p>If you place a Future order (either buy or sell), your order will be added to the order book.</p>
			<p>If you place a Spot order (either buy or sell), your order will be fulfilled from the available orders in the order book.</p>
			
			<h3 className='subtitle'>Can you have more than one Future trade open of the same type?</h3>
			<p>No, you can only have one Future trade open of the same type.</p>

			<h3 className='make_blue subtitle'>How to place a trade:</h3>
			<p>1. Head to the Trading Platform page.</p>
			<p>2. If you have an open order of the type you want to place, you need to close it first.</p>
			<p>3. Choose what type of order you want to place using the <b>selection switch</b>. </p>
			<p>4. Input the amount of <b>CX</b> tokens.</p>
			<p>5. If you are placing a <b>Future order</b>, input the <b>price</b> per token.</p>
			<p>6. Press the 'Submit' button.</p>
			<p>7. Follow the Metamask instructions to finish the trade.</p>

			<h3 className='make_blue subtitle'>How to close an open order:</h3>
			<p>1. Press 'Cancel ... order' for the order you want to cancel.</p>
			<p>2. Follow the Metamask instructions.</p>

			<h3 className='subtitle'>How can you see past trades in the system?</h3>
			<p>At the bottom of the page there is a log of the past 
				10 transactions made on the platform at any given time.</p>
		</div>

		<div className="instruction_div" id="sign_up_instructions">
			<h1 className='heading_instructions'>How to Sign up for the Trading Platform?</h1>

			<hr></hr>

			<h3 className='subtitle'>Who can Sign Up for the platform?</h3>
			<p>Anyone can request to Sign Up for the platform. However, the Admin will 
				only approve known users, with details shared in advance to 
				use the Trading System.</p>

			<h3 className='subtitle'>How to Sign Up?</h3>
			<p>1. Head to the Account page.</p>
			<p>2. Input all your Company details (Name, Description and Activity domain) in their 
				respective input fields.
			</p>
			<p>3. Input your Company's base-year emissions in the correct input field 
				(equal to the number of CO2 tonnes your company emits during a normal year).
			</p>
			<p>4. Press the Sign Up button.</p>
			<p>5. Follow the Metamask instructions to send the request.</p>
			<p>6. Wait for the Admin to grant you permission.</p>

		</div>

		<div className="instruction_div" id="dashboard_instructions">
			<h1 className='heading_instructions'>How to use the Active companies dashboard page?</h1>

			<hr></hr>

			<h3 className='subtitle'>What information can you find on the Active Companies dashboard?</h3>
			<p>On the Companies dashboard you can find information
				 such as company details, trading allowance and transactions made for all of the companies 
				 that are registered on the Trading Platform.</p>

			<h3 className='subtitle'>Where is this information coming from?</h3>
			<p>All of the information about the companies comes from the 
				Blockchain and IPFS.</p>

			<h3 className='subtitle'>How can you view a company's transactions?</h3>
			<p>Each company has a window of all past transactions, 
				ordered by <b>Newest first</b>. You can scroll inside 
				this window to see older transactions.</p>
		</div>
	</section>
	)
};

export default Guide;