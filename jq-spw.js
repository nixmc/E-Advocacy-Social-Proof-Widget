// namespace our plugin
(function($) {
  $.fn.spwWidgetize = function(url, total_key, target_key) {
  
    // set our defaults
    $container = this;
    $container.html("peanuts!");
    
    if(url === "" || typeof(url) === "undefined"){
      // fetch straight from Google docs in JSON
      url = 'http://spreadsheets.google.com/feeds/list/0AgwxfJ2RdQrudDVKTl9aNHhVQlU1blFHcC1sZHhBOEE/2/public/basic?alt=json';
    }
    if(total_key === "" || typeof(total_key) === "undefined"){
      total_key = "totalSignups";
    }
    if(target_key === "" || typeof(target_key) === "undefined"){
      target_key = "target";
    }
    
    $.ajax({
      //url: 'http://query.yahooapis.com/v1/public/yql',
      url: url,
      dataType: 'jsonp',
      success: function(data) {
        console.log(data);
        $container.html(data);
        $(data.feed.entry).each(function(idx, row) {
          console.log(row.title.$t);
          $("#"+row.title.$t).text(row.content.$t.replace("value: ", ""));
        });
      }
    });
  };
})(jQuery);