// namespace our plugin
(function($) {
  
  // 
  $.fn.spwWidgetize = function(opts) {
    // start of plugin code
    var defaults = {
      // fetch straight from Google docs in JSON
      url: 'http://spreadsheets.google.com/feeds/list/0AgwxfJ2RdQrudDVKTl9aNHhVQlU1blFHcC1sZHhBOEE/2/public/basic?alt=json',
      auto_measurement_key: 'emailsSent',
      manual_measurement_key: 'manualMeasurement',
      target_key: 'target',
      measurement_text_key: 'measurementText',
      debug: false,
      template_html: "\
        <div id='measurement-text'><%= total %> <%= measurement_text %></div> \
        <div id='progress-total'> \
          <div id='progress-bar' style='width: <%= progress_width %>px;'></div> \
        </div> \
        <div id='stats'><span class='base-stat>0</span> <span class='target-stat><%= target %></span></div> \
      ",
    }
    // merge the opts with the defaults, overwriting the defaults
    opts = $.extend(true, defaults, opts);
    
    $container = this;
    
    // Add the CSS to the head, this is for testing.
    if(opts.debug){
      $('head').append('\
        <style type="text/css"> \
          #progress-total{ width: 100%; height: 50px; background: #AAA;} \
          #progress-bar{ width: 0; height: 50px; background: #CCC;} \
        </style> \
      ');
    }
    
    $.ajax({
      url: opts.url,
      dataType: 'jsonp',
      success: function(remote_data) {
        // sort out the data in to something useable
        var data = {};
        $(remote_data.feed.entry).each(function(idx, row) {
          if(row.title.$t == opts.auto_measurement_key || row.title.$t == opts.manual_measurement_key || row.title.$t == opts.target_key || row.title.$t == opts.measurement_text_key){
            data[row.title.$t] = row.content.$t.replace("value: ", "");
          }
          if(opts.debug){
            $("#"+row.title.$t).text(row.content.$t.replace("value: ", ""));
          }
        });
        
        // calculate progress
        data['total'] = parseInt(data[opts.auto_measurement_key]) + parseInt(data[opts.manual_measurement_key]);
        data['progress'] = parseInt(data['total']) / (parseInt(data[opts.target_key]) / 100);
        var progress_width = $container.width();
        var progress_percent_in_px = (progress_width / 100) * data['progress'];
        
        // render the template
        template_html = template(opts.template_html, {
          total: data['total'],
          measurement_text: data[opts.measurement_text_key],
          progress_width: progress_percent_in_px,
          target: data[opts.target_key],
        });
        $container.html(template_html);
      }
    });
  };
  
  /*
   Templating from underscore.js
   http://documentcloud.github.com/underscore/
   Copyright (c) 2009-2012 Jeremy Ashkenas, DocumentCloud

   Permission is hereby granted, free of charge, to any person
   obtaining a copy of this software and associated documentation
   files (the "Software"), to deal in the Software without
   restriction, including without limitation the rights to use,
   copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the
   Software is furnished to do so, subject to the following
   conditions:

   The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
   OTHER DEALINGS IN THE SOFTWARE.
  */
  var noMatch = /.^/;
  var unescape = function(code) {
    return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
  };
  
  var template = function(str, data) {
    var c  = {
      evaluate    : /<%([\s\S]+?)%>/g,
      interpolate : /<%=([\s\S]+?)%>/g,
      escape      : /<%-([\s\S]+?)%>/g
    };
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape || noMatch, function(match, code) {
           return "',_.escape(" + unescape(code) + "),'";
         })
         .replace(c.interpolate || noMatch, function(match, code) {
           return "'," + unescape(code) + ",'";
         })
         .replace(c.evaluate || noMatch, function(match, code) {
           return "');" + unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    if (data) return func(data, function(obj) { return new wrapper(obj); });
    return function(data) {
      return func.call(this, data, function(obj) { return new wrapper(obj); });
    };
  };
})(jQuery);