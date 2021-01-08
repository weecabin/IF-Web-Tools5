var myAirports;
var myRunways;
function setup()
{
  document.getElementById("status").value="form load complete.";
  var xhttp1 = new XMLHttpRequest();
    xhttp1.onreadystatechange = function() 
    {
      if (this.readyState == 4 && this.status == 200) 
      {
        let jsontext = this.responseText;
        myAirports=JSON.parse(jsontext);
        if (myAirports.length>0)
          println(" Airport database loaded");
      }
    };
    try
    {
      xhttp1.open("GET", "MyAirportsWithAlt.json", true);
      xhttp1.send();
    }
    catch(err)
    {
      document.getElementById("txt").value=err.message;
    }
    
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function() 
    {
      if (this.readyState == 4 && this.status == 200) 
      {
        println("in xhttp2 ");
        let jsontext = this.responseText;
        myRunways =JSON.parse(jsontext);
        println("myRunways.length="+myRunways.length);
        //ValueChanged(document.getElementById("icao"));
        //document.getElementById("runway").value="27";
      }
    };
    try
    {
      xhttp2.open("GET", "RunwayDB.json", true);
      xhttp2.send();
    }
    catch(err)
    {
      document.getElementById("txt").value=err.message;
    }
    if (document.getElementById("title").innerHTML.indexOf("Hold")>0)
      document.getElementById("filename").value="Hold.fpl";
    else
      document.getElementById("filename").value="Circle.fpl";
}

function CircleChanged()
{
  runwaylatlon="";
  document.getElementById("filename").value= "Circle.fpl";
  ClearFlightplan();
  AddStatus("Cleared Flightplan");
  println("in CircleChanged");
}

function RunwaySelected(runway)
{
  document.getElementById("runway").value=runway;
  AddStatus("Runway: "+runway)
}

function HoldValueChanged(object)
{
  AddStatus("HoldValueChanged("+object.id+") = "+object.value);
  println("HoldValueChanged("+object.value+")");
  switch (object.id)
  {
    case "icao":
    //window.alert("in case icao");
    if (object.value.length==4)
    {
      object.value=object.value.toUpperCase();
      LookupLatLon();
      CreateHold();
    }
    else
    {
      AddStatus("Invalid ICAO");
    }
    break;
    
    case "lat":
    case "lon":
    icao="";
    CreateHold();
    break;
    
    case "legs":
    case "radius":
    case "loops":
    CreateHold();
    break;
  }
}

function CircleValueChanged(object)
{
  println("CircleValueChanged("+object.value+")");
  AddStatus("CircleValueChanged("+object.id+") = "+object.value);
  switch (object.id)
  {
    case "icao":
    if (object.value.length==4)
      object.value=object.value.toUpperCase();
    else
      {
        AddStatus("Invalid ICAO");
        return;
      }
    ap=myRunways.filter(x=>x.icao==object.value);
    println(JSON.stringify(ap))
    if (ap[0]!=undefined && ap.length==1)
    {
      let data="<table><tr><th style=\" padding-right:10px\">Runway</th><th style=\" padding-right:30px\">\
      Latitude</th><th>Longitude</th></tr>";
      for(runway of ap[0].rwys)
      {
        data+="<tr><td>"+"<input type=\"button\" value=\""+runway.rwy+"\" \
        onclick=\"RunwaySelected(\'"+runway.rwy+"\')\"></td><td>"+runway.lat+"</td><td>"+runway.lon+"</td></tr>"
      }
      data+="</table>"
      document.getElementById("runwayinfo").innerHTML=data;
      document.getElementById("runway").value=ap[0].rwys[0].rwy;
      AddStatus("ICAO: "+object.value+" Runway: "+ ap[0].rwys[0].rwy);
    }
    else
    {
      document.getElementById("runwayinfo").innerHTML=object.value+" error";
      printl(object.value+" error");
    }
    break;
    
    case "inlat":
    case "inlon":
    case "outlat":
    case "outlon":
    case "heading":
    CircleChanged();
    break;
    
    case "points":
    CircleDownloadFilename();
    MakeCircle();
    break;
  }
}
function ClearFlightplan()
{
  document.getElementById("txt").value="";
}

