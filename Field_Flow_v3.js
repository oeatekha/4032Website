// this will store all the weather data
let w;
let particles = [];
let mult = 0.008;
let graphicx = 150;
const noiseScale = 0.01/2;
let clouds = [];
let max_speed = 34;
let tempHighlight = 'black';
let place = null;


// In this weather app, the wind speed is used along with the temperature
// to get an idea of the temperature while taking the wind speed into account
// Density tied to the wind sppeed
// T(wc) = 0.0817(3.71V**0.5 + 5.81 -0.25V)(T - 91.4) + 91.4 
// Wind Angle affects Mult 

// T(wc) is the wind chill, V is in the wind speed in statute miles per 
// hour and T is the temperature in degrees Fahrenheit.





function setup() {
  background(250);
  windowRatio(360, 740);  // use the size of your phone
  let density = 50;

  w = requestWeather('gps', function() {
    print('success');
  }, function(errorMessage) {
    print('error');
    message = errorMessage;
  });
  
  
  w = requestWeather('gps', lookupLocation);
  
  if (w.ready) {
    let speedin = w.getWindSpeed();
    density = map(speedin, 0, 100, 20, 100);
  }
  
  density = 50;
  
  noiseDetail(1);
  let space = rwidth/density;
  angleMode(DEGREES);  // to use degrees with sin() and cos()
  pg = createGraphics(graphicx*2.25, graphicx*2);
  pg.background(250);
  
  
  
  
  

  for (let x = 0; x < graphicx*2; x = x + space) {
    for (let y = 0; y < graphicx*2; y = y + space) {
      var p = createVector(x + random (-8, 9), y + random(-15, 15));
      particles.push(p);
    }
  }
  
  //layer of clouds that are formed above what we already created
  for (let x = 0; x < graphicx*2; x = x + space) {
    for (let y = 0; y < graphicx*2; y = y + space) {
      var p = createVector(x + random (-8, 9), y + random(-15, 15));
      clouds.push(p);
    }
  }



 
  //w = requestHistory(42.3596764, -71.0958358);
  
  

}


