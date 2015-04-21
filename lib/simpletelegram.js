/* ___________________________________________________________________________

  Module: communicator.js   Version: v0.0.1
	Repository: http://github.com/GuillermoPena/obedience
  Author: Guillermo Peña (guillermo.pena.cardano@gmail.com)
  Last update: 21/04/2015

  communicator (Telegram) object

  __________________________________________________________________________*/

function Communicator() {

	// __ Properties _________________________________________________________

  var telegramProcess	// Telegram cli process

  // __ Private Methods ____________________________________________________

  // Extract data from Telegram message (caller, command, arguments...)
  var receiveMessage = function(message){

    if (message.toString().indexOf(">>>") <= -1) return null

    // Extracting caller
    message = message.split('\n')[0]
    var slicesA = message.split('>>>')
    var slicesB = slicesA[0].split(' ')
    var caller  = slicesA[0].replace(slicesB[0],"")
		var content = (slicesA.length > 1) ? slicesA[1] : null

    // Extracting command
    var command = slicesA[1].trim()
    var slicesD = command.split(' ')
    var cmd = slicesD[0]

    // Extracting arguments
    var args = command.replace(slicesD[0],"")

    // Emitting event
    parsedMessage = { "caller" : caller.trim()
										, "content": content.trim()
                    , "command" : cmd.trim()
                    , "args" : args.trim()
										}

		// Emitting event to process command
		telegramProcess.stdout.emit('receivedMessage', parsedMessage)
  }

  // __ Public Methods _____________________________________________________

	// Create and launch Telegram cli process
	var create = function(tgBinFile, tgKeysKile){
		telegramProcess = require('child_process').execFile(tgBinFile, ['-Ck', tgKeysKile])
		telegramProcess.stdout.on('data', receiveMessage) // Receiving message
	}

	// Send Message to someone in Telegram
  var send = function(target, message) {

		if (!message) return
		if (target) {
	    target  = target.replace(' ','_')
			var newline = message.indexOf("\n")
			while (newline != -1) {
				message = message.replace("\n", "\\n")
				newline = message.indexOf("\n")
			}
	    telegramProcess.stdin.write('msg ' + target + ' "' + message + '"' + '\n', encoding='utf8')
		}
  }

  // Getters and Setters
	var getProcess = function()  { return telegramProcess }

  // __ Return _____________________________________________________________

  return { "create": create
				 , "send": send
         , "getProcess": getProcess
				 }
}

module.exports = Communicator
