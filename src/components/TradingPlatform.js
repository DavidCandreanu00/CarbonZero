import React, { useState , useEffect, useContext, useRef } from 'react';
import { collection, getDocs, orderBy, query, limit, onSnapshot, where } from "firebase/firestore";
import {db} from '../firebase'
import '../App.css';
import '../style/TradingPlatform.css';
import {useNavigate} from 'react-router-dom';
import useMetaMask from './Metamask';
import bigInt from 'big-integer'; 
import { SmartContractContext } from '../App';
 
const TradingPlatform = () => {
    const buy_quant = useRef(null);
    const sell_quant = useRef(null);
    const buy_price = useRef(null);
    const sell_price = useRef(null);
    
    const [future_buy_order_quant, set_future_buy_order_quant] = useState(0);
    const [future_buy_order_price, set_future_buy_order_price] = useState(0);
    const [buy_orders_list, set_buy_orders_list] = useState([]);
    const [spot_buy_order_quant, set_spot_buy_order_quant] = useState(0);

    const [future_sell_order_quant, set_future_sell_order_quant] = useState(0);
    const [future_sell_order_price, set_future_sell_order_price] = useState(0);
    const [sell_orders_list, set_sell_orders_list] = useState([]);
    const [spot_sell_order_quant, set_spot_sell_order_quant] = useState(0);

    const [open_buy, set_open_buy] = useState({});
    const [open_sell, set_open_sell] = useState({});

    const [avg_buy_price, set_avg_buy_price] = useState(0);
    const [avg_sell_price, set_avg_sell_price] = useState(0);

    const [buy_btn_loaded, set_buy_btn_loaded] = useState(true);
    const [sell_btn_loaded, set_sell_btn_loaded] = useState(true);

    const [buy_order_btn_loaded, set_buy_order_btn_loaded] = useState(true);
    const [sell_order_btn_loaded, set_sell_order_btn_loaded] = useState(true);

    const [first_render, set_first_render] = useState(true);
    const [is_checked, set_is_checked] = useState(false);

    const [all_transactions, set_all_transactions] = useState([]);

    const wei = bigInt(1000000000000000000n);

    const {library, account, trading_platform_contract} = useMetaMask();
    const { trading_open, company_allowance, account_status } = useContext(SmartContractContext);

    const navigate = useNavigate();
    
    useEffect(() => {
        if (first_render) {
            set_first_render(false)
        } else {
            navigate('/');
        }
      }, [account]);

      useEffect(() => {
        var total_count_s = 0;
        var total_price_s = 0;
        sell_orders_list.forEach(order => {
            total_count_s += order.amount;
            total_price_s += total_count_s * bigInt(order.price)/wei;
        })
        //console.log(total_price_s/total_count_s);
        set_avg_sell_price(total_price_s/total_count_s);
        
      }, [sell_orders_list]);

      useEffect(() => {
        var total_count_b = 0;
        var total_price_b = 0;
        buy_orders_list.forEach(order => {
            total_count_b += order.amount;
            total_price_b += total_count_b * bigInt(order.price)/wei;
        })
        //console.log(total_price_b/total_count_b);
        set_avg_buy_price(total_price_b/total_count_b);
      }, [buy_orders_list]);

 
      useEffect(() => {
        set_future_buy_order_quant(0);
        set_future_buy_order_price(0);
        set_spot_buy_order_quant(0);
        set_future_sell_order_quant(0);
        set_future_sell_order_price(0);
        set_spot_sell_order_quant(0);
        if (buy_quant.current) {
            buy_quant.current.value = '';
        }

        if (sell_quant.current) {
            sell_quant.current.value = '';
        }
      }, [is_checked]);

    const handle_checkbox_change = () => {
        set_is_checked(!is_checked);
    };

    async function cancel_buy_order(e) {
        e.preventDefault();
        set_buy_order_btn_loaded(false);

        console.log("Cancelling buy order");
        try {
            await trading_platform_contract.methods.delete_buy_order(open_buy.amount, open_buy.price.toString()).send({ from: account });
        }
        catch (error) {
            console.error(error);
            set_buy_order_btn_loaded(true);
            return;
        }
        set_buy_order_btn_loaded(true);
    }

    async function cancel_sell_order(e) {
        e.preventDefault();
        set_sell_order_btn_loaded(false);

        console.log("Cancelling sell order");
        try {
            await trading_platform_contract.methods.delete_sell_order().send({ from: account });
        }
        catch (error) {
            console.error(error);
            set_sell_order_btn_loaded(true);
            return;
        }
        set_sell_order_btn_loaded(true);
    }

    async function add_spot_buy_order(e) {
        e.preventDefault();

        if (spot_buy_order_quant === '' ||
            isNaN(spot_buy_order_quant) || spot_buy_order_quant <= 0 || spot_buy_order_quant % 1 !== 0)
        {
            window.alert('Please input a valid quantity!');
            return
        }

        set_buy_btn_loaded(false);
        console.log(spot_buy_order_quant);
        console.log("Spot buy");

        var target = spot_buy_order_quant;
        var cheapest = {};

        const collection_ref = collection(db, 'sell_orders');
        const new_query = query(collection_ref, orderBy('price', 'asc'), limit(100));

        while (target > 0) {
            const query_snapshot = await getDocs(new_query);
            if (query_snapshot && query_snapshot.docs.length > 0) {
                cheapest = query_snapshot.docs
                    .map((doc) => ({id: doc.id, ...doc.data()}))
                    .filter((item) => item.amount > 0)
                    .filter((item) => item.address != account)[0];
                if (!cheapest) {
                    window.alert('There are no available orders.');
                    set_buy_btn_loaded(true);
                    return;
                }
            }
            else {
                window.alert('There are no available orders.');
                set_buy_btn_loaded(true);
                return;
            }
            console.log(target);
            console.log(cheapest);
            if (target > cheapest.amount) {
                try {
                    const quant = Number(cheapest.amount);
                    const price = bigInt(cheapest.price).toString();
                    await trading_platform_contract.methods.buy(cheapest.address,
                        quant, cheapest.amount, price)
                    .send({ from: account, value: (bigInt(quant * price)).toString()});
                } catch (error) {
                    console.error(error);
                    window.alert('Transaction failed!');
                    set_buy_btn_loaded(true);
                    return;
                }
            } else {
                try {
                    const quant = Number(target);
                    const price = bigInt(cheapest.price).toString();
                    await trading_platform_contract.methods.buy(cheapest.address,
                        quant, cheapest.amount, price)
                    .send({ from: account, value: (bigInt(quant * price)).toString()});
                } catch (error) {
                    console.error(error);
                    window.alert('Transaction failed!');
                    set_buy_btn_loaded(true);
                    return;
                }
            }
            target -= cheapest.amount;
        }
        window.alert('Transaction succesful!');
        buy_quant.current.value = '';
        set_buy_btn_loaded(true);
        return;
    }

    async function add_future_buy_order(e) {
        e.preventDefault();

        if (future_buy_order_quant === '' ||
            isNaN(future_buy_order_quant) || future_buy_order_quant <= 0 || future_buy_order_quant % 1 !== 0)
        {
            window.alert('Please input a valid quantity!');
            return
        }

        if (future_buy_order_price === '' ||
            isNaN(future_buy_order_price) || future_buy_order_price <= 0)
        {
            window.alert('Please input a valid price!');
            return
        }

        set_buy_btn_loaded(false);
        console.log(future_buy_order_quant, future_buy_order_price);
        console.log("Future buy");
        const quant = Number(future_buy_order_quant);
        const price = library.utils.toWei(future_buy_order_price.toString(), 'ether');
        try {
            await trading_platform_contract.methods.create_buy_order(quant, price)
                .send({ from: account, value: (bigInt(quant * price)).toString()});
        } catch (error) {
            console.error(error);
            window.alert('Error adding future buy order!');
            set_buy_btn_loaded(true);
            return;
        }
        buy_quant.current.value = '';
        buy_price.current.value = '';
        set_buy_btn_loaded(true);
    }

    async function add_spot_sell_order(e) {
        e.preventDefault();

        if (spot_sell_order_quant === '' ||
            isNaN(spot_sell_order_quant) || spot_sell_order_quant <= 0 || spot_sell_order_quant % 1 !== 0)
        {
            window.alert('Please input a valid quantity!');
            return
        }

        set_sell_btn_loaded(false);
        console.log(spot_sell_order_quant);
        console.log("Spot sell");

        var target = spot_sell_order_quant;
        var most_expensive = {};

        const collection_ref = collection(db, 'buy_orders');
        const new_query = query(collection_ref, orderBy('price', 'desc'), limit(100));

        while (target > 0) {
            const query_snapshot = await getDocs(new_query);
            if (query_snapshot && query_snapshot.docs.length > 0) {
                most_expensive = query_snapshot.docs
                    .map((doc) => ({id: doc.id, ...doc.data()}))
                    .filter((item) => item.amount > 0)
                    .filter((item) => item.address != account)[0];

                if (!most_expensive) {
                    window.alert('There are no available orders.');
                    set_sell_btn_loaded(true);
                    return;
                }
            }
            else {
                window.alert('There are no available orders.');
                set_sell_btn_loaded(true);
                return;
            }
            console.log(target);
            console.log(most_expensive);
            if (target > most_expensive.amount) {
                try {
                    const quant = Number(most_expensive.amount);
                    const price = bigInt(most_expensive.price).toString();
                    await trading_platform_contract.methods.sell(most_expensive.address,
                        quant, most_expensive.amount, price)
                    .send({ from: account });
                } catch (error) {
                    console.error(error);
                    window.alert('Transaction failed!');
                    set_sell_btn_loaded(true);
                    return;
                }
            } else {
                try {
                    const quant = Number(target);
                    const price = bigInt(most_expensive.price).toString();
                    await trading_platform_contract.methods.sell(most_expensive.address,
                        quant, most_expensive.amount, price)
                    .send({ from: account });
                } catch (error) {
                    console.error(error);
                    window.alert('Transaction failed!');
                    set_sell_btn_loaded(true);
                    return;
                }
            }
            target -= most_expensive.amount;
        }
        window.alert('Transaction succesful!');
        sell_quant.current.value = '';
        set_sell_btn_loaded(true);
        return;
    }

    async function add_future_sell_order(e) {
        e.preventDefault();

        if (future_sell_order_quant === '' ||
            isNaN(future_sell_order_quant) || future_sell_order_quant <= 0 || future_sell_order_quant % 1 !== 0)
        {
            window.alert('Please input a valid quantity!');
            return
        }

        if (future_sell_order_price === '' ||
            isNaN(future_sell_order_price) || future_sell_order_price <= 0)
        {
            window.alert('Please input a valid price!');
            return
        }

        set_sell_btn_loaded(false);
        console.log(future_sell_order_quant, future_sell_order_price);
        console.log("Future sell");
        const quant = Number(future_sell_order_quant);
        const price = library.utils.toWei(future_sell_order_price.toString(), 'ether');
        console.log(price);
        try {
            await trading_platform_contract.methods.create_sell_order(quant, price).send({ from: account });
        } catch (error) {
            console.error(error);
            window.alert('Error adding future sell order!');
            set_sell_btn_loaded(true);
            return;
        }
        sell_quant.current.value = '';
        sell_price.current.value = '';
        set_sell_btn_loaded(true);
    }

    //Fetch all trades
    
    const fetch_transactions = () => {
        const collectionRef = collection(db, 'transactions');
        const orderedQuery = query(collectionRef, orderBy('log_order', 'desc'), limit(10));
        
        const unsubscribe = onSnapshot(orderedQuery, (querySnapshot) => {
            const data_list = querySnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }));
            set_all_transactions(data_list);
        });
        
        // Return the unsubscribe function in case you need to stop listening to updates later
        return unsubscribe;
    };

    //Fetch open orders of all accounts

    const fetch_trading_orders = (coll, ord_list) => {
        const collectionRef = collection(db, coll);
        const orderedQuery = query(collectionRef, orderBy('price'));
        
        const unsubscribe = onSnapshot(orderedQuery, (querySnapshot) => {
            const data_list = querySnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((item) => item.amount > 0);
            ord_list(data_list.reverse());
        });
        
        // Return the unsubscribe function in case you need to stop listening to updates later
        return unsubscribe;
    };

    // Fetch open orders of current account

    const fetch_open_order = (coll, set_ord_obj) => {
        const collectionRef = collection(db, coll);
        const orderedQuery = query(collectionRef, where('address', '==', account), limit(1));
        
        const unsubscribe = onSnapshot(orderedQuery, (querySnapshot) => {
            const data_list = querySnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }));
            if (data_list.length > 0) {
                set_ord_obj(data_list[0]);
            }
        });
        
        // Return the unsubscribe function in case you need to stop listening to updates later
        return unsubscribe;
    };

    useEffect(()=>{
        const buy_open_unsubscribe = fetch_open_order('buy_orders', set_open_buy);
        const sell_open_unsubscribe = fetch_open_order('sell_orders', set_open_sell);

        return (() => {
            buy_open_unsubscribe();
            sell_open_unsubscribe();
        });
    }, [account])

    useEffect(()=>{
        console.log(all_transactions);
    }, [all_transactions])
   
    useEffect(()=>{
        const buy_orders_unsubscribe = fetch_trading_orders('buy_orders', set_buy_orders_list);
        const sell_orders_unsubscribe = fetch_trading_orders('sell_orders', set_sell_orders_list);
        const transactions_unsubscribe = fetch_transactions();

        return (() => {
            buy_orders_unsubscribe();
            sell_orders_unsubscribe();
            transactions_unsubscribe();
        });
    }, [])
    
 
    return (
        <>
            <section className='title_div'>
                <h3 className="page_title">
                    <span className="make_orange">Account allowance:</span> {company_allowance} CX
                </h3>
            </section>
            <section id="trading_platform_container">
                <div className='trading_platform_interface' id="buy_orders">
                    <h3 id="buy_orders_title">Buy orders</h3>
                    <div className='order_interface' id="buy_orders_list">
                        {
                            buy_orders_list?.map((order,i)=>(
                                <p key={i}>
                                    {order.amount} CX at {bigInt(order.price)/wei} ETH
                                </p>
                            ))
                        }
                    </div>
                </div>
                
                {account_status == 2 && trading_open ? (    
                    <div className='trading_platform_interface'>
                        <div>
                            <div className='order_interface'>
                                {!is_checked ? (
                                    <h3>
                                        Place future buy order:
                                    </h3>
                                ) : (
                                    <h3>
                                        Place spot buy order:
                                    </h3>
                                )}

                                <div className="input_and_button">
                                    <input className='input_field'
                                        type="text"
                                        placeholder="Quantity (CX)"
                                        onChange={(e)=>{is_checked ? set_spot_buy_order_quant(e.target.value) : set_future_buy_order_quant(e.target.value)}}
                                        ref={buy_quant}
                                        />

                                    {!is_checked ? (
                                        <input className='input_field'
                                        type="text"
                                        placeholder="Price (ETH)"
                                        onChange={(e)=>{set_future_buy_order_price(e.target.value)}}
                                        ref={buy_price}
                                        />
                                    ) : (
                                        <h4 className='avg_text'>
                                        Avg sell price: <span className="make_orange"><b>{avg_sell_price.toFixed(2)} ETH</b></span>
                                        </h4>
                                    )}
                                    <div className="btn-container">
                                        {buy_btn_loaded ? (
                                            <button
                                            type="submit"
                                            className="btn"
                                            onClick={(e)=>{is_checked ? add_spot_buy_order(e) : add_future_buy_order(e)}}
                                            >
                                                Submit Buy
                                            </button>
                                        ) : (
                                            <h3 className="text">
                                                Loading...
                                            </h3>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className='order_interface'>
                            {!is_checked ? (
                                    <h3>
                                        Place future sell order:
                                    </h3>
                                ) : (
                                    <h3>
                                        Place spot sell order:
                                    </h3>
                                )}
                                
                                <div className="input_and_button">
                                        <input className='input_field'
                                        type="text"
                                        placeholder="Quantity (CX)"
                                        onChange={(e)=>{is_checked ? set_spot_sell_order_quant(e.target.value) : set_future_sell_order_quant(e.target.value)}}
                                        ref={sell_quant}
                                    />
                                    {!is_checked ? (
                                        <input className='input_field'
                                        type="text"
                                        placeholder="Price (ETH)"
                                        onChange={(e)=>{set_future_sell_order_price(e.target.value)}}
                                        ref={sell_price}
                                    />
                                    ) : (
                                        <h4 className='avg_text'>
                                        Avg buy price: <span className="make_orange">{avg_buy_price.toFixed(2)} ETH</span>
                                        </h4>
                                    )}
                                    <div className="btn-container">
                                        {sell_btn_loaded ? (
                                            <button
                                            type="submit"
                                            className="btn"
                                            onClick={(e)=>{is_checked ? add_spot_sell_order(e) : add_future_sell_order(e)}}
                                            >
                                                Submit Sell
                                            </button>
                                        ) : (
                                            <h3 className="text">
                                                Loading...
                                            </h3>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {!is_checked? (
                            <label className="switch slider_inactive">
                                <span className="left-label">Future order</span>
                                <input type="checkbox" checked={is_checked} onChange={handle_checkbox_change}/>
                                <span className="slider"></span>
                                <span className="right-label">Spot order</span>
                            </label>
                        ) : (
                            <label className="switch slider_active">
                                <span className="left-label">Future order</span>
                                <input type="checkbox" checked={is_checked} onChange={handle_checkbox_change}/>
                                <span className="slider"></span>
                                <span className="right-label">Spot order</span>
                        </label>
                        )}
                    </div>
                ) : (
                    <>
                    {trading_open ? (
                    <>
                        <div className='trading_platform_interface placeholder'>
                            <h2>
                                You do not have permission to trade. 
                            </h2>
                        </div>
                    </>) : (
                    <>
                        <div className='trading_platform_interface placeholder'>
                            <h2>
                                Please wait for the admin to start the trading period. 
                            </h2>
                        </div>
                    </>)}
                    </>
                )}

                <div className='trading_platform_interface' id="sell_orders">
                    <h3 id="sell_orders_title">Sell orders</h3>
                    <div className='order_interface' id="sell_orders_list">
                        {
                            sell_orders_list?.map((order,i)=>(
                                <p key={i}>
                                    {order.amount} CX at {bigInt(order.price)/wei} ETH
                                </p>
                            ))
                        }
                    </div>
                </div>
        </section>
        <section className="open_trades">
            {Object.keys(open_buy).length !== 0 && open_buy.amount != 0 ? (
                <>
                <div className='order_div div_left'>
                <h3>
                    Open buy order:
                </h3>
                <p>
                <span className="make_orange"><b>{open_buy.amount} CX</b></span> at a price of <span className="make_orange">{bigInt(open_buy.price)/wei} ETH</span> each.
                </p>
                </div>
                <div className='order_div div_right'>
                {buy_order_btn_loaded ? (
                    <button
                        type="submit"
                        className="btn_cancel"
                        onClick={cancel_buy_order}
                    >
                        Cancel buy order
                    </button>
                ) : (
                    <h3 className="text">
                        Loading...
                    </h3>
                )}
                </div>
                </>
            ) : (
                <h3 className="text">
                    No open buy order.
                </h3>
            )}
        </section>
        <section className="open_trades">
            {Object.keys(open_sell).length !== 0 && open_sell.amount != 0 ? (
                <>
                <div className='order_div div_left'>
                <h3>
                    Open sell order:
                </h3>
                <p>
                    <span className="make_orange"><b>{open_sell.amount} CX</b></span> at a price of <span className="make_orange">{bigInt(open_sell.price)/wei} ETH</span> each.
                </p>
                </div>
                <div className='order_div div_right'>
                {sell_order_btn_loaded ? (
                    <button
                    type="submit"
                    className="btn_cancel"
                    onClick={cancel_sell_order}
                    >
                        Cancel sell order
                    </button>
                ) : (
                    <h3 className="text">
                        Loading...
                    </h3>
                )}
                </div>
                </>
            ) : (
                <h3 className="text">
                    No open sell order.
                </h3>
            )}
        </section>
        <section className="transactions">
        <h3 id="transactions_header">
            Past transactions:
        </h3>
        <div className='all_transactions'>
            {
                all_transactions?.map((trans,i)=>(
                    <p key={i}>
                        <span className="make_blue"><b>{trans.seller_address.slice(0, 8) + "..." + trans.seller_address.slice(-6)}</b></span> sold <span className="make_orange">{trans.amount}</span>  <b>CX </b>
                        at <span className="make_orange">{bigInt(trans.price)/wei}</span> <b>ETH</b> to <span className="make_blue"><b>{trans.buyer_address.slice(0, 8) + "..." + trans.buyer_address.slice(-6)}</b></span>
                     </p>
                ))
            }
        </div>
        </section>
    </>
    )
}
 
export default TradingPlatform