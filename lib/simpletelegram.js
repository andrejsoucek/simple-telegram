/* ___________________________________________________________________________

  Module: simpletelegram.js   Version: v0.0.7
	Repository: http://github.com/GuillermoPena/obedience
  Author: Guillermo Peña (guillermo.pena.cardano@gmail.com)
  Last update: 10/05/2015

  Simple-Telegram object (Telegram communicator object)

  __________________________________________________________________________*/

function SimpleTelegram() {

  // __ Modules ____________________________________________________________

  var fs = require('fs')

	// __ Properties _________________________________________________________

  var telegramProcess // Telegram cli process
  var logger          // Logger object
  var tgLogFile       // Telegram log file

  // __ Private Methods ____________________________________________________

  // Extract data from Telegram message (caller, command, arguments...)
  var receiveMessage = function(message){

    if (tgLogFile) fs.appendFileSync(tgLogFile, message)
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
    logger.info(parsedMessage.caller + ' >>> Me : ' + parsedMessage.content)
		telegramProcess.stdout.emit('receivedMessage', parsedMessage)
  }

  // __ Public Methods _____________________________________________________

	// Create and launch Telegram cli process
	var create = function(tgBinFile, tgKeysKile, loggerObj, logfile, extraOptions) {

    // Setting loggers
    tgLogFile = logfile
    if (!logger) logger = (loggerObj || console)

    // Checking arguments
    var checkArgs = true
    if (!fs.existsSync(tgBinFile) || !fs.statSync(tgBinFile).isFile()) {
      logger.error('Simple-Telegram: Telegram-cli binary file is not found [' + tgBinFile + ']')
      checkArgs = false
    }
    if (!fs.existsSync(tgKeysKile) || !fs.statSync(tgKeysKile).isFile()) {
      logger.error('Simple-Telegram: Telegram keys file is not found [' + tgKeysKile + ']')
      checkArgs = false
    }

    if (checkArgs) {
      var options = ['-Ck', tgKeysKile].concat(extraOptions)
  		telegramProcess = require('child_process').execFile(tgBinFile, options)
  		telegramProcess.stdout.on('data', receiveMessage) // Receiving message
      logger.log('debug', 'Simple-Telegram: Telegram-cli proccess is running')
      logger.log('debug', 'Simple-Telegram: Waiting messages...')
    }
	}

	// Send Message to someone in Telegram
  var send = function(target, message, logLevel) {

		if (!message) return
    if (!telegramProcess) {
      logger.error('Simple-Telegram: Error sending message. Telegram-cli proccess is not running')
      return
    }

		if (target) {
	    target  = target.replace(' ','_')
			var newline = message.indexOf("\n")
			while (newline != -1) {
				message = message.replace("\n", "\\n")
				newline = message.indexOf("\n")
			}
      var level = (logLevel || 'info')
      logger.log(level, 'Me >>> ' + target + ' : ' + message)
	    telegramProcess.stdin.write('msg ' + target + ' "' + message + '"' + '\n', encoding='utf8')
		}
  }

  // Getters and Setters
	var getProcess = function()  { return telegramProcess }

  // Change logger object
  var setLogger = function(loggerObj) { logger = loggerObj }

  // Exit
  var quit = function() {
    if (telegramProcess) {
      logger.info("Exitting from Telegram")
      telegramProcess.stdin.write('safe_quit' + '\n')
    }
  }

  // __ Return _____________________________________________________________

  return { "create": create
				 , "send": send
         , "getProcess": getProcess
         , "setLogger" : setLogger
         , "quit": quit
				 }
}

module.exports = SimpleTelegram
