var SimpleTelegram = require('/home/guiller/code/simple-telegram/lib/simpletelegram.js')
var stg = new SimpleTelegram()

// Replace next values to your own paths
var tgBinFile  = "/home/guiller/code/obedience/bin/telegram-cli"
var tgKeysFile = "/home/guiller/code/obedience/bin/tg-server.pub"

// Creating simpleTelegram object
stg.create(tgBinFile, tgKeysFile)

// Sending Message
setTimeout(function() {
  stg.send("Guillermo", "Hi!")
  setTimeout(function() { stg.quit() }, 5000)
}, 5000)
