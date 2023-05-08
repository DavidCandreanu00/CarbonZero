import React from 'react';
import '../style/MetamaskLogin.css';

const MetamaskLogin = ({connect, shouldDisable, isActive}) => {
    
  return (
    <section className="login_container">
        <div>
            <img id="metamask_icon" src="metamask_icon.svg"></img>
            <h1 className="header_login">
                Please Login with Metamask:
            </h1>
            <button className="login_button" onClick={connect} disabled={shouldDisable}>
                {isActive ? 'Log out' : 'Log in'}
            </button>
        </div>
    </section>
  );
};

export default MetamaskLogin;