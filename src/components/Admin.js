import React, { useState, useEffect, useContext } from 'react';
import {useNavigate} from 'react-router-dom';
import useMetaMask from './Metamask';
import {adminAddress} from './constants';
import { SmartContractContext } from '../App';
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import {db} from '../firebase'
import '../style/Dashboard.css';
import { toHaveDescription } from '@testing-library/jest-dom/dist/matchers';

const Admin = () => {

  const [first_render, set_first_render] = useState(true);
  const [trading_period_length, set_trading_period_length] = useState(0);
  const [target_reduction, set_target_reduction] = useState(0);

  const [timestamp, set_timestamp] = useState(0);
  const [current_target_reduction, set_current_target_reduction] = useState(0);
  const [current_trading_period_length, set_current_trading_period_length] = useState(0);
  const [mint_date, set_mint_date] = useState(new Date());
  const [year_difference, set_year_difference] = useState(0);
  const [month_difference, set_month_difference] = useState(0);
  const [day_difference, set_day_difference] = useState(0);

  const { account, trading_platform_contract} = useMetaMask();
  const { trading_open, trading_open_loaded, pending_accounts_list, pending_accounts_list_loaded } = useContext(SmartContractContext);

  const navigate = useNavigate();
    
  useEffect(() => {
    if (first_render) {
      set_first_render(false)
    } else {
      navigate('/');
    }
  }, [account]);

  useEffect(() => {
    console.log(timestamp);
    const timestamp_date = new Date(timestamp * 1000);
    //code to calculate difference between today and timestamp date was taken from here: https://stackoverflow.com/questions/7763327/how-to-calculate-date-difference-in-javascript
    const today = new Date();
    const diff = new Date(today.getTime() - timestamp_date.getTime());
    set_year_difference(diff.getUTCFullYear() - 1970);
    set_month_difference(diff.getUTCMonth());
    set_day_difference(diff.getUTCDate() - 1);
    set_mint_date(timestamp_date)
  }, [timestamp]);

  useEffect(() => {
    const collectionRef = collection(db, 'mints');
    const orderedQuery = query(collectionRef, orderBy('timestamp', 'desc'), limit(1));
    getDocs(orderedQuery).then((querySnapshot)=>{ 
      if (querySnapshot.size !== 0) {
        const data_list = querySnapshot.docs
          .map((doc) => ({id: doc.id, ...doc.data(), }));
        set_timestamp(data_list[0].timestamp);
        set_current_target_reduction(data_list[0].target_reduction);
        set_current_trading_period_length(data_list[0].trading_period_length);
      }             
    })
  }, [trading_open]);

  const approve_account = async (account_address) => {
    const status = await trading_platform_contract.methods.set_account_status(account_address, 2).send({ from: account })
  }

  const decline_account = async (account_address) => {
    const status = await trading_platform_contract.methods.set_account_status(account_address, 0).send({ from: account })
  }

  async function call_minting_function(e) {
    e.preventDefault();

    if (trading_period_length === '' || target_reduction === '')
    {
      window.alert('Please fill in all fields!');
    } else if (isNaN(trading_period_length) || trading_period_length <= 0 || trading_period_length % 1 !== 0) {
      window.alert('The trading period length needs to be a valid integer greater than 0!');
    } else if (isNaN(target_reduction) || target_reduction <= 0 || target_reduction % 1 !== 0 || target_reduction >= 100) {
      window.alert('The target_reduction needs to be a valid integer greater than 0!');
    } else {
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
  
      fetch_statuses().then(async (addresses) => {
        await trading_platform_contract.methods.mint(addresses, trading_period_length, target_reduction).send({ from: account });
      });
    }
  }

  async function end_period(e) {
    e.preventDefault();
    await trading_platform_contract.methods.set_trading_open(false).send({ from: account });
  }

  //Old way to make requests (non batched)
  /*
  useEffect( () => {
    const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

    const ipfs_instance = ipfsHttpClient({
      url: "https://ipfs.infura.io:5001/api/v0",
      headers:{
        authorization
      }
    });
  
    const fetch_statuses = async () => {
      const collectionRef = collection(db, 'status_changes');
      const orderedQuery = query(collectionRef, where('status', '==', 1));
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
      const acc_list = [];
      addresses.forEach(async (address) => {
        const company_cid = await trading_platform_contract.methods.get_account_cid(address).call()
        const company_emissions = await trading_platform_contract.methods.get_account_base_year_emissions(address).call()
        const data = uint8ArrayConcat(await all(ipfs_instance.cat(company_cid)))
        const company_json = JSON.parse(uint8ArrayToString(data))
        company_json.address = address;
        company_json.emissions = company_emissions;
        acc_list.push(company_json);
        set_pending_accounts_list([...acc_list]);
      });
    }).catch(console.error);
    set_check_made(true);
  }, [checked_account])
  */

  if (account != adminAddress) {
    return (
      <h1 className="header">
        You need to be admin to access this page.
      </h1>
    )
  }

  return (
    <section className="todo-container">
      <div className="todo">
        {trading_open_loaded ? (
          <div className='mint_details'>
          {!trading_open ? (
          <>
            <h1 className='title_mint make_orange'>
              Start the new trading period
            </h1>
            <h3 className="text">
              Set a trading period length (years):
            </h3>
            <div>
              <input
                className='input_field_mint'
                type="text"
                placeholder="Trading period length"
                name="name"
                onChange={(e) => set_trading_period_length(e.target.value)} />
            </div>
            <h3 className="text">
                Set a target reduction percentage %:
            </h3>
            <div>
              <input
                className='input_field_mint'
                type="text"
                placeholder="Target reduction percentage (%)"
                name="description"
                onChange={(e) => set_target_reduction(e.target.value)} />
            </div>
            <div className="btn-container">
              <button
              type="submit"
              className="btn"
              onClick={call_minting_function}
              >
                Mint
              </button>
            </div>
          </>
          ) : (
          <>
            <h1 className="title_mint make_orange">
              Trading period details
            </h1>
            <h3 className='period_details'><span className="make_light_gray">Target reduction percentage: </span> <b><span className="make_blue">{current_target_reduction} %</span></b></h3>
            <h3 className='period_details'><span className="make_light_gray">Trading period length: </span> <b><span className="make_blue">{current_trading_period_length} years</span></b></h3>
            <h3 className='period_details'><span className="make_light_gray">Trading period start date: </span> <b><span className="make_blue">{(mint_date.getMonth() + 1).toString().padStart(2, 0) +"-" +mint_date.getDate().toString().padStart(2, 0) + "-" + mint_date.getFullYear().toString() + " at " + mint_date.getHours().toString() + ":" + mint_date.getMinutes().toString()}</span></b></h3>
            <h3 className='period_details'><span className="make_light_gray">Time elapsed since the trading period started: </span> <b><span className="make_blue">{year_difference} years, </span></b> <b><span className="make_blue">{month_difference} months and </span></b><b><span className="make_blue">{day_difference} days. </span></b></h3>
            <h2 className="title_mint" id="end_period_title">
              End the current trading period?
            </h2>
            <div className="btn-container">
              <button
              type="submit"
              className="btn_cancel"
              onClick={end_period}
              >
                End period
              </button>
            </div>
          </>
          )}
        </div>
      ) : (
        <h1 className="header_admin">Loading trading period management system...</h1>
      )}
      </div>
      <div className="todo">
        {!pending_accounts_list_loaded ? (
          <h1 className="header">Loading...</h1>
        ) : pending_accounts_list.length > 0 ? (
          pending_accounts_list.map((account, id) => (
            <div key={id} className="pending_company_div">
              <h2 id="company_name"><span className="make_orange">Company name: </span> <b>{account.name}</b></h2>
              <h3 className="make_light_gray">Blockchain address:</h3>
              <p className='detail'>{account.address}</p>
              <h3 className="make_light_gray">Description: </h3>
              <p className='detail'>{account.description}</p>
              <h3 className="make_light_gray">Activity domain: </h3>
              <p className='detail'>{account.domain}</p>
              <h3 className="make_light_gray">Base-year emissions:</h3>
              <p className='detail'>{account.emissions} tonnes of CO2</p>
              <div className='app_dec_btns'> 
                <div className='btn-container admin-btns'>
                  <button className="btn_cancel" id='left' onClick={() => decline_account(account.address)}>
                    Decline request
                  </button>
                </div>
                <div className='btn-container admin-btns'>
                  <button className="btn" id='right' onClick={() => approve_account(account.address)}>
                    Approve account
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <h1 className="header_admin">No pending accounts.</h1>
        )}
      </div>
    </section>
  );
};

export default Admin;