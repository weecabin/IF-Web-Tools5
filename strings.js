const help = 'Tap on the console and insert a host which IP address you would like to resolve (i.e. google.com).'
const prompt = 'Host: '
const result = 'IP address:'
const error = 'Received error with code:'
const latlonprompt = "enter fix1lat,fix1lon,fix2lat,fix2lon,heading: "
const optionprompt = "\nEnter one of the following... \n\
FP\n\
XML\n\
HOLD1(ICAO,legs,length,loops)\n\
HOLD2(ICAO,legs,radius,loops)\n\
HOLD3(lat,lon,legs,length,loops)\n\
CIRCLE(lat1,lon1,lat2,lon2,entryHeading)\n\
LATLON(AirportICAO)\n\
UPDATE(AirportICAO)\n\
> "
const Flightplans = "../../Flightplans"

module.exports = {
  help: help,
  prompt: prompt,
  result: result,
  error: error,
  latlonPrompt: latlonprompt,
  optionprompt: optionprompt,
  Flightplans:Flightplans
}