let icao="";
function LookupLatLon()
{
  document.getElementById("txt").innerHTML="";
  if (myAirports!=undefined)
  {
    icao = document.getElementById("icao").value.toUpperCase();
    if (icao.length==4)
    {
      let ll = GetLatLong(icao);
      if (ll.length>0)
      {
        let llsplit = ll.split(",");
        if (verifyLatLon(llsplit[0],llsplit[1]))
        {
          //document.getElementById("icao").value=icao+" latlon="+ll;
          document.getElementById("lat").value=llsplit[0];
          document.getElementById("lon").value=llsplit[1];
          let llstr= llsplit[0]+","+ llsplit[1];
          return llstr;
        }
      }
      else
      {
        AddStatus(icao+" is not in the database");
        icao="";
      }
    }
    else
    {
      AddStatus("Invalid ICAO");
      icao="";
    }
  }
  else
  {
    AddStatus("No database loaded");
  }
 //window.alert("exiting LookupLatLon");
}

function CircleDownloadFilename()
{
  let runway = document.getElementById("runway").value;
  let dist = document.getElementById("distance").value;
  let radius = document.getElementById("radius").value;
  let fn = "Circle-"+icao+"-"+runway+"-"+dist+"-"+radius+".fpl";
  document.getElementById("filename").value=fn; 
  AddStatus("Download Filename: "+fn);
}

var runwaylatlon="";
/*
SetupCircle
Is called to configure the Circling approach parameters based on the airport configuration.
*/
function SetupCircle()
{
  try{
  // get the airport config details
  icao = document.getElementById("icao").value;
  if(icao.length!=4)throw "Invalid ICAO";
  let runway = document.getElementById("runway").value;
  let dist = document.getElementById("distance").value;
  let radius = document.getElementById("radius").value;
  let ap = myRunways.filter(x=>x.icao==icao);
  if (ap.length==1)
  {
    // get lat and lon for each end of the runway
    let rwy1=ap[0].rwys.filter(x=>RemovePad(x.rwy)==RemovePad(runway));
    if(rwy1==undefined)throw "Invalid Runway";
    let otherend = OppositeRunway(runway);
    println(otherend)
    let rwy2=ap[0].rwys.filter(x=>RemovePad(x.rwy)==RemovePad(otherend));
    // setup runway threshold lat/lon
    let lat1=Number(rwy1[0].lat);
    let lon1=Number(rwy1[0].lon);
    let lat2=Number(rwy2[0].lat);
    let lon2=Number(rwy2[0].lon);
    let elev=Number(myAirports.filter(i=>i==icao).alt);
    runwaylatlon=[lat1,lon1,elev];
    // runway dist and heading
    let disthead=DistHeading(lat1,lon1,lat2,lon2);
    // heading to the end of the circle
    let headingtoend= Number(FixHeading(disthead[1]-180)).toFixed(1);
    println("heading from threshold to end of circle "+headingtoend)
    // lat lon of end of circle
    let circlEnd = NewPoint(lat1,lon1,headingtoend,dist);
    // heading to beginning of circle
    let left=true;
    if (!document.getElementById("lefttraffic").checked)
      left=false;
     
    let headingtobegin=Number(FixHeading(Number(headingtoend)+(left?90:-90))).toFixed(1)
    println("heading to beginning of circle "+headingtobegin)
    // lat lon of the beginning of the circle
    let circleBegin = NewPoint(Number(circlEnd[0]),Number(circlEnd[1]),Number(headingtobegin) ,radius*2)
    // load the computed values into the Circling Parameters
    document.getElementById("inlat").value=circleBegin[0].toFixed(6);
    document.getElementById("inlon").value=circleBegin[1].toFixed(6);
    document.getElementById("outlat").value=circlEnd[0].toFixed(6);
    document.getElementById("outlon").value=circlEnd[1].toFixed(6);
    document.getElementById("heading").value=Math.round(headingtoend);
    
    // change filename to reflect airport configuration
    CircleDownloadFilename();
   
    circlesetup=true;
  }
  else throw "Airport not found";
  }
  catch(err)
  {
    runwaylatlon="";
    AddStatus(err.message);
  }
  ClearFlightplan();
  MakeCircle();
}

