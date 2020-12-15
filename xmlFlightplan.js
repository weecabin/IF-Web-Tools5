/*
This class is used to generate all Nodes of an XML structure.
Each Node may contain any number of child Nodes.
the structure of the node is as follows...
<name attribute>value</name>
where attribure and value may be null, or not specified
*/

var printHold = ""
const print = (msg) => {
  printHold+=msg;
}
const println = (msg) => {
  console.log(printHold+msg);
  printHold="";
}

class Node
{
  constructor(name,value,attribute)
  {
    this.Name = name; 
    this.Value = "";
    if (typeof(value) != "undefined")
      this.Value = value;
    this.Attribute = "";
    if (typeof(attribute)!="undefined")
      this.Attribute=" "+attribute;
    this.Children=[];
    this.Indent="";
    this.Version = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
  }
  // adds a Node below this Node
  AddChild(childNode)
  {
    childNode.Version="";
    childNode.Indent+=this.Indent+"  ";
    this.Children.push(childNode);
    return childNode;
  }
  // checks for the existance of a Node with the specifed name & value
  // at any level below this node
  Exists(name,value)
  {
    if (this.Name==name && this.Value==value)
      return true;
    var i=0;
    while(i<this.Children.length)
    {
      if (this.Children[i].Exists(name,value))
        return true;
      i++;
    }
    return false;
  }
  // returns a string representing the data below this Node
  ToXML()
  {
    //println("building "+this.Name)
    var ret = this.Version;
    ret += this.BuildElement();
    var i=0;
    while (i<this.Children.length)
    {
       ret += this.Children[i].ToXML();
       i++;
    }
    if (this.Children.length!=0)
      ret+=this.Indent+"</"+this.Name+">\n";
    return ret;
  }
  BuildElement()
  {
    var el = this.Indent+"<"+this.Name+this.Attribute+">"+this.Value;
    if (this.Children.length==0)
      el += "</"+this.Name+">\n";
    else
      el += "\n";
    return el;
  }
}

/*
Supports the creation of a flightplan, and the generation of an
Infinite Flight XML compatible plan
Currently only supports USER WAYPOINTS
*/
class FlightPlan
{
  constructor(name)
  {
    this.Name=name;
    this.Fp = new Node("flight-plan","", "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www8.garmin.com/xmlschemas/FlightPlan/v1\"");
    this.WaypointTable = new Node("waypoint-table","");
    this.RouteTable = new Node("route","");
    this.Fp.AddChild(this.WaypointTable);
    this.Fp.AddChild(this.RouteTable);
  }
  AddUserFix(id,lat,lon)
  {
    if (!this.WaypointTable.Exists("identifier",id))
    {
      var wp = new Node("waypoint","");
      this.WaypointTable.AddChild(wp);
      wp.AddChild(new Node("identifier",id));
      wp.AddChild(new Node("type","USER WAYPOINT"));
      wp.AddChild(new Node("lat",lat));
      wp.AddChild(new Node("lon",lon));
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
