var mx = require('./xmlFlightplan')

// pads a number out to count characters with padChar
function pad(numToPad,padChar,count)
{ 
  var numlen = (numToPad+"").length;
  if (numlen>count)
    return numToPad;
  var positive = true;
  if (numToPad <0)
  {
    positive=false;
    numToPad*=-1;
  }
  var numstr= numToPad.toString();
  for(i=numlen;i<count;i++)
    numstr=padChar+numstr;
  if (!positive)
    numstr="-"+numstr;
  return numstr;
}

// returns the turn required from one heading to another
function TurnAngle(fromHeading,toHeading)
{ 
  var f = FixHeading(fromHeading);
  var t = FixHeading(toHeading);
  var a = AngleBetween(t,f);
  var plusa = FixHeading(f+a)-t;
  var minusa = FixHeading(f-a)-t;
  //println("plusa="+plusa+" minusa="+minusa);
  if (Math.abs(plusa) < Math.abs(minusa))
    return a;
  else
    return -a;
}

// returns the angle between two headings
function SmallestAngleBetween(from,to)
{
  var sa = AngleBetween(from,to);
  if (sa > 90)
    sa = Math.abs(sa-180);
  return sa
}

// returns the angle between two headings
function AngleBetween(heading1,heading2)
{
  var h1=FixHeading(heading1);
  var h2=FixHeading(heading2);
  var delta=h1>h2?h1-h2:h2-h1;
  if (delta>180)
    delta=360-delta;
  //println("heading1="+heading1+" heading2="+heading2);
  //println("fxedheading1="+h1+" fixedheading2="+h2+" delta="+delta);
  return delta;
}

// returns degrees minutes (DDDMM) given decimal degrees (DD.dd)
function ToDegMin(num)
{
  var deg = Math.trunc(num);
  var min = Math.round(60*(num-deg));
  
  if (Math.abs(min)==60)
  {
    min=0;
    if (num < 0)
    {
      deg=deg-1;
    }
    else
    {
      deg=deg+1;
    }
  }
  
  /*
  println("debug ToDegMin")
  println("num="+num+" deg="+deg+" min="+min);
  println("end debug")
  */
  return deg*100 + min;
}

// converts lat lon in decimal degrees to DDMM[N/S]/DDDMM[E/W] format IF uses and prints the result
// lat is always entered as N (S is negative)
// lon is entered as E (west is negative)
function ToIF(latitude,longitude)
{
  if (latitude<0)
  {
    print(ToDegMin(latitude*-1));
    print('S/');
  }
  else
  {
    print(ToDegMin(latitude));
    print('N/');
  }
 
  if (longitude <0)
  {
    print(ToDegMin(longitude*-1));
    print('W');
  }
  else
  {
    print(ToDegMin(longitude));
    print('E');
  }
}

// returns a longitude scaling factor for the given latitude. 
function LonMultiplier(latitude)
{
  return 1/Math.sin((90-latitude)*Math.PI*2/360);
}

// small headings around 0 are returned as 0
// headings larger than 360 are reduced to a value less than 360
// negative headings are converted to a positive number
function FixHeading(fixthis)
{
  var h = fixthis;
  if (Math.abs(h) < .1) 
    return 0;
  if ((Math.abs(h) / 360) >= 1)
    h = h % 360;
  if (h < 0)
  {
    return 360 + h;
  } 
  return h;
}

// debug print “label:number “
function MyPrint(label, number)
{
  print(label);
  print(': ');
  print(number);
}

function MyPrintf(label, number, length, decimals)
{
  print(label);
  print(': ');
  print(format(number,length,decimals)+"\n");
}

