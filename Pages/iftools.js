
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
