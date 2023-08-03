# CarbonZero

Web3 platform that enables companies to be assigned Carbon Emission Rights and to trade peer-to-peer. The platform uses an off-chain order book, which enables faster and more efficient trading than traditional blockchain-based approaches.

The goal of this project was to create a complete platform that enables governments to assign allowances and oversee trading, and empowers companies to trade and manage their emissions allowance portfolio. A complex system was developed that encompasses trading and token assignment functionality on EVM blockchains, a functional web app and a server that maintains an off-chain order book in a database. 

You can also read the project's documentation here: [Project paper](https://github.com/DavidCandreanu00/CarbonZero/blob/main/Final%20Year%20Project%20David%20Candreanu.pdf)

In order to easily run the project’s code, a VM was created. All used tools (Ganache, MetaMask) and dependencies have already been installed.


## Prerequisites


### Download Virtual Box:

https://www.virtualbox.org/wiki/Downloads

The VM was developed and tested on Virtual Box 7. Older versions were not tested, please use version 7.


### Download the VM:

To create the VM, you will need to download the ‘VM FYP DC.ova’ file from the following location: [VM](https://bham-my.sharepoint.com/personal/dxc936_student_bham_ac_uk/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fdxc936%5Fstudent%5Fbham%5Fac%5Fuk%2FDocuments%2FVM%20FYP%20DC%2Eova&parent=%2Fpersonal%2Fdxc936%5Fstudent%5Fbham%5Fac%5Fuk%2FDocuments&ga=1)


### Import the VM to Virtual Box:

You can follow the instructions on the following page:
https://docs.oracle.com/en/virtualization/virtualbox/6.0/user/ovf.html

## Credentials:

### VM credentials:
Username: david
Password: password

### MetaMask credentials:

Password: password
Recovery phrase:
senior voice sting tone donkey believe like moon remind used bike daughter


## How to run the project:

The following steps need to be followed in the correct order to successfully run the project. The VM will also need to be connected to the internet (connection should be automatic if the host computer has internet access).


### Step 1. Start the Ganache blockchain

- go to Desktop
- Right Click on ‘ganache-2.7.1-linux...’
- select ‘Run’
  
Once Ganache is open:
- select ‘carbon-zero-chain’
The Ganache Blockchain is now running and the window can be minimised.


### Step 2. Start the Oracle Server

The next step is to go to the folder containing the Node server and to run it.
Instructions:

- open a new Terminal instance
- run: ‘cd Desktop/carbon_zero/src/node_server/‘
- run: ‘node node_oracle.js’

The server should now be running in the background. This Terminal instance should stay open for the duration of running the web app.


### Step 3. Start the Web App

Instructions:
- open a new Terminal instance
- run: ‘cd Desktop/carbon_zero'
- run: ‘npm start’

The web app should now be opened in a Mozilla Firefox window. It can also be accessed at:
*localhost:3000*