// given latitude and longitude (decimal degrees) heading and leg length, returns lat lon at the end of the leg
function NewPoint(latitude,longitude,heading,leglength)
{
  var lonScale = LonMultiplier(latitude);
  //var scsle = lonScale;
  var alpha = Math.PI * 2 * (90 - heading)/360;

  var dx = lonScale * leglength * Math.cos(alpha);
  var deltaLon = dx / 60;
  var newLon = longitude + deltaLon;

  var dy = leglength * Math.sin(alpha);
  var deltaLat = dy / 60;
  var newLat = latitude + deltaLat;
  
  /*
  console.log();
  console.log("NewPoint debug");
  console.log("heading="+heading+" legLength="+leglength);
  console.log("lat="+latitude+" lon="+longitude);
  console.log("dlat="+deltaLat+" dlon="+deltaLon);
  console.log("dy="+dy+" dx="+dx);
  console.log("newLat="+newLat+" newLon="+newLon)
  console.log("end debug")
  */
  return [newLat,newLon];
}

function DistHeading(latfrom,lonfrom,latto,lonto)
{
   var lonMult = LonMultiplier((latfrom+latto)/2);
   var dy = (latto-latfrom)*60;
   var dx = ((lonto-lonfrom) / lonMult)* 60;
  
   var dist = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
   if (dx==0)
      dx = .000001;
   var dyx=dy/dx;
   var angleRadians = Math.atan(dyx);
   var angleDegrees = angleRadians*180/Math.PI;
   var heading = FixHeading(90-angleDegrees); 
   if (dx<0 && dy<0)
      heading = 180+angleDegrees;
   else if (dx<0 && dy>=0)
      heading = 270-angleDegrees;
   
   //println("lonMult="+lonMult+" dx="+dx+" dy="+dy);
   //println("dy="+dy+" dx="+dx+" angleRad="+ angleRadians+" angleDeg="+angleDegrees+" heading="+heading);
   
   return[dist,heading];
}

function HoldPattern(legs,leglen,lat,lon,loops=10)
{
  // turn angle at the end of each leg
  var deltaHeading = 360 / legs;

  // calculate the initial heading and length so that the pattern is
  //centered about the initial fix.
  var initialheading = 90+((180-deltaHeading)/2);

  var initialdistance = (leglen/2)/Math.sin((2*Math.PI*(180-initialheading))/360);

  var fp = new mx.FlightPlan(legs+"leg hold pattern");
  for (loop=0;loop<loops;loop++)
  {
    //console.log(loop)
    // print out the first point
    var fixlen=(legs-1+"").toString().length;
    var firstfix = NewPoint(lat,lon,initialheading,initialdistance);
    fp.AddUserFix("fix"+pad(0,"0",fixlen), firstfix[0], firstfix[1]);

    // print out the remaining points
    var deltaAngle = 360/legs;
    var angle = initialheading + deltaAngle;
    for (leg=0;leg<legs-1;leg++)
    {
      //console.log(angle)
      let fix = NewPoint(lat,lon,angle,initialdistance);
      //console.log(fix[0]+","+fix[1])
      fp.AddUserFix("fix"+pad((leg+1),"0",fixlen),fix[0],fix[1]);
      angle = FixHeading(angle + deltaAngle);
    }
    // back to the first fix to close it off
    fp.AddUserFix("fix"+pad(0,"0",fixlen), firstfix[0], firstfix[1]);
  }
  return fp.ToXml();
}

