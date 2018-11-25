app.directive("highcharts", function() {
  return {
    restrict: 'EA',
    scope: {
        "options": "=",
        "data": "="
    },
    link: function(scope, el, attrs) {
        var options = scope.options,
            hc = undefined;
        if (options != undefined) {
            options.chart.renderTo = el[0];
            hc = new Highcharts.Chart(options);
        };
        // watch for data changes and re-render
        scope.$watch('options', function(newVals, oldVals) {
            if (newVals != undefined) {
                // console.log("new Options", newVals); 
                options = newVals;
                options.chart.renderTo = el[0];
                hc = new Highcharts.Chart(options);
            }
        });
        scope.$watch('data', function(newVals, oldVals) {
            if (newVals != undefined && hc != undefined){
                // console.log(newVals); 
                for (var i = newVals.length - 1; i >= 0; i--) {
                    hc.series[i].update(newVals[i], false); 
                }
                hc.redraw();
            }
        });
    }
  };
});