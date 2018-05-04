# Stair Climbing Service Robot v2.0
## NodeJs based HTTP and WebSocket Server


* Current version database is MySQL
* Passport is used to authenticate users
* UV4L embedded for remote audio and video streaming
* Arduino real-time serial port monitor through WebSocket
* Bootstrap 4.0 Fully responsive UI for any device


## Installation for Ubuntu or Debian based systems
1. Update the Operating System:
    * `sudo apt-get update` 
    * `sudo apt-get upgrade -y`
   
2. Install MySQL Database Server
    * `sudo apt-get install mysql-server` <br />
   During this installation you will be prompted to enter a username and password. <br />
   These credentials are used to connect to the database, and are needed in the configuration process.
 
3. Install NodeJS
    * `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
    * `sudo apt-get install -y nodejs`
    
4. Install the SCSR-Server
    * `git clone https://github.com/eam9891/SCSRv2.0.git`
    * `cd SCSRv2.0`
    * `npm install`
    
## Setup and Configuration
1. Set up the database connection within the SCSR-Server software
    * `cd SCSRv2.0/config` <br />
    * `sudo nano database.js` <br />
    Enter the database connection credentials that were created during the Installation process.

2. Connect the RapsberryPi to a Wireless Network and obtain an IP Address.
    * `cd SCSRv2.0/config` <br />
    * `sudo nano server-config.js` <br />
    Enter the IP Address in the "host" field.
    
3. Start the server
    * `cd SCSRv2.0`
    * `sudo node server.js` <br />
    