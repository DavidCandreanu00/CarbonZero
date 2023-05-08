import React, { useState, useEffect, useContext } from 'react';
import {useNavigate} from 'react-router-dom';
import useMetaMask from './Metamask';
import { create as ipfsHttpClient } from "ipfs-http-client";
import all from 'it-all'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { projectId, projectSecret } from './constants';
import { SmartContractContext } from '../App';
import '../style/Dashboard.css';
import '../style/TradingPlatform.css';

const Profile = () => {
  const [first_render, set_first_render] = useState(true);
  const [signed_in, set_signed_in] = useState('');
  const [company_name, set_company_name] = useState('');
  const [company_description, set_company_description] = useState('');
  const [activity_domain, set_activity_domain] = useState('');
  const [base_year_emissions, set_base_year_emissions] = useState(0);
  const [allowance, set_allowance] = useState(0);


  const {account, trading_platform_contract} = useMetaMask();
  const { account_status_loaded, account_status, company_cid, company_emissions, company_allowance } = useContext(SmartContractContext);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (first_render) {
      set_first_render(false)
    } else {
      navigate('/');
    }
  }, [account]);

  useEffect(() => {
    if (account_status == 2) {
      fetch_details(company_cid).then(() => {
        console.log('Company details fetched');
      }).catch(console.error);
    }
  }, [account_status, company_cid])

  useEffect(() => {
    set_allowance(company_allowance);
  }, [company_allowance])

  const fetch_details = async (cid) => {
    const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

    const ipfs_instance = ipfsHttpClient({
      url: "https://ipfs.infura.io:5001/api/v0",
      headers:{
        authorization
      }
    });
    console.log(cid);
    const data = uint8ArrayConcat(await all(ipfs_instance.cat(cid)))
    const company_json = JSON.parse(uint8ArrayToString(data))
    set_company_name(company_json.name);
    set_activity_domain(company_json.domain);
    set_company_description(company_json.description);
    set_base_year_emissions(company_emissions);
  }

  // Request access function that is called when the form is submitted
  
  // Will first save the company data on the IPFS, then store
  // the generated hash on the blockchain.
  
  async function request_access(e) {
    e.preventDefault();

    if (company_name === '' || company_description === ''
     || activity_domain === '' || base_year_emissions === '')
    {
      window.alert('Please fill in all fields!');
    } else if (isNaN(base_year_emissions) || base_year_emissions <= 0 || base_year_emissions % 1 !== 0) {
      window.alert('Base-year emissions needs to be a valid integer greater than 0!');
    } else {
      // submit the form
      const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

      const ipfs_instance = ipfsHttpClient({
        url: "https://ipfs.infura.io:5001/api/v0",
        headers:{
          authorization
        }
      });

      const company_json = {name: company_name, description: company_description,
        domain: activity_domain};

      const company_file_content = JSON.stringify(company_json);
      const company_file = { path: '/company_data.json', content: company_file_content };
      //console.log(company_file_content)
      const result = await ipfs_instance.add(company_file);
      const cid = result.cid.toString();
      //console.log(cid);
      
      const data = uint8ArrayConcat(await all(ipfs_instance.cat(cid)))
      //console.log(uint8ArrayToString(data))

      await trading_platform_contract.methods.request_access(cid, base_year_emissions).send({ from: account })
      set_signed_in('pending')
    }
  }

  if (!account_status_loaded) {
    return (
      <section className="todo-container">
          <div className="todo">
              <h1 className="header">
              Loading...
              </h1>
          </div>
      </section>
    )
  }

  if (account_status == 0) {
    return (
      <section className="sign_up_section">
        <h1 className="title">
          Sign up for the Trading Platform
        </h1>

        <h3 className="text">
          Your Company's name:
        </h3>

        <div>
          <input
            type="text"
            className='profile_input'
            placeholder="Company Name"
            name="name"
            onChange={(e)=>set_company_name(e.target.value)}
          />
        </div>

        <h3>
          Your Company's description:
        </h3>

        <div>
          <textarea
            type="text"
            id="description"
            className='profile_input'
            placeholder="Company Description"
            name="description"
            onChange={(e)=>set_company_description(e.target.value)}
          />
        </div>

        <h3 className="text">
          Your Company's activity domain:
        </h3>

        <div>
          <input
            type="text"
            className='profile_input'
            placeholder="Activity domain"
            name="domain"
            onChange={(e)=>set_activity_domain(e.target.value)}
          />
        </div>
        
        <h3 className="text">
          What are your Company's base-year emissions? (tonnes of CO2)
        </h3>

        <div>
          <input
            type="text"
            className='profile_input'
            placeholder="Base-year emissions (tonnes CO2)"
            name="emissions"
            onChange={(e)=>set_base_year_emissions(e.target.value)}
          />
        </div>

        <div className="btn-container">
          <button
            type="submit"
            className="btn"
            onClick={request_access}
          >
            Sign up
          </button>
        </div>
      </section>
    )
  } else if (account_status == 1) {
    return (
      <h1 className='pending_title'>
        Your account is pending approval to join the Trading Scheme.
      </h1>
    )
  } else if (account_status == 2) {
    return (
      <section className="todo-container">
        <div className="account_details">
          <h1 className="header">
            Your account details:
          </h1>
          <div>
            <h2 className='make_light_gray'>Company name: </h2>
            <p className='details'>{company_name}</p>
            <h2 className='make_light_gray'>Blockchain address: </h2>
            <p className='details'>{account}</p>
            <h2 className='make_light_gray'>Description: </h2>
            <p className='details'>{company_description}</p>
            <h2 className='make_light_gray'>Activity domain: </h2>
            <p className='details'>{activity_domain}</p>
            <h2 className='make_light_gray'>Base-year emissions: </h2>
            <p className='details'>{base_year_emissions} tonnes of CO2</p>
          </div>
          <h2>
            Your account's trading allowance:  <span className="make_orange">{allowance} CX </span>
          </h2>
        </div>
      </section>
    )
  }
};

export default Profile;