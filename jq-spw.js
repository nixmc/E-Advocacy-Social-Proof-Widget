// namespace our plugin
(function ($) {

  $.fn.spwWidgetize = function (url, opts) {
    // start of plugin code
    var defaults = {
      auto_measurement_key: 'emailsSent',
      manual_measurement_key: 'manualMeasurement',
      target_key: 'target',
      measurement_text_key: 'measurementText',
      debug: false,
      min_arrow: 3,
      template_html: " \
      <div id='widget-wrapper'> \
				<h4><span class='widget-header-total'><%= total %></span> <span class='header-text'><%= measurement_text %></span></h4> \
				<span id='widget-progress-arrow' style='left: <%= progress_arrow_position %>px;'></span> \
				<span id='widget-progress-value' style='width: <%= progress_width %>px;'></span> \
				<div id='widget-progress-meter'> \
				</div> \
				<h5><span class='widget-footer-base'>0</span><span class='widget-footer-target'><%= target %></span></h5> \
			</div> \
      ",
      base_figure: 30000,
      base_figure_text: "30,000+"
    }, $container = this;

    // merge the opts with the defaults, overwriting the defaults
    opts = $.extend(true, defaults, opts);
    opts.url = url;

    // Add the CSS to the head, this is for testing.
    if (opts.debug) {
      $('head').append('\
        <style type="text/css"> \
          #progress-total{ width: 100%; height: 50px; background: #AAA;} \
          #progress-bar{ width: 0; height: 50px; background: #CCC;} \
          #widget-wrapper { background: url("images/progress-bg.png") no-repeat scroll left top transparent; display: block; height: 130px; position: relative; top: 26px; width: 500px; color: #FFF; font-family: helvetica, ariel, sans-serif; } \
          #widget-progress-arrow { background: url("images/progress-arrow.png") no-repeat scroll left top transparent; display: block; height: 11px; position: absolute; top: 75px; width: 21px; } \
          #widget-progress-value { background: none repeat scroll 0 0 #EC008C; display: block; height: 10px; left: 0; position: absolute; top: 91px; z-index: 0; } \
          #widget-progress-meter { background: url("images/progress-meter.png") no-repeat scroll left top transparent; height: 16px; left: 0; position: absolute; top: 89px; width: 500px; } \
          #widget-wrapper h4 { padding: 10px; } \
          #widget-wrapper h4 span.widget-header-total { font-size: 30px; text-align: center; display: block; clear: right;} \
          #widget-wrapper h4 span.header-text { text-align: center; display: block;} \
          #widget-wrapper h5 { position: relative; top: 10px; color: #000; font-size: 20px; } \
          #widget-wrapper h5 span.widget-footer-target { float: right; } \
        </style> \
    ');
    }
    
    var default_template = function(){
      var progress = 0,
        progress_width = $container.width(),
        progress_percent_in_px =  (progress_width / 100) * progress,
        progress_arrow_position = progress_percent_in_px > opts.min_arrow + 10 ? parseInt(progress_percent_in_px - 11, 10) : 3,
      // render the template
        template_html = template(opts.template_html, {
          total: 0,
          measurement_text: data[opts.measurement_text_key],
          progress_arrow_position: progress_arrow_position,
          progress_width: progress_percent_in_px,
          target: data[opts.target_key]
        });
      $container.html(template_html);
    }

    $.ajax({
      url: opts.url,
      dataType: 'jsonp',
      timeout : 10000,
      statusCode: {
        400: function() {
          default_template();
        },
        404: function(){
          default_template();
        },
        500: function(){
          default_template();
        }
      },
      error: function(errormessage){
        default_template()
      },
      success: function (remote_data) {
        var data = {}, progress_width, progress_percent_in_px, progress_arrow_position, template_html;
        
        // sort out the data in to something useable
        $(remote_data.feed.entry).each(function (idx, row) {
          if (row.title.$t === opts.auto_measurement_key || row.title.$t === opts.manual_measurement_key || row.title.$t === opts.target_key || row.title.$t === opts.measurement_text_key) {
            data[row.title.$t] = row.content.$t.replace("value: ", "");
          }
          if (opts.debug) {
            $("#" + row.title.$t).text(row.content.$t.replace("value: ", ""));
          }
        });

        // calculate progress
        data.total = parseInt(data[opts.auto_measurement_key], 10) + parseInt(data[opts.manual_measurement_key], 10);
        // error checking
        data.total = isNaN(data.total) ? opts.base_figure : data.total;
        data.progress = parseInt(data.total, 10) / (parseInt(data[opts.target_key], 10) / 100);
        
        data.total = data.total === opts.base_figure ? opts.base_figure_text : data.total;
        console.log(data.total);
        
        progress_width = $container.width();
        progress_percent_in_px =  (progress_width / 100) * data.progress;
        progress_arrow_position = progress_percent_in_px > opts.min_arrow + 10 ? parseInt(progress_percent_in_px - 11, 10) : 3;

        // render the template
        template_html = template(opts.template_html, {
          total: data.total,
          measurement_text: data[opts.measurement_text_key],
          progress_arrow_position: progress_arrow_position,
          progress_width: progress_percent_in_px,
          target: data[opts.target_key]
        });
        $container.html(template_html);
      }
    });

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
    
    // finally return 'this' so we can chain
    return this;
  };
})(jQuery);