/*
computes an arc between two fixes given an entry heading.
latlon is enterred as a two dim array for latlon1 and another for latlon2
*/
function Circling(latlon1,latlon2,heading)
{
  var lat0=latlon1[0];
  var lon0=latlon1[1];
  var lat1=latlon2[0];
  var lon1=latlon2[1];

  var points=10;
  println("heading "+heading);
  print("Initial ");
  ToIF(lat0,lon0);
  println(" ");

  print("Final ");
  ToIF(lat1,lon1);
  println(" ");

  var lonscale = LonMultiplier((lat0+lat1)/2);
  //println("LonMultiplier="+lonscale);
  var dx = (lon1-lon0)*lonscale;
  var dy = lat1-lat0;
  //println(dx + "," + dy);

  // find the distance and heading to the final fix
  dh = DistHeading(lat0,lon0,lat1,lon1);
  println("dist="+format(dh[0],8,3) + " heading=" + format(dh[1],7,3));
  var headingToFinal=dh[1];
  var distToFinal=dh[0];
  println("headingToFinal="+ format(headingToFinal,7,3));

  // verify final fix with distance and heading from initial fix
  check = NewPoint(lat0,lon0,headingToFinal,distToFinal);
  println("final from initial given heading and distance..");
  ToIF(check[0],check[1]);
  println();

  // find the arc radius
  alpha = FixHeading(90 - Math.abs(heading - headingToFinal))%360;
  //println("alpha="+alpha)
  var arcR = Math.abs(dh[0]/(2*Math.cos(alpha*Math.PI/180)));
  //println("Arc Radius="+arcR)

  // find lat lon of arc center
  // first determine the direction
  var dir1=heading-90;
  var dir2=heading+90;
  var headingToCenter=dir2;
  var turnLeft=false;
  if (AngleBetween(headingToFinal,dir1)<AngleBetween(headingToFinal,dir2))
  {
    headingToCenter=dir1;
    turnLeft=true;
    println("turning left");
  }
  var arcCenterDec = NewPoint(lat0,lon0,headingToCenter,arcR);
  var initialArcHeading = FixHeading(headingToCenter-180);
  println("headingToCenter="+format(headingToCenter,7,3)+" initialArcHeading="+ format(initialArcHeading,7,3));

  // find swept angle and setup increment
  var headingfixangle=AngleBetween(heading,headingToFinal);
  println("headingfixangle="+ format(headingfixangle,7,3));
  var arcAngle=2*(90-AngleBetween(initialArcHeading,headingToFinal+180));
  if (headingfixangle>90)
  {
    //println("obtuse angle between heading & fix path")
    arcAngle=2*(90+AngleBetween(initialArcHeading,headingToFinal+180));
  }
  else
    println("acute angle between heading & fix path")

  println("arcAngle="+format(arcAngle,7,3));
  var deltaAngle = arcAngle/points;
  var initialArcangle = FixHeading(headingToCenter+180);

  var decPoints = [];
  if (turnLeft)
  {
    var lastAngle = initialArcangle-arcAngle-deltaAngle+1;
    println("initialArcangle ="+ format(initialArcangle,7,3) +" deltaAngle="+format(deltaAngle,7,3)+" lastAngle="+format(lastAngle,7,3))
    for (h= initialArcangle;h>lastAngle;h-=deltaAngle)
    {
      var arcPoint = NewPoint(arcCenterDec[0],arcCenterDec[1],h,arcR);
      decPoints.push(arcPoint);
      ToIF(arcPoint[0],arcPoint[1]);
      print(" ")
    }
  }
  else
  {
    var lastAngle = initialArcangle +arcAngle+deltaAngle-1;
    //println("initialArcangle ="+ format(initialArcangle,7,3) +" deltaAngle="+format(deltaAngle,7,3)+" lastAngle="+format(lastAngle,7,3))
    for (h= initialArcangle;h<lastAngle;h+=deltaAngle)
    {
      var arcPoint = NewPoint(arcCenterDec[0],arcCenterDec[1],h,arcR);
      decPoints.push(arcPoint);
      ToIF(arcPoint[0],arcPoint[1]);
      print(" ")
    }
  }
  //println();

  var fp = new FlightPlan("KSAN Circle");
  println("Decimal fixes...");
  for (index=0;index<decPoints.length;index++)
  {
    var lat = decPoints[index][0].toFixed(4);
    var lon = decPoints[index][1].toFixed(4);
    print(lat+"/"+lon+" ");
    var id = (lat*1000).toFixed(0) +"/"+ (lon*1000).toFixed(0);
    fp.AddUserFix(id,lat,lon);
  }
  return fp.ToXml();
}


module.exports =
{
  DistHeading: DistHeading,
  NewPoint: NewPoint,
  FixHeading: FixHeading,
  ToIF: ToIF,
  ToDegMin: ToDegMin,
  AngleBetween: AngleBetween,
  TurnAngle: TurnAngle,
  pad: pad,
  HoldPattern: HoldPattern
}