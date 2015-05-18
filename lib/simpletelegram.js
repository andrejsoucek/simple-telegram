/* ___________________________________________________________________________

  Module: simpletelegram.js   Version: v0.0.10
	Repository: http://github.com/GuillermoPena/obedience
  Author: Guillermo Peña (guillermo.pena.cardano@gmail.com)
  Last update: 18/05/2015

  Simple-Telegram object (Telegram communicator object)

  __________________________________________________________________________*/

function SimpleTelegram() {

  // __ Modules ____________________________________________________________

  var fs = require('fs')

	// __ Properties _________________________________________________________

  var telegramProcess // Telegram cli process
  var loggers = []    // Loggers array
  var tgDebugFile     // Telegram debug log file

  //var io              // Socket.io interface
  var socketPort      // Port of socket.io interface

  // __ Private Methods ____________________________________________________

  // Logging messages
  var log = function(level, message) {
      if (loggers.length == 0) {
        if (level.toLowerCase() == "error")
          console.error(message)
        else
          console.log(message)
      } else {
        loggers.forEach(function(logger) {
          logger.log(level, message)
        })
      }
  }

  // Set socket.io interface
  var setSocketIo = function() {

    // Without a correct port, no socket.io interface
    if (!socketPort) return

    // Setting socket.io server
    var server = require('http').createServer()
    var io = require('socket.io')(server)

    // When a sockect is connected
    io.on('connection', function(socket){
      log('debug', 'Socket id [' + socket.id + '] connected')
      var endpoint = socket.handshake.address

      // When a sockect is disconnected
      socket.on('disconnect', function () {
        log('debug', 'Socket id [' + socket.id + '] disconnected')
      })

      // When a message is sent
      socket.on('message', function (message) {
        log('debug', 'Socket.io:' + socket.id
                   + ": Message from '" + message.from + '" to "'
                   + message.to + '": ' + message.content)
        send(message.to, message.content)
      })
    })

    // Listening...
    io.listen(socketPort)
    console.log("Socket.io interface ready in port " + socketPort)
  }


  // Extract data from Telegram message (caller, command, arguments...)
  var receiveMessage = function(message){

    if (tgDebugFile) fs.appendFileSync(tgDebugFile, message)
    if (message.toString().indexOf(">>>") <= -1) return null

    // Extracting caller
    message = message.split('\n')[0]
    var slicesA = message.split('>>>')
    var slicesB = slicesA[0].split(']')
    var caller  = slicesA[0].replace(slicesB[0],"").replace(']','')
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
    log('info', parsedMessage.caller + ' >>> Me : ' + parsedMessage.content)
		telegramProcess.stdout.emit('receivedMessage', parsedMessage)
  }

  // __ Public Methods _____________________________________________________

	// Create and launch Telegram cli process
	var create = function(tgBinFile, tgKeysFile, extraOptions) {

    // Checking arguments
    var checkArgs = true
    if (!fs.existsSync(tgBinFile) || !fs.statSync(tgBinFile).isFile()) {
      log('error', 'Simple-Telegram: Telegram-cli binary file is not found [' + tgBinFile + ']')
      checkArgs = false
    }
    if (!fs.existsSync(tgKeysFile) || !fs.statSync(tgKeysFile).isFile()) {
      log('error', 'Simple-Telegram: Telegram keys file is not found [' + tgKeysFile + ']')
      checkArgs = false
    }

    // Running Telegram-cli
    if (checkArgs) {
      var options = ['-Ck', tgKeysFile].concat(extraOptions)
  		telegramProcess = require('child_process').execFile(tgBinFile, options)
  		telegramProcess.stdout.on('data', receiveMessage) // Receiving message
      log('debug', 'Simple-Telegram: Telegram-cli proccess is running')
      log('debug', 'Simple-Telegram: Waiting messages...')
    }
	}

	// Send Message to someone in Telegram
  var send = function(target, message, logLevel) {

    // Checking if message contains something
		if (!message) return

    // Checking if Telegram-cli is running
    if (!telegramProcess) {
      log('error', 'Simple-Telegram: Error sending message. Telegram-cli proccess is not running')
      return
    }

    // if target contains something...
		if (target) {

      // Replacing blancks in target and some special characters in message
	    target  = target.replace(' ','_')
			var newline = message.indexOf("\n")
			while (newline != -1) {
				message = message.replace("\n", "\\n")
				newline = message.indexOf("\n")
			}

      // Checkin log level
      var level = (logLevel || 'info')

      // Sendind message to Telegram-cli process
      log(level, 'Me >>> ' + target + ' : ' + message)
	    telegramProcess.stdin.write('msg ' + target + ' "' + message + '"' + '\n', encoding='utf8')
		}
  }

  // Set telegram debug logfile
  var setTelegramDebugFile = function(filename) { tgDebugFile = filename }

  // Set socket.io port
  var setSocketPort = function(port) {
    socketPort = port
    setSocketIo()
  }

  // Getters and Setters
	var getProcess = function()  { return telegramProcess }

  // Add logger to array
  var addLogger = function(logger) { loggers.push(logger) }

  // Remove logger from array
  var removeLogger = function(logger) {
    var idx = loggers.indexOf(logger)
    if (idx != -1) loggers.splice(idx, 1)
  }

  // Exit
  var quit = function() {
    //if (io) io.removeAllListeners()
    if (telegramProcess) {
      log('info', "Exitting from Telegram")
      telegramProcess.stdin.write('safe_quit' + '\n')
    }
  }

  // __ Return _____________________________________________________________

  return { "create": create
				 , "send": send
         , "setTelegramDebugFile": setTelegramDebugFile
         , "setSocketPort": setSocketPort
         , "getProcess": getProcess
         , "addLogger" : addLogger
         , "removeLogger" : removeLogger
         , "quit": quit
				 }
}

module.exports = SimpleTelegram
