

/**
  This is a modified Node.js script
  utilizing my Node and FlightPlan classes to generate an XML flightplan and save it to a file.
  I was just trying to figure things out, so there was a lot of back and forth.
  I need to go back and look at error handling. 
*/

var ask = require ('./qryGoogle')
var askhttps = require('./httpsQuery')
var mx = require('./xmlFlightplan')
const readline = require('readline')
const strings = require('./strings')
const colors = require('colors/safe') 
const fs = require("fs")
const ff = require("./FlightFunctions")

colors.enable()

var printHold = ""
const print = (msg) => {
  printHold+=msg;
}
const println = (msg) => {
  console.log(printHold+msg);
  printHold="";
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})
const apfilename="../../Database/MyAirports.json"
const jsonString = fs.readFileSync(apfilename)
var myAirports = JSON.parse(jsonString)

var search = [
  ['https://www.airnav.com/airport/'],
  ['https://flightplandatabase.com/airport/'],
  ['https://www.airport-data.com/world-airports/']
  ];
  
const searchTags = 
[
  [
  [1,"Lat/Long"],
  [2,"<BR>"],
  [3,"<BR>"]
  ],
  
  [
  [1,"JSON.parse"],
  [1,"\"lat\":"],
  [1,",\"mag"]
  ]
]

const replacestrings =
[
  ["",""],
  ["\"lon\":",""]
]
var srchStringIndex =1;
/*
var response="KSFO";
var latlon ="";
var legs="5";
var length="50";
var radius="50";
var loops="10";
var icao="KSAN";
*/
rl.on('line', (line) => 
{
  var rsp = line.replace(/\0/g, '');
  //print("Entering response handler with: "+rsp)
  if (rsp.length>0)
    response=rsp; 
  //print("response = "+response);
  var splitcmd= rsp.toUpperCase().replace(")",",").replace("(",",").split(",")
  //console.log(parsedcmd)
  var cmd = splitcmd[0]
  var icao = splitcmd[1]
  //console.log("cmd="+cmd+" icao="+icao)
  var waitingForResponse=false;
  var url = search[srchStringIndex]+icao
  //console.log(url)
  switch (cmd)
  {
    case "LATLON":
    println("Executing LATLON")
    var latlon = GetLatLong(icao)
    if (latlon.length!=0)
    {
      console.log(latlon)
    }
    else
    {
      println(icao+" not found")
    }
    process.stdout.write(strings.optionprompt)
    break;
    
    case "HOLD1":
    println("Executing "+rsp)
    //print(icao+","+legs+","+length+","+loops)
    legs = splitcmd[2]
    length = splitcmd[3]
    loops = splitcmd[4]
    var latlon = GetLatLong(icao)
    if (latlon.length!=0)
    {
      HoldLegLen(latlon,icao,legs,length,loops)
    }
    else
    {
      println(icao+" not found")
      process.stdout.write(strings.optionprompt)
    }
    break;
    
    case "HOLD2":
    println("Executing "+rsp)
    //print(icao+","+legs+","+length +","+loops)
    legs = splitcmd[2]
    radius = splitcmd[3]
    loops = splitcmd[4]
    var latlon = GetLatLong(icao)
    if (latlon.length!=0)
    {
      HoldRadius(latlon,icao,legs,radius,loops)
    }
    else
    {
      println(icao+" not found")
      process.stdout.write(strings.optionprompt)
    }
    break;
    
    case "HOLD3":
    println("Executing "+rsp)
    var lat = splitcmd[1]
    var lon = splitcmd[2]
    legs = splitcmd[3]
    length = splitcmd[4]
    loops = splitcmd[5]
    //println("Executing HoldPattern("+legs+","+length+","+lat+","+lon+","+loops+")")
    var  xmlfp = ff.HoldPattern(Number(legs),Number(length),Number(lat),Number(lon),Number(loops))
    //print(xmlfp)
    var filename = FpPath('test.fpl');
    fs.writeFile(filename, xmlfp , function (err) {
      if (err) throw err;
      println(filename+ ' Replaced!');
      //process.stdout.write(strings.optionprompt)
    });
    break;
    
    case "CIRCLE":
    //rsp="CIRCLING(23,116,24,116.1,90)"
    //CIRCLE(lat1,lon1,lat2,lon2,entryHeading)
    let cmd = cmdParts(rsp,",");
    //println(cmd);
    let fix1 = [cmd[1],cmd[2]]
    let fix2 = [cmd[3],cmd[4]]
    let circxml = ff.Circling(fix1,fix2,Number(cmd[5]))
    //println(circxml)
    var filename = FpPath('Circling.fpl');
    fs.writeFile(filename, circxml , function (err) {
      if (err) throw err;
      println(filename+ ' Replaced!');
      process.stdout.write(strings.optionprompt)
    });
    break;

    case "XML":
    println("Executing XML Test")
    //println(replacestrings[srchStringIndex])
    var xml = new mx.Node("Root","","this=\"is an attribute\"")
    var l1 = xml.AddChild(new mx.Node("Level1","L1Value"))
    var l2 = l1.AddChild(new mx.Node("Level2","L2Value"))
    println(xml.ToXML())
    process.stdout.write(strings.optionprompt)
    break;
    
    case "FP":
    println("Executing FLIGHTPLAN")
    var fp = new mx.FlightPlan("KSAN")
    fp.AddUserFix("fix1",23.1234,-116.1234)
    fp.AddUserFix("fix2",24.1234,-117.1234)
    fp.AddUserFix("fix1",23.1234,-116.1234)
    fp.AddUserFix("fix2",24.1234,-117.1234)
    var xmlfp = fp.ToXml();
    println(xmlfp)
    process.stdout.write(strings.optionprompt)
    break;

    case "UPDATE":
    let exists = myAirports.filter(element=>element.icao==icao)
    if (exists.length>0)
    {
      println(icao+" is already in the database")
      process.stdout.write(strings.optionprompt)
    }
    else
    {
      //println(url)
      askhttps.getContent(url)
        .then((html)=>{
          //console.log(html)
          let latlon = UpdateAirports(html,icao)
          console.log(latlon)
          process.stdout.write(strings.optionprompt)
          }
        )
        .catch((err)=>{
          console.log("Error-failed to load: "+url);
          process.stdout.write(strings.optionprompt)
        })
      }
    break;
    
    default:
    {
      println("Err: cmd not found")
      process.stdout.write("> ");
    }
  }
})

