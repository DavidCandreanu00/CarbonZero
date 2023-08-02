#Carbon Zero 

The goal of this project was to create a complete platform that enables governments to assign allowances and oversee trading, and empowers companies to trade and manage their emissions allowance portfolio. A complex system was developed that encompasses trading and token assignment functionality on EVM blockchains, a functional web app and a server that maintains an off-chain order book in a database. The system was developed using SCRUM methodology, and good software engineering practices were respected. Every component was thoroughly tested using manual and automated tests, and user evaluation was conducted.


In order to easily run the project’s code, a Virtual Machine was created. All used tools (Ganache, MetaMask) and dependencies have already been installed.


Prerequisites:

Disk space requirements

The Virtual Machine will be around 14GBs after creation. The OVA file that builds the VM is
around 7 GBs.
Please ensure you have at least 21 GBs of disk space available.


Download Virtual Box:

https://www.virtualbox.org/wiki/Downloads
The VM was developed and tested on Virtual Box 7. Older versions were not tested, please use version 7.


Download the VM:

To create the VM, you will need to download the ‘VM FYP DC.ova’ file from the following location:
https://bham-my.sharepoint.com/personal/dxc936_student_bham_ac_uk/_layouts/15/ guestaccess.aspx? guestaccesstoken=H5dttWWSK0uteEiUhzCn75xWdM%2BFjPg9ZuNUVBlhaak%3D&docid=2_1c 30333237d184769a555cab537bc7e92&rev=1&e=tWi5z2


Import the VM into Virtual Box:

- Download the ‘VM FYP DC.ova’ file;
- Open Virtual Box;
- Select File > Import Appliance
- Select the downloaded .ova file in the File Selector; - Press ‘Next’;
- Ensure ‘Import hard drives as VDI’ is selected in Additional Options; - Press ‘Finish’;
  
This should create the Virtual Machine with the name ‘VM FYP DavidC’.

Additionally, you can follow the instructions provided at this link: https://docs.oracle.com/en/virtualization/virtualbox/6.0/user/ovf.html


Adjust the VM settings:

The VM settings might need to be adjusted in order to ensure it runs smoothly. 

Suggested settings:

-at least 4GBs of RAM
-at least 2 CPUs
-screen resolution of 1680x1050
-run the Window in ‘Scaled mode’ and enlarge it.

These settings can be adjusted after preferences.


 Credentials:
 
VM credentials: Username: david
Password: password
MetaMask credentials: Password: password
Recovery phrase:
senior voice sting tone donkey believe like moon remind used bike daughter


How to run the project:

The following steps need to be followed in the correct order to successfully run the project. The VM will also need to be connected to the internet (connection should be automatic if the host computer has internet access).


Step 1. Start the Ganache blockchain
- go to Desktop
- Right Click on ‘ganache-2.7.1-linux...’
- select ‘Run’
Once Ganache is open:
-select ‘carbon-zero-chain’ by pressing on it:
   The Ganache Blockchain is now running and the window can be minimised.


Step 2. Start the Oracle Server
The next step is to go to the folder containing the Node server and to run it.
Instructions:
-open a new Terminal instance
-run: ‘cd Desktop/carbon_zero/src/node_server/‘ -run: ‘node node_oracle.js’

The server should now be running in the background. This Terminal instance should stay open for the duration of running the web app.


Step 3. Start the Web App
Instructions:
-open a new Terminal instance -run: ‘cd Desktop/carbon_zero’ -run: ‘npm start’
The web app should now be opened in a Mozilla Firefox window. It can also be accessed at:
localhost:3000


How to use the Web App:

You will need to log in with the MetaMask Firefox extension when you first open the app.
If the MetaMask extension is not automatically triggered when the app first opens and Log in is
pressed, please reload the app in the browser. Log in with MetaMask
-you will need to input the following account password into the MetaMask window: password.
-if MetaMask crashes and outputs a message to change network, please press ‘X’ inside the wallet window and re-enter the password. This is a MetaMask error.
-ensure that MetaMask is connected to the Ganache blockchain:

How to switch between MetaMask User accounts

Multiple Blockchain addresses have been added to the Wallet, to showcase the functionality of different users.
To open the MetaMask wallet, press on the MetaMask browser extension.
You can switch between users (eg Admin or Company 1) inside the MetaMask wallet window, by pressing the coloured icon at the top right:
 
Select the account you want to switch to. All accounts are connected to the web app, except for the one called ‘Do not use’.
Switch between accounts to see how different users can interact with the app (Admin, authorised and unauthorised users).
