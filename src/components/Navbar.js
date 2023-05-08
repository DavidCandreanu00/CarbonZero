import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Navbar.css';
import useMetaMask from './Metamask';
import {adminAddress} from './constants';

const Navbar = () => {

const {disconnect, isActive, account} = useMetaMask();

return (
    <nav className="navi_wrapper">
        <div className='navbar_left'>
        <div className="logo">
            <span id="logo_first_word">Carbon</span>
            <span id="logo_second_word">Zero</span>
        </div>
        {account == (adminAddress) ? (
            <ul className="navi">
                <li className="link">
                    <Link to="/" className="link_text">Active companies</Link>
                </li>
                <li className="link">
                    <Link to="/trading_platform" className="link_text">Trading Platform</Link>
                </li>
                <li className="link">
                    <Link to="/admin" className="link_text">Admin Dashboard</Link>
                </li>
            </ul>
        ) : (
            <ul className="navi">
                <li className="link">
                    <Link to="/" className="link_text">Active companies</Link>
                </li>
                <li className="link">
                    <Link to="/trading_platform" className="link_text">Trading Platform</Link>
                </li>
                <li className="link">
                    <Link to="/profile" className="link_text">Account</Link>
                </li>
                <li className="link">
                    <Link to="/guide" className="link_text">Guide</Link>
                </li>
            </ul>
        )}
        </div>
        <div>
            <button className="logout_button" onClick={disconnect}>
                {isActive ? 'Log out' : 'Log in'}
            </button>
        </div>
    </nav>
  );
};

export default Navbar;