function draw() {

  background(250);
  updateRatio();
  textAlign(CENTER, CENTER);
  textSize(30);
  pg.strokeWeight(0.01);
  
  //getCloudCover()
  // okay lets use the cloud cover 0-1 multiply by the total density and thats how many white lines that are drawn
  // because its cloud percentage it can lowkey be drawn over the color multiplied by the length

  
  if (w.ready) {
    // get imthe temperature to show on screen
    let t = w.getTemperature();
    let speed = w.getWindSpeed();
    let angular_direction = 1;
    let direction = w.getWindBearing();

    if (speed != 0) {
      let direction = w.getWindBearing();

      if (direction > 180) {
        angular_direction = -1;
      }

      rotateSpeed =  frameCount * speed/max_speed;    
    }


  
    
  t =  t+30;
  p =  t; // t;
  
  let red_impact = 0;
  let gmax = 255;
  
  
  rmap = p/100*255 + 100; //okay red means hot so if it is larger then we want to get more red. 
  bmap = (255 - p/100*255) + 100 - rmap; // okay if it is blue and its smaller it needs to get bigger
  gmap = 240-rmap/10;
  
  if (t > 70){
   gmap = 0;
   gmax = 10;
  }
  
  gmap = 240-rmap/10 + red_impact*4;
  
  if (1 == 0) {
    // If cloudy then 
    rmap = 245;
    bmap = 255;
    gmap = 250;
    
    tempHighlight = 'black';
  }
  
  let densityfactor = 1;
  if(speed/34 < 0.1){
    densityfactor = 0.75;
  }
  
  for (var i = 0; i < particles.length*densityfactor; i++) {
 
    let r = map(particles[i].x, 0, rwidth, rmap, 255);
    let g = map(particles[i].y, 0, rheight, gmap, gmax);
    let b = map(particles[i].x, 0, rwidth, 255, bmap);
    pg.fill(r, g, b);

    let angle = map(noise(particles[i].x * mult, particles[i].y * mult), 0, 1, 0, (direction)*1.25); //remove direction multiplier
    particles[i].add(createVector(cos(angle), sin(angle)));

    if (dist(graphicx, graphicx, particles[i].x, particles[i].y) < graphicx) {
      pg.ellipse(particles[i].x, particles[i].y, 1);
    }
  
  }
  
  
  // wind factor
  for (var h = 0; h < int(particles.length*w.getCloudCover()); h++) {
 
    
    pg.fill(210);

    let angle = map(noise(particles[h].x * mult, particles[h].y * mult), 0, 1, 0, (direction)*1.25); //remove direction multiplier
    particles[h].add(createVector(cos(angle), sin(angle)));

    if (dist(graphicx, graphicx, particles[h].x, particles[h].y) < graphicx) {
      pg.ellipse(particles[h].x, particles[h].y, 1);
    }
  
  }
  
  // perticipation factor will be added
  
  image(pg, rwidth/2-graphicx, 45+rheight/2-graphicx);

  
  
  
  // get the temperature, round it, and add the degree symbol
  textSize(12);
  fill(200);
  //stroke();
  let readout = formatDegrees(w.getTemperature());
  let forecastTime = w.getTime();
  // show the time at the bottom of the screen
  textAlign(LEFT);
  text("Today, "+ forecastTime.hourMinuteLong(), rwidth/8, 60);
  textStyle(BOLD);
  text(w.getSummary(), rwidth/8, 80);
  textStyle(NORMAL);
  line(rwidth/8, 100, rwidth*7/8, 100);
  
  textAlign(RIGHT);

  //text("Weather", rwidth*7/8, 60);
  textStyle(BOLD);
  //text(w.data.latitude + ', ' + w.data.longitude, rwidth*7/8, 120);
  
  textStyle(NORMAL);
  if (place != null) {
      text(place.city + ', ' + place.state_short, rwidth*7/8, 60);
  }
  
  textStyle(NORMAL);
  
  // show the temperature in degrees
  
  textAlign(LEFT);
  fill(80);
  textSize(28);
  text(round(speed, 1), rwidth*1/8, 160);
  textSize(12);
  text("mph", rwidth*1/8, 185);
  
  textAlign(RIGHT);
  textSize(28);
  text(round(t), rwidth*7/8, 160);  
  textSize(12);
  text("Fahrenheit ", rwidth*7/8, 185);
  textSize(12);
  fill(210);
  
  
  //textSize(28);
  //text(speed + " mph", rwidth*6/8, 175);
  //textSize(12);
  
  
  if (t < 50 && speed > 3){
    
    let wc = 35.74 + 0.6215*int(t) - 35.75*(int(speed)^0.16) + 0.4275*t*(int(speed)^0.16);
    textStyle(BOLD);
    fill(210);
    //text("Wind Chill " + int(wc) + "° F", rwidth*7/8, 205);
    textStyle(NORMAL);
    
    
  }
  
  fill(0);
  
  textSize(12);
  textAlign(CENTER);
  //textStyle(BOLD);
  
  if(speed != 0){
    let speed_summary = "";
    
    if (speed <= 5){
      speed_summary = "Calm Winds";
    }
    
    if ( 5 < speed && speed <= 11){
      speed_summary = "Gentle Breeze";
    }
    
    if ( 11 < speed && speed <= 20){
      speed_summary = "Moderate Breeze";
    }
    if ( 20 < speed && speed <= 30){
      speed_summary = "Strong Breeze";
    }
    if ( 30 < speed && speed <= 50){
      speed_summary = "Strong Gale";
    }
    if ( 50 < speed && speed <= 100){
      speed_summary = "Violent Gale. Go inside.";
    }
    
    textStyle(BOLD);
    //textStyle(CENTER);
    textAlign(RIGHT);
    fill(210);
    text(speed_summary , rwidth*7/8, 80);
    textStyle(NORMAL);
  }
  
  fill(255);
  line(rwidth/8, 675, rwidth*7/8, 675);
  //The Wind is Currently Moving at 184 
  // Degrees, at 5.8 Mph.

    
  } 
  
  else {
    text('Loading…', rwidth/2, rheight/2);
  }
}


function lookupLocation() {
  // when the weather data is available, request the name of the location
  requestLocation(w.data.latitude, w.data.longitude, locationArrived, locationError);
}


// this function will run as soon as the location data arrives 
function locationArrived(data) {
  // the 'data' returned is fairly complicated, so parseLocation()
  // identifies common identifiers for US addresses
  place = parseLocation(data);
}


// this function will run if there's a problem getting the location data
function locationError(data) {
  message = 'Error';
}
