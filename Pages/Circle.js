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
      SetupCircle();
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
    
    case "runway": 
    case "distance":
    case "radius":
    case "lefttraffic":
    case "righttraffic":
    SetupCircle();
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
  document.getElementById("filename").value= "";
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
  SetupCircle();
  AddStatus("Runway: "+runway)
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
    let elev=Number(myAirports.filter(x=>x.icao==icao)[0].alt);
    AddStatus("Runway Elevation="+elev)
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