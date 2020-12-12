const help = 'Tap on the console and insert a host which IP address you would like to resolve (i.e. google.com).'
const prompt = 'Host: '
const result = 'IP address:'
const error = 'Received error with code:'
const latlonprompt = "enter fix1lat,fix1lon,fix2lat,fix2lon,heading: "
const optionprompt = "Enter one ofthe following...\nFP\nXML\nHOLD1(ICAO,legs,length)\nHOLD2(lat,lon,legs,length)\nLATLON(AirportICAO)\n: "

module.exports = {
  help: help,
  prompt: prompt,
  result: result,
  error: error,
  latlonPrompt: latlonprompt,
  optionprompt: optionprompt
}
