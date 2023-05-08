const web3_lib = require('web3');
const admin = require("firebase-admin");
const serviceAccount = require("./carbonzero-e9600-firebase-adminsdk-58qs8-0e4010a097.json");
const provider = new web3_lib.providers.WebsocketProvider('http://127.0.0.1:7545');
const web3 = new web3_lib(provider);
const contract_ABI = require('../truffle/build/contracts/TradingPlatform.json');
const contact_address = '0xD8D6b9e6E8ba24E470B3B51Aac4E99D075f58bb0';
const trading_contract = new web3.eth.Contract(contract_ABI.abi, contact_address);
var log_order_status = 0;
var buy_order_status = 0;
var sell_order_status = 0;
var transaction_status = 0;

admin.initializeApp({
credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteCollection(db, collectionPath, batchSize) {
	const collectionRef = db.collection(collectionPath);
	const query = collectionRef.limit(batchSize);

	return new Promise((resolve, reject) => {
		deleteQueryBatch(db, query, resolve)
		.catch(reject);
	});
}

// We delete everything that is in a Firestore collection,
// in batches of 500.

async function deleteQueryBatch(db, query, resolve) {
	const snapshot = await query.get();

	const batchSize = snapshot.size;
	if (batchSize === 0) {
		resolve();
		return;
	}

	const batch = db.batch();
	snapshot.docs.forEach((doc) => {
		batch.delete(doc.ref);
	});
	await batch.commit();

	process.nextTick(() => {
		deleteQueryBatch(db, query, resolve);
	});
}

// Delete old collections when server starts --------------------------

deleteCollection(db, 'buy_orders', 500)
.then(() => {
	console.log('Buy order collection deleted successfully.');
	add_old_buy_order_events();
})
.catch((error) => {
	console.error('Error deleting buy order collection:', error);
});

deleteCollection(db, 'sell_orders', 500)
.then(() => {
	console.log('Sell order collection deleted successfully.');
	add_old_sell_order_events();
})
.catch((error) => {
	console.error('Error deleting sell order collection:', error);
});

deleteCollection(db, 'status_changes', 500)
.then(() => {
	console.log('Status changes collection deleted successfully.');
	add_old_events();
})
.catch((error) => {
	console.error('Error deleting status changes collection:', error);
});

deleteCollection(db, 'transactions', 500)
.then(() => {
	console.log('Transactions collection deleted successfully.');
	add_old_transaction_events();
})
.catch((error) => {
	console.error('Error deleting transactions collection:', error);
});

deleteCollection(db, 'mints', 500)
.then(() => {
	console.log('Mints collection deleted successfully.');
	add_old_mint_events();
})
.catch((error) => {
	console.error('Error deleting mints collection:', error);
});

//	Once all collections were deleted, we recreate them with 
//	fresh data from the Blockchain

//	By doing this, we make sure that all events are logged, even
//	those that were triggered when the server was down.

//	Instead of deleting everything and repopulating it, we could
//	log the block number of the last logged event and only resume
//	fetching old events starting from there.

//	For the purpose of this project, repopulating everything
//	is a viable solution.


//Fetch old status change events and add them to the collection ---------------

const fetch_events = async () => {
const all_events = await trading_contract.getPastEvents("status_change", { fromBlock: 0, toBlock: "latest"})
return all_events;
}

const add_old_events = () => {
fetch_events().then(async (events) => {
	const account_hash_map = {};

	events.forEach((event) => {
	const target_address = event.returnValues.target_address;
	const status = event.returnValues.status;
	account_hash_map[target_address] = status;
	});

	console.log(account_hash_map);
	const collectionRef = db.collection('status_changes');

	for (var address of Object.keys(account_hash_map)) {
	log_order_status += 1;
	const docData = { address: String(address), status: Number(account_hash_map[address]),
		log_order: log_order_status};
	const docRef = await collectionRef.add(docData);
	console.log("Document written with ID: " + docRef.id);
	}
}).catch(console.error);
}

//Fetch old mint events and add them to the collection ---------------

const fetch_old_mints = async () => {
const all_events = await trading_contract.getPastEvents("minted", { fromBlock: 0, toBlock: "latest"})
return all_events;
}

const add_old_mint_events = () => {
fetch_old_mints().then(async (events) => {
	const all_mints = [];

	events.forEach((event) => {
	const trading_period_length = event.returnValues.trading_period_length;
	const target_reduction = event.returnValues.target_reduction;
	const timestamp = event.returnValues.timestamp;
	all_mints.push({trading_period_length:trading_period_length,
		target_reduction:target_reduction, timestamp:timestamp});
	});

	const collectionRef = db.collection('mints');

	all_mints.forEach(async mint => {
	const docData = { trading_period_length: Number(mint.trading_period_length),
		target_reduction: Number(mint.target_reduction),
		timestamp: Number(mint.timestamp),};
	const docRef = await collectionRef.add(docData);
	console.log("Document written with ID: " + docRef.id);
	});
}).catch(console.error);
}


//Fetch old transactions events and add them to the collection ---------------

const fetch_old_transactions = async () => {
const all_events = await trading_contract.getPastEvents("buy_event", { fromBlock: 0, toBlock: "latest"})
return all_events;
}

const add_old_transaction_events = () => {
fetch_old_transactions().then(async (events) => {
	const all_transactions = [];

	events.forEach((event) => {
	const seller_address = event.returnValues.seller_address;
	const buyer_address = event.returnValues.buyer_address;
	const amount = event.returnValues.amount;
	const price = event.returnValues.price;
	all_transactions.push({seller:seller_address,
		buyer:buyer_address, amount:amount, price:price});
	});

	const collectionRef = db.collection('transactions');

	all_transactions.forEach(async transaction => {
	transaction_status += 1;
	const docData = { seller_address: String(transaction.seller),
		buyer_address: String(transaction.buyer),
		amount: Number(transaction.amount),
		price: Number(transaction.price),
		log_order: transaction_status};
	const docRef = await collectionRef.add(docData);
	console.log("Document written with ID: " + docRef.id);
	});
}).catch(console.error);
}

//Fetch old buy order events and add them to the collection ---------------

const fetch_buy_order_events = async () => {
const all_events = await trading_contract.getPastEvents("buy_order_event", { fromBlock: 0, toBlock: "latest"})
return all_events;
}

const add_old_buy_order_events = () => {
fetch_buy_order_events().then(async (events) => {
	const account_hash_map = {};

	events.forEach((event) => {
	const buyer_address = event.returnValues.buyer_address;
	const amount = event.returnValues.amount;
	const price = event.returnValues.price;
	account_hash_map[buyer_address] = {amount:amount, price:price};
	});

	const collectionRef = db.collection('buy_orders');

	for (var address of Object.keys(account_hash_map)) {
	buy_order_status += 1;
	const docData = { address: String(address),
		amount: Number(account_hash_map[address].amount),
		price: Number(account_hash_map[address].price),
		log_order: buy_order_status};
	const docRef = await collectionRef.add(docData);
	console.log("Document written with ID: " + docRef.id);
	}
}).catch(console.error);
}

//Fetch old sell order events and add them to the collection ---------------

const fetch_sell_order_events = async () => {
const all_events = await trading_contract.getPastEvents("sell_order_event", { fromBlock: 0, toBlock: "latest"})
return all_events;
}

const add_old_sell_order_events = () => {
fetch_sell_order_events().then(async (events) => {
	const account_hash_map = {};

	events.forEach((event) => {
	const seller_address = event.returnValues.seller_address;
	const amount = event.returnValues.amount;
	const price = event.returnValues.price;
	account_hash_map[seller_address] = {amount:amount, price:price};
	});

	const collectionRef = db.collection('sell_orders');

	for (var address of Object.keys(account_hash_map)) {
	sell_order_status += 1;
	const docData = { address: String(address),
		amount: Number(account_hash_map[address].amount),
		price: Number(account_hash_map[address].price),
		log_order: sell_order_status};
	const docRef = await collectionRef.add(docData);
	console.log("Document written with ID: " + docRef.id);
	}
}).catch(console.error);
}


//Run an interval counter ------------------------------------------

var runs = 1;

const intervalId = setInterval(() => {
	console.log('This server has been running for ' + runs * 10 + ' seconds.');
	runs += 1;
}, 10000);


// Here we handle status change events -----------------------------

const event = trading_contract.events.status_change();

event.on('data', (event) => {
console.log('Event data:', event.returnValues);
const target_address = event.returnValues.target_address;
const status = event.returnValues.status;
const collectionRef = db.collection('status_changes');

const query = collectionRef.where('address', '==', target_address).limit(1);

query.get()
	.then((snapshot) => {
	if (snapshot.size === 0) {
		// If there are no matching documents, we create a new doc.
		log_order_status += 1;
		collectionRef.doc().set({
		address: String(target_address),
		status: Number(status),
		log_order: log_order_status
		})
		.then(() => {
			console.log('New document created successfully.');
		})
		.catch((error) => {
			log_order_status -= 1;
			console.error('Error creating new document:', error);
		});
		return;
	}

	// If there is a matching document, we update it
	const docRef = snapshot.docs[0].ref;

	log_order_status += 1;
	docRef.update({
		status: Number(status),
		log_order: log_order_status
	})
		.then(() => {
		console.log('Document updated successfully.');
		})
		.catch((error) => {
		log_order_status -= 1;
		console.error('Error updating document:', error);
		});
	})
	.catch((error) => {
	console.error('Error querying collection:', error);
	});
});

event.on('error', (error) => {
console.error('Error:', error);
});

//  Buy and Sell events
//  We will only hold in Firebase one buy or sell event per blockchain address
//  If the address already has an event on Firebase, we update it.


//  Here we handle buy order events -----------------------------

const buy_order_event = trading_contract.events.buy_order_event();

buy_order_event.on('data', (event) => {
console.log('Event data:', event.returnValues);
const buyer_address = event.returnValues.buyer_address;
const amount = event.returnValues.amount;
const price = event.returnValues.price;
const collectionRef = db.collection('buy_orders');

const query = collectionRef.where('address', '==', buyer_address).limit(1);

query.get()
	.then((snapshot) => {
	if (snapshot.size === 0) {
		// If there are no matching documents, we create a new doc.
		buy_order_status += 1;
		collectionRef.doc().set({
		address: String(buyer_address),
		amount: Number(amount),
		price: Number(price),
		log_order: buy_order_status
		})
		.then(() => {
			console.log('New document created successfully.');
		})
		.catch((error) => {
			buy_order_status -= 1;
			console.error('Error creating new document:', error);
		});
		return;
	}

	// If there is a matching document, we update it
	const docRef = snapshot.docs[0].ref;

	buy_order_status += 1;
	docRef.update({
		amount: Number(amount),
		price: Number(price),
		log_order: buy_order_status
	})
		.then(() => {
		console.log('Document updated successfully.');
		})
		.catch((error) => {
		log_order_status -= 1;
		console.error('Error updating document:', error);
		});
	})
	.catch((error) => {
	console.error('Error querying collection:', error);
	});
});

buy_order_event.on('error', (error) => {
console.error('Error:', error);
});

//  Buy and Sell events
//  We will only hold in Firebase one buy or sell event per blockchain address
//  If the address already has an event on Firebase, we update it.


// Here we handle sell order events -----------------------------

const sell_order_event = trading_contract.events.sell_order_event();

sell_order_event.on('data', (event) => {
console.log('Event data:', event.returnValues);
const seller_address = event.returnValues.seller_address;
const amount = event.returnValues.amount;
const price = event.returnValues.price;
const collectionRef = db.collection('sell_orders');

const query = collectionRef.where('address', '==', seller_address).limit(1);

query.get()
	.then((snapshot) => {
	if (snapshot.size === 0) {
		// If there are no matching documents, we create a new doc.
		sell_order_status += 1;
		collectionRef.doc().set({
		address: String(seller_address),
		amount: Number(amount),
		price: Number(price),
		log_order: sell_order_status
		})
		.then(() => {
			console.log('New document created successfully.');
		})
		.catch((error) => {
			sell_order_status -= 1;
			console.error('Error creating new document:', error);
		});
		return;
	}

	// If there is a matching document, we update it
	const docRef = snapshot.docs[0].ref;

	sell_order_status += 1;
	docRef.update({
		amount: Number(amount),
		price: Number(price),
		log_order: sell_order_status
	})
		.then(() => {
		console.log('Document updated successfully.');
		})
		.catch((error) => {
		log_order_status -= 1;
		console.error('Error updating document:', error);
		});
	})
	.catch((error) => {
	console.error('Error querying collection:', error);
	});
});

sell_order_event.on('error', (error) => {
console.error('Error:', error);
});

// Here we handle transaction events -----------------------------

const transaction_event = trading_contract.events.buy_event();

transaction_event.on('data', (event) => {
console.log('Event data:', event.returnValues);
const seller_address = event.returnValues.seller_address;
const buyer_address = event.returnValues.buyer_address;
const amount = event.returnValues.amount;
const price = event.returnValues.price;
const collectionRef = db.collection('transactions');

transaction_status += 1;

collectionRef.doc().set({
	seller_address: String(seller_address),
	buyer_address: String(buyer_address),
	amount: Number(amount),
	price: Number(price),
	log_order: transaction_status
})
.then(() => {
	console.log('New document created successfully.');
})
.catch((error) => {
	buy_order_status -= 1;
	console.error('Error creating new document:', error);
});
});

transaction_event.on('error', (error) => {
console.error('Error:', error);
});


// Here we handle mint events -----------------------------

const mint_event = trading_contract.events.minted();

mint_event.on('data', (event) => {
console.log('Event data:', event.returnValues);
const trading_period_length = event.returnValues.trading_period_length;
const target_reduction = event.returnValues.target_reduction;
const timestamp = event.returnValues.timestamp;

const collectionRef = db.collection('mints');

collectionRef.doc().set({
	trading_period_length: Number(trading_period_length),
	target_reduction: Number(target_reduction),
	timestamp: Number(timestamp)
})
.then(() => {
	console.log('New document created successfully.');
})
.catch((error) => {
	console.error('Error creating new document:', error);
});
});

transaction_event.on('error', (error) => {
console.error('Error:', error);
});