/*
MakeCircle
builds the circle based in the Circling Parameters 
*/
function MakeCircle()
{
  let inlat = document.getElementById("inlat").value;
  let inlon = document.getElementById("inlon").value;
  let outlat = document.getElementById("outlat").value;
  let outlon = document.getElementById("outlon").value;
  let heading = document.getElementById("heading").value;
  let points = document.getElementById("points").value;
  try
  {
    println("MakeCircle: "+inlat+","+inlon+","+outlat+","+outlon+","+heading+","+points);
    // if runwaylatlon is defined, we want to terminate the flightplan at the runway threshold
    if (runwaylatlon.length>0)
      xmlData = Circling([inlat, inlon],[outlat, outlon],heading,points,runwaylatlon);
    else
      xmlData = Circling([inlat, inlon],[outlat, outlon],heading,points);
    document.getElementById("txt").value=xmlData;
    AddStatus("New flightplan created");
  }
  catch(err)
  {
    AddStatus(err.message);
  }
 
}

var xmlData="";
/*
CreateHold
creates a hold pattern centerred at the specified lat lon, with the defined radius and number of legs
*/
function CreateHold()
{
  let txt= document.getElementById("txt");
  txt.value="";
  let lat = document.getElementById("lat").value;
  let lon = document.getElementById("lon").value;
  let legs = document.getElementById("legs").value;
  let radius = document.getElementById("radius").value;
  let loops = document.getElementById("loops").value;
  // the Holdpattern function takes leg length instead of radius, so we need to
  // calculate leg length given leg count and radius
  let legangle = Math.PI*2/Number(legs);
  let leglen = 2*Math.sin(legangle/2)*radius;
  
  //HoldPattern(legs,leglen,lat,lon,loops=10)
  AddStatus("Calling HoldPattern("+concat([legs,leglen.toFixed(2),lat,lon,loops],",")+")");
  
  try 
  {
    xmlData= HoldPattern(Number(legs), Number(leglen), Number(lat), Number(lon), Number(loops));
    txt.value=xmlData;
    BuildFilename();
  }
  catch(err) 
  {
    AddStatus(err.message);
  }
}

function Clearicao()
{
   document.getElementById("icao").value="";
   icao="";
   document.getElementById("icao").focus();
   AddStatus("ICAO cleared")
}

function BuildFilename()
{
  let legs = document.getElementById("legs").value;
  let radius = document.getElementById("radius").value;
  let loops = document.getElementById("loops").value;
  let fn="";
  if (icao.length==4)
    fn=concat(["Hold",icao,legs,radius,loops],"_")+".fpl";
  else 
    fn=concat(["Hold",legs,radius,loops],"_")+".fpl";
  document.getElementById("filename").value=fn;
  AddStatus("Filename set to "+fn)
}

function DownloadXML() 
{
  let fn = document.getElementById("filename").value;
  if (fn.toUpperCase().indexOf(".FPL")<3)
  {
    AddStatus("Invalid filename")
    return;
  }
  if (xmlData.length>50)
  {
   
    if (fn.indexOf(".")>=0)
      fn=fn.split(".")[0];
    fn+=".fpl"
    download(fn,xmlData)
    AddStatus(fn+" downloaded");
  }
  else
  {
    AddStatus("Nothing to save");
  }
}

function download(filename, text) 
{

  var element = document.createElement('a');

  element.setAttribute('href', 'data:fpl/plain;charset=utf-8,' + encodeURIComponent(text));

  element.setAttribute('download', filename);
  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();

  document.body.removeChild(element);

}

function concat(arrayofstrings,separator="")
{
  let ret = "";
  let len = arrayofstrings.length;
  for(i=0;i<len;i++)
  {
    ret += arrayofstrings[i];
    if (i<(len-1))
      ret+=separator;
  }
  return ret;
}

// returns lat,lon for the sPecified sirport ICAO
function GetLatLong(icao)
{
  var ap = myAirports.filter(tst=>tst.icao==icao)
  if (ap.length==0)
    return "";
  var ll = ap[0].lat+","+ap[0].lon;
  AddStatus(icao+" latlon: "+ll);
  return ll;
}

function verifyLatLon(latitude,longitude)
{
  if(latitude==undefined || longitude==undefined)
    return false;
  if (Math.abs(latitude)>90)
    return false;
  if (Math.abs(longitude)>180)
    return false;
  return true;
}

function AddStatus(str)
{
  document.getElementById("status").value+="\n"+str
}