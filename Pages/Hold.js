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
