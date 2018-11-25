app.directive('perdayloadcentered', function($rootScope, $window) {
    return {
        restrict: 'EA',
        scope: {
          data: "=",
          curDateIso: "=",
          dateOffset: "=",
          width: "=",
          height: "=",
          redirectUrl: "=",
          nocenter: "="
        },
        link: function(scope, iElement, iAttrs) {
            var margin = {top: 2, right: 2, bottom: 4, left: 2};
            var dateOffset = (typeof scope.dateOffset != 'undefined')? scope.dateOffset : 45;
            var width = (typeof scope.width != 'undefined')? scope.width : 150;
            var height = (typeof scope.height != 'undefined')? scope.height : 30;
            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            console.log(scope);

            var parseDate = d3.time.format("%Y-%m-%d").parse;
            var curDate = parseDate(scope.curDateIso.slice(0, 10));
            var range = [
                d3.time.day.offset(curDate, -dateOffset),
                d3.time.day.offset(curDate, ((typeof scope.nocenter != "undefined" && scope.nocenter)? 1 : +dateOffset) )
            ];
            console.log(range);

            var x = d3.time.scale().range([0, width], .2).domain(range);
            var widthBar = x(d3.time.day.offset(range[0], +1)) - x(range[0]) -1
            var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.monday, 1).tickFormat("")

            var y = d3.scale.linear().range([height, 0]);

            if (typeof $rootScope.tip == "undefined") {
                $rootScope.tip = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0])
                  .html(function(d) {
                    return d;
                  });
            }
            tip = $rootScope.tip;

            var svg = d3.select(iElement[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

            svg.call(tip);

            // watch for data changes and re-render
            // scope.$watch('data', function(newVals, oldVals) {
            //     if (newVals.rendervisu.perdayload == true){ newVals.rendervisu.perdayload = false
            //         return scope.render(newVals);
            //     }else console.log("won't render perdayload", oldVals, newVals);
            // }, true);

            scope.render = function(data) {
                maxVal = 0;
                dateHistogram = [];
                curDateBarPassed = false;
                for (k in data) {
                    count = data[k];
                    dateIso = k.slice(0, 10);
                    date = parseDate(dateIso);
                    if (dateIso == scope.curDateIso) curDateBarPassed=true;
                    if (date >= range[0] && date <= range[1]) {
                        if (count*1 > maxVal) maxVal=count;
                        dateHistogram.push({
                            "count": count,
                            "key": k,
                            "date": date,
                            "toDateString": date.toDateString(),
                            "dateIso": dateIso,
                            "dateStrShort": parseInt(dateIso.replace(/-/g, ''))
                        });
                    }
                }
                if (curDateBarPassed == false) dateHistogram.push({
                            "count": 0,
                            "key": scope.curDateIso,
                            "date": curDate,
                            "toDateString": curDate.toDateString(),
                            "dateIso": scope.curDateIso,
                            "dateStrShort": parseInt(scope.curDateIso.replace(/-/g, ''))
                        });

                y.domain([0, maxVal]);

                svg.selectAll("rect.bar")
                    .data(dateHistogram)
                  .enter().append("rect")
                    .attr("class", function(d) { return "bar d"+d.dateStrShort+((d.dateIso==scope.curDateIso)?' current':''); })
                    .on("click", function(d, i){
                        return $window.location.href = scope.redirectUrl+'?date='+d.dateIso;
                    })
                    .attr("x", function(d) { return x(d.date); })
                    .attr("width", widthBar)
                    .attr("y", function(d) { return y(d.count); })
                    .attr("height", function(d) { return (d.dateIso != scope.curDateIso) ? height - y(d.count) : height + 4 - y(d.count) ; })
                    .on('mouseover', function(d) {
                        tip.show("<strong>"+d.toDateString+":</strong> <em>" + d.count + "</em>");
                    })
                    .on('mouseout', tip.hide);

                    // Add the X Axis
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);
            };
            scope.render(scope.data);
        }
    };
});

