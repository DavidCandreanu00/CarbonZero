//Source of the code


//This component connects our web app to MetaMask
//and it was implemented following this tutorial:

//https://medium.com/coinmonks/connecting-to-metamask-react-js-custom-hook-state-management-2f1f3203f509


//Part of the code for this component can also be found in the following repo:
//https://github.com/blakewood84/react-metamask-medium



import React, { useState, useEffect, useMemo, useCallback, useRef} from 'react'
import { injected } from './connectors'
import { useWeb3React } from '@web3-react/core';
import TradingPlatformContract from '../truffle/build/contracts/TradingPlatform.json';
import { smartContractAddress } from './constants';

export const MetaMaskContext = React.createContext(null)

export const MetaMaskProvider = ({ children }) => {

    const { activate, account, library, connector, active, deactivate } = useWeb3React()
    
    const [isActive, setIsActive] = useState(false)
    const [shouldDisable, setShouldDisable] = useState(false) // Should disable connect button while connecting to MetaMask
    const [isLoading, setIsLoading] = useState(true)
    const [trading_platform_contract, set_trading_platform_contract] = useState({})

    const trading_platform_contract_address = smartContractAddress;

    // Init Loading
    useEffect(() => {
        connect().then(val => {
            setIsLoading(false)
        });
    }, [])

    // Check when App is Connected or Disconnected to MetaMask
    const handleIsActive = useCallback(() => {
        console.log('App is connected with MetaMask ', active)
        setIsActive(active);
        if (active) {
            const myContract = new library.eth.Contract(TradingPlatformContract.abi, trading_platform_contract_address);
            set_trading_platform_contract(myContract);
        } else {
            set_trading_platform_contract({});
        }
    }, [active])

    useEffect(() => {
        handleIsActive()
    }, [handleIsActive])

    // Connect to MetaMask wallet
    const connect = async () => {
        console.log('Connecting to MetaMask...')
        setShouldDisable(true)
        try {
            await activate(injected).then(() => {
                setShouldDisable(false)
            })
        } catch(error) {
            console.log('Error on connecting: ', error)
        }
    }

    // Disconnect from Metamask wallet
    const disconnect = async () => {
        console.log('Disconnecting wallet from App...')
        try {
            await deactivate()
        } catch(error) {
            console.log('Error on disconnnect: ', error)
        }
    }

    const values = useMemo(
        () => ({
            isActive,
            account,
            library,
            trading_platform_contract,
            isLoading,
            connect,
            disconnect,
            shouldDisable
        }),
        [isActive, isLoading, shouldDisable, account]
    )

    return <MetaMaskContext.Provider value={values}>{children}</MetaMaskContext.Provider>
}

export default function useMetaMask() {
    const context = React.useContext(MetaMaskContext)

    if (context === undefined) {
        throw new Error('useMetaMask hook must be used with a MetaMaskProvider component')
    }

    return context
}