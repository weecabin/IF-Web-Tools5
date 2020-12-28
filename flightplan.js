const myxml = require("./myxml")

/*
Supports the creation of a flightplan, and the generation of an
Infinite Flight XML compatible plan
Currently only supports USER WAYPOINTS
*/

const Node = myxml.Node;

var printHold = ""
const print = (msg) => {
  printHold+=msg;
}
const println = (msg) => {
  console.log(printHold+msg);
  printHold="";
}

class FlightPlan
{
  constructor(name)
  {
    this.Name=name;
    this.Fp = new Node("flight-plan",name, "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www8.garmin.com/xmlschemas/FlightPlan/v1\"");
    this.WaypointTable = new Node("waypoint-table","");
    this.RouteTable = new Node("route","");
    this.Fp.AddChild(this.WaypointTable);
    this.Fp.AddChild(this.RouteTable);
  }
  /*
  id = The text string associated with the fix
  lat/lon = decimal latitude and longitude, where 
            North latitude is positive, and south is negative
            East longitude is positive and west is negative
  elevation = elevation in feet. will be converted to meters 
              if not specified, the element won't be generated
  */
  AddUserFix(id,lat,lon,elevation)
  {
    if (!this.WaypointTable.Exists("identifier",id))
    {
      var wp = new Node("waypoint","");
      this.WaypointTable.AddChild(wp);
      wp.AddChild(new Node("identifier",id));
      wp.AddChild(new Node("type","USER WAYPOINT"));
      wp.AddChild(new Node("lat",lat));
      wp.AddChild(new Node("lon",lon));
      if (elevation!=undefined)
        wp.AddChild(new Node("elevation",(elevation/3.28084).toFixed(2)))
    }
    var rt = new Node("route-point","");
    this.RouteTable.AddChild(rt);
    rt.AddChild(new Node("waypoint-identifier",id));
    rt.AddChild(new Node("waypoint-type","USER WAYPOINT"));
  }
  ToXml()
  {
    return this.Fp.ToXML();
  }
}

module.exports.Node = Node;
module.exports.FlightPlan = FlightPlan;