function Occurence(count,mainstr,substr)
{
  var offset=0;
  for (i=0;i<count;i++)
  {
    var n = mainstr.substring(offset).indexOf(substr);
    if (n>0)
    {
      offset+=n+substr.length;
    }
    else
    {
      println ("error");
      return -1
    }
    //print (offset);
    //print(mainstr.substring(offset)) 
  }
  //print ("returning "+offset)
  return offset;
}

function UpdateAirports(htmlString,airportICAO)
{
  //println(xmlString);
  var n = Occurence(searchTags[srchStringIndex][0][0], htmlString, searchTags[srchStringIndex][0][1]);
  //print(n)
  //icao = "";
  if (n>0)
  {
    var sub = htmlString.substring(n,n+300)
    //print(sub);
    let tag1 = searchTags[srchStringIndex][1][1];
    let tag2= searchTags[srchStringIndex][2][1]
    var n1 = Occurence(searchTags[srchStringIndex][1][0],sub,tag1)
    var n2 = Occurence(searchTags[srchStringIndex][2][0],sub,tag2)
    if (n1>0 && n2>0)
    {
      var start =n1+tag1.length;
      latlon = sub.substring(n1,n2-tag2.length);
      latlon = latlon.replace(replacestrings[srchStringIndex][0], replacestrings[srchStringIndex][1])
      //println(response + " Lat/Long = "+latlon);
      var splitlatlon=latlon.split(",")
      if (Math.abs(Number(splitlatlon[0]>90)) ||  Math.abs(Number(splitlatlon[0]>180)))
      {
        console.log("invalid LatLong");
        return ""
      }
      let nextID=Number(myAirports[myAirports.length-1].id)+1
      myAirports.push({id:nextID,icao:airportICAO,latitude:splitlatlon[0],longitude:splitlatlon[1]})
      var jsonAirports = JSON.stringify(myAirports,null,1)
      fs.writeFileSync(apfilename, jsonAirports)
      return latlon;
    }
  }
  return ""
}

function GetLatLong(icao)
{
  var ap = myAirports.filter(tst=>tst.icao==icao)
  if (ap.length==0)
    return "";
  var ll = ap[0].latitude+","+ap[0].longitude;
  return ll;
}

function FpPath(str)
{
  return strings.Flightplans+"/"+str;
}

function cmdParts(cmdstr,delim)
{
  let str = cmdstr.replace("(",delim).replace(")",delim).split(delim)
  /*
  let parts="";
  for(i=0;i<str.length;i++)
  {
    parts+=str[i];
    if (i!=(str.length-1))
      parts+=",";
  }
  print (parts)
  */
  return str;
}

callback = function(str)
{
  let latlon = GetLatLong(str);
  if (latlon.length>0)
    println(" Lat/Long = "+latlon);
  else
    println("Not Found") 
    process.stdout.write("> ");
}

function HoldLegLen (latlon,icao,legs,length,loops)
{
  if (latlon.length==0)
  {
    println("Lat/Long not found");
    return
  }
  var splitlatlon = latlon.split(",")
  println("latlon="+latlon)
  let lat = splitlatlon[0]
  let lon = splitlatlon[1]
  println("Executing HoldPattern("+legs+","+length+","+lat+","+lon+","+loops+")")
  let  xmlfp = ff.HoldPattern(Number(legs),Number(length),Number(lat),Number(lon),Number(loops))
  //print(xmlfp)
  let fn = icao+" Hold "+legs+" "+length+".fpl"
  let filename = FpPath(fn);
  fs.writeFile(filename, xmlfp , function (err) 
  {
    if (err) throw err;
    console.log(filename+ ' Replaced!');
    process.stdout.write(strings.optionprompt);
  });
 
}

function HoldRadius(latlon,icao,legs,radius,loops)
{
  if (latlon.length==0)
  {
    println("Lat/Long not found");
    return
  }
  var splitlatlon = latlon.split(",")
  println("latlon="+latlon)
  let lat = splitlatlon[0]
  let lon = splitlatlon[1]
  let legangle = Math.PI*2/Number(legs);
  let len = 2*Math.sin(legangle/2)*radius;
  println("Executing HoldPattern("+legs+","+len+","+lat+","+lon+","+loops+")")
  let  xmlfp = ff.HoldPattern(Number(legs),len,Number(lat),Number(lon),Number(loops));
  //print(xmlfp)
  let fn = icao+" HoldRadius "+legs+" "+radius+".fpl"
  let filename = FpPath(fn);
  fs.writeFile(filename, xmlfp , function (err) 
  {
    if (err) throw err;
    console.log(filename+ ' Replaced!');
    process.stdout.write(strings.optionprompt);
  });
}

//print(strings.help)
//print('')
process.stdout.write(strings.optionprompt)
