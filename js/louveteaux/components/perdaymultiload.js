app.directive('perdaymultiload', function($rootScope, $window) {
    return {
        restrict: 'EA',
        scope: {
          data: "=",
          curDateIso: "=",
          dateOffset: "=",
          width: "=",
          height: "=",
          redirectUrl: "=",
          nocenter: "=",
          hideCurDay: "=",
          unite: "=",
          maxVal: "="
        },
        link: function(scope, iElement, iAttrs) {
            var margin = {top: 0, right: 0, bottom: 2, left: 0};
            var dateOffset = (typeof scope.dateOffset != 'undefined')? scope.dateOffset : 45;
            var width = (typeof scope.width != 'undefined')? scope.width : 150;
            var height = (typeof scope.height != 'undefined')? scope.height : 30;
            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            console.log(scope);
            var unite = (typeof scope.unite != 'undefined' && scope.unite) ? scope.unite : '';
            var hideCurDay = (typeof scope.hideCurDay != 'undefined' && scope.hideCurDay) ? true : false;

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
                dateHistogram = [];
                prevPerDayOffSet = {};
                console.log("data", data);
                for (k in data) {
                    serie = data[k];
                    newSerie = {"title": serie.title, "slug": serie.slug, "color": serie.color, "perDay":[]};
                    for (d in serie.perDay) {
                        count = serie.perDay[d];
                        dateIso = d.slice(0, 10);
                        date = parseDate(dateIso);
                        if (date >= range[0] && date <= range[1]) {
                            newSerie.perDay.push({
                                "cat_title": serie.title,
                                "cat_slug": serie.slug,
                                "count": count,
                                "offset": (typeof prevPerDayOffSet[dateIso] != "undefined")? prevPerDayOffSet[dateIso] : 0,
                                "key": d,
                                "date": date,
                                "toDateString": date.toDateString(),
                                "dateIso": dateIso,
                                "dateStrShort": parseInt(dateIso.replace(/-/g, ''))
                            });
                            prevPerDayOffSet[dateIso] = ((typeof prevPerDayOffSet[dateIso] != "undefined")? prevPerDayOffSet[dateIso] : 0) + count;
                        }
                    }
                    dateHistogram.push(newSerie);
                }

                maxVal = d3.max(_.values(prevPerDayOffSet));
                if (typeof scope.maxVal != "undefined") maxVal = Math.max(maxVal, scope.maxVal);
                y.domain([0, maxVal]);

                svg.append("g")
                    .selectAll("g")
                      .data(dateHistogram)
                      .enter().append("g")
                          .attr("class", function(d) { return d.slug; })
                          .attr("fill", function(d) { console.log("d serie", d); return d.color; })
                        .selectAll("rect")
                          .data(function(d) { return d.perDay; })
                          .enter().append("rect")
                            .attr("class", function(d) { return d.cat_slug+" d"+d.dateStrShort+((d.dateIso==scope.curDateIso && !hideCurDay)?' current':''); })
                            .on("click", function(d, i) {
                                if (typeof scope.redirectUrl != "undefined")
                                    return $window.location.href = scope.redirectUrl+'?date='+d.dateIso;
                            })
                            .attr("x", function(d) { return x(d.date); })
                            .attr("width", widthBar)
                            .attr("y", function(d) { return y(d.count+d.offset); })
                            .attr("height", function(d) { return (d.dateIso != scope.curDateIso || hideCurDay) ? height - y(d.count) : height + 4 - y(d.count) ; })
                            .on('mouseover', function(d) {
                                tip.show("<strong>"+d.toDateString+":</strong> <em>" + d.count +unite+ "</em><br><small>"+d.cat_title+"</small>");
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

