function find_location(){
  
  w = requestWeather('gps', function() {
    print('success');
    }, function(errorMessage) {
    print('error');
    message = errorMessage;
  });
  
}
