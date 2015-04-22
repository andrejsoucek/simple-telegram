# Simple-Telegram

Simple wrapper to send and receive messages by Telegram



## Pre-requisites

Obedience is based in [vysheng’s telegram-cli project](https://github.com/vysheng/tg). You must install and configure this great project previously to use Simple-Telegram. You can obtain every info that you need in [vysheng’s repository](https://github.com/vysheng/tg).

Also, you must install nodeJs 0.10 or above. You can check more info [here](http://www.nodejs.org).



##Installation

Easy. If you use npm (recommended):

	npm install simple-telegram

If you prefer git:

	git clone https://github.com/GuillermoPena/simple-telegram.git

Simple-telegram has been tested in Ubuntu 14.04 and Raspberry Pi with Raspbmc.
This doesn’t mean that Simple-Telegram doesn’t work in other systems… try it!



##How to use it

Simple-telegram allows send and receive messages by Telegram so, how do it?

1. Sending a message:

	Using ‘send’ public method
	Sintaxis: tg.send(userName, message)
	Example:
	```javascript
	var SimpleTelegram = require('simple-telegram')
	var stg = new SimpleTelegram()

	// Replace next values to your own paths
	var tgBinFile  = "[your path]/telegram-cli"
	var tgKeysFile = "[your path]/tg-server.pub"

	// Creating simpleTelegram object
	stg.create(tgBinFile, tgKeysFile)

	stg.send("John", "Hi John!")
	```



2. Receiving a message:

	Catching ‘receivedMessage’ event, which provide you a object like this:
		msg = { “caller”:”John”; “content”: “Hi”; "command": "Hi"; "args":"" }
	Example:

	```javascript
	var SimpleTelegram = require('simple-telegram')
	var stg = new SimpleTelegram()

	// Replace next values to your own paths
	var tgBinFile  = "[your path]/telegram-cli"
	var tgKeysFile = "[your path]/tg-server.pub"

	// Creating simpleTelegram object
	stg.create(tgBinFile, tgKeysFile)

	stg.getProcess().stdout.on("receivedMessage", function(msg) {
	    console.log("\nReceived message")
	    console.dir(msg)
	})
	```



## Contributors

- [GuillermoPena](http://github.com/GuillermoPena)
