var myAirports;

function setup()
{
  document.getElementById("status").value="form load complete";
  document.getElementById("testid").value="in setup()"
  var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() 
    {
      if (this.readyState == 4 && this.status == 200) 
      {
        let jsontext = this.responseText;;
        myAirports=JSON.parse(jsontext);
        if (myAirports.length>0)
          document.getElementById("status").value = "Airport database loaded"
      }
      else
      {
       /*
       0: request not initialized 
       1: server connection established
       2: request received 
       3: processing request 
       4: request finished and response is ready
       */
        //let txt = document.getElementById("txt");
        //txt.innerHTML+=this.readyState;
      }
    };
    xhttp.open("GET", "MyAirports.json", true);
    xhttp.send();
}

function test()
{
  document.getElementById("txt").innerHTML="";
  if (myAirports!=undefined)
  {
    let icao = document.getElementById("testid").value.toUpperCase();
    if (icao.length==4)
    {
      let ll = GetLatLong(icao);
      if (ll.length>0)
      {
        let llsplit = ll.split(",");
        if (verifyLatLon(llsplit[0],llsplit[1]))
        {
          document.getElementById("testid").value=icao+" latlon="+ll;
          document.getElementById("lat").value=llsplit[0];
          document.getElementById("lon").value=llsplit[1];
          document.getElementById("filename").value="Hold_"+icao+".fpl"
        }
      }
      else
      {
        document.getElementById("testid").value=icao+" is not in the databspase"
      }
    }
    else
    {
      document.getElementById("testid").value=icao+" is an invalid ICAO";
    }
  }
 
}


var xmlData="";

function execute()
{
  let lat = document.getElementById("lat").value;
  let lon = document.getElementById("lon").value;
  let legs = document.getElementById("legs").value;
  let radius = document.getElementById("radius").value;
  let loops = document.getElementById("loops").value;
  let status = document.getElementById("status"); 
  
  let legangle = Math.PI*2/Number(legs);
  let leglen = 2*Math.sin(legangle/2)*radius;
  
  //HoldPattern(legs,leglen,lat,lon,loops=10)
  status.value="Working: "+"HoldPattern("+concat([legs,leglen.toFixed(2),lat,lon,loops],",")+")";
  
  let txt= document.getElementById("txt");
  try 
  {
    xmlData= HoldPattern(Number(legs), Number(leglen), Number(lat), Number(lon), Number(loops));
    txt.value=xmlData;
    let fn=document.getElementById("filename").value;
    //txt.value=fn+"\n";
    let fnsplit=fn.split("."); 
    //txt.value+=fnsplit[0]+" "+fnsplit[1]+"\n"
    let newfn = fnsplit[0]+"_"+legs+"_"+radius+"_"+loops+"."+fnsplit[1];
    //txt.value+=newfn;
    //window.alert(newfn);
    document.getElementById("filename").value=newfn;
  }
  catch(err) 
  {
    document.getElementById("txt").innerHTML = err.message;
  }
 
}

function save() 
{
  let status=document.getElementById("status");
  if (xmlData.length>50)
  {
    let fn = document.getElementById("filename").value;
    if (fn.indexOf(".")>=0)
      fn=fn.split(".")[0];
    fn+=".fpl"
    download(fn,xmlData)
    status.value=fn+" downloaded"
  }
  else
  {
    status.value="Nothing to save";
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
  var ll = ap[0].latitude+","+ap[0].longitude;
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