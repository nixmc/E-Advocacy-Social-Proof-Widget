# Overview
A social proof widget to be used in conjunction with the E-Advocacy platform.

# Usage
    <html>
      <head>
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.js"></script>
        <script type="text/javascript" src="jq-spw.js"></script>
        <script type="text/javascript">
          $(document).ready(function() {
            $('#container').spwWidgetize('http://spreadsheets.google.com/feeds/list/0AgwxfJ2RdQrudDVKTl9aNHhVQlU1blFHcC1sZHhBOEE/2/public/basic?alt=json', {debug: true});
          });
        </script>
      </head>
      <body>
        <div id="container"></div>
      </body>
    </html>
    
Please note that the plugin depends on JQuery.
    
# Options
The plugin takes the following options:

+   **Name:** url

    **Type:** String
    
    **Default:** 'http://spreadsheets.google.com/feeds/list/0AgwxfJ2RdQrudDVKTl9aNHhVQlU1blFHcC1sZHhBOEE/2/public/basic?alt=json'
    
    The url you wish to fetch your data from. This should return JSON!
    
+   **Name:** auto_measurement_key

    **Type:** String
    
    **Default:** 'emailsSent'
    
    The key within the data you wish to use as your automatically updating number.
    
+   **Name:** manual_measurement_key

    **Type:** String
    
    **Default:** 'manualMeasurement'
    
    The key within the data you wish to use as the number you will update manually.
    
+   **Name:** target_key

    **Type:** String
    
    **Default:** 'target'
    
    The key within the data you wish to use as the target figure, the grand total you are aiming for.
    
+   **Name:** measurement_text_key

    **Type:** String
    
    **Default:** 'measurementText'
    
    The key within the data you wish to use as the text above the widget. eg, 'emails sent' or 'signups'
    
    This text will be prefixed with the total number of auto_measurement + target_measurement.
    
+   **Name:** debug

    **Type:** Boolean
    
    **Default:** false
    
    If set to true, a small amount of CSS will be injected into the head section of the html. This will style the widget in a bland way for testing.

    Also, any elements with id's matching keys in the data will be filled with the corresponding data.

        <p>campaignName: <span id="campaignName"></span></p>
        <p>target: <span id="target"></span></p>
        <p>manual: <span id="manualMeasurement"></span></p>
        
    Would be populated as:
    
        <p>campaignName: <span id="campaignName">My Campaign</span></p>
        <p>target: <span id="target">100000</span></p>
        
+   **Name:** min_arrow

    **Type:** Integer

    **Default:** 3

    This is the minimum amount the progress arrow can start at. This is because rounded boxes will cause it to break. See the ascii Diagram below
    
    Broken, value of 0:
    
        |
        \__
        \/
        
    Fixed, greater value, no overlap:
    
        |
        \__
         \/
         
        
+   **Name:** template_html

    **Type:** String
    
    **Default:** 
    
        "<div id='measurement-text'><%= total %> <%= measurement_text %></div> \
        <div id='progress-total'> \
          <div id='progress-bar' style='width: <%= progress_width %>px;'></div> \
        </div> \
        <div id='stats'><span class='base-stat>0</span> <span class='target-stat><%= target %></span></div>"
        
    This snippet of html is parsed by the plugin and injected into the element the widget has been called on.
    
    The following variables wrapped in <%= %> will be replaced with the actual data: total, measurement_text, progress_width, target.
