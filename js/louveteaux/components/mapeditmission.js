app.directive('mapeditmission', function($rootScope, SpatialTools) {
    return {
        restrict: 'EA',
        scope: {
          elem: "="
        },
        link: function(scope, iElement, iAttrs) {
            d3.select(iElement[0]).append("div")
                .attr("id", "mapLeaflet")
            center = scope.elem.lng && scope.elem.lat ? [scope.elem.lat, scope.elem.lng] : [47.5, 2.5]
            ////////////////////
            // fonds de carte //
            ////////////////////
            // Google lyrs: h = roads only, m = standard roadmap, p = terrain, r = somehow altered roadmap, s = satellite only, t = terrain only, y = hybrid
            googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{attribution: '&copy; <a href="https://www.google.com">Google</a>', subdomains:['mt0','mt1','mt2','mt3']});
            googleRoadmap = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{attribution: '&copy; <a href="https://www.google.com">Google</a>', subdomains:['mt0','mt1','mt2','mt3']});
            googleSatelite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{attribution: '&copy; <a href="https://www.google.com">Google</a>', subdomains:['mt0','mt1','mt2','mt3']});
            IGN = L.tileLayer(
                    "https://wxs.ign.fr/v7jx7wkn50o3noz9m4hvl477/geoportail/wmts?SERVICE=WMTS" +
                    "&REQUEST=GetTile&VERSION=1.0.0" +
                    "&STYLE=normal" +
                    "&TILEMATRIXSET=PM" +
                    "&FORMAT=image/jpeg"+
                    "&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS"+
                    "&TILEMATRIX={z}" +
                    "&TILEROW={y}" +
                    "&TILECOL={x}",
                {
                    minZoom : 3,
                    maxZoom : 18,
                    attribution : "IGN-F/Geoportail",
                    tileSize : 256 // les tuiles du Géooportail font 256x256px
                }
            );
            osmLayer = new L.TileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png",{attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
            var map = new L.Map("mapLeaflet", {center: center, zoom: 5, minZoom: 2, noWrap:true})
                .addLayer(IGN);
                // http://{s}.tile.osm.org/{z}/{x}/{y}.png
                // http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
                // http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png
                // http://a.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png
            L.control.layers({'IGN':IGN, 'Google Maps':googleStreets, 'Google Maps Terrain':googleRoadmap, 'Google Maps Satellite':googleSatelite, 'Open Street Map':osmLayer}).addTo(map);

            var marker = L.marker([scope.elem.lat?scope.elem.lat:'', scope.elem.lng?scope.elem.lng:'']).addTo(map);

            function findSector(coords) {
                scope.elem.zone_id = '';
                scope.elem.zone_code = '';
                if (zonesFilter) {
                    for (k in zonesFilter.features) {
                        z = zonesFilter.features[k];
                        isInside = SpatialTools.isPointInPolygon(coords, SpatialTools.geoJsonGeometryToOneArry(z.geometry.coordinates));
                        if (isInside) {
                            scope.elem.zone_id = z.properties.id.toString();
                            scope.elem.zone_code = z.properties.code;
                            console.log("dist", (isInside?1:-1)*SpatialTools.distToPolygon(coords, SpatialTools.geoJsonGeometryToOneArry(z.geometry.coordinates)));
                            break;
                        }
                    }
                }
            }
            function add_marker(e) {
                marker.setLatLng(e.latlng).addTo(map);
                scope.$apply(function(){
                    findSector([e.latlng.lng, e.latlng.lat]);
                    scope.elem.lng = e.latlng.lng;
                    scope.elem.lat = e.latlng.lat;
                });
            }
            if (canEdit)
                map.on('click', add_marker);


            //////////////////////////////////////////
            // watch for data changes and re-render //
            //////////////////////////////////////////
            var zonesLayer = null;
            var zonesFilter = null;
            function style(feature) {
                return {
                    fillColor: '#6379FF',
                    weight: 1.5,
                    opacity: 1,
                    color: '#5270F3',
                    fillOpacity: 0.13
                };
            }
            scope.$watch('elem.camp_id', function(vals, oldVals) {
                scope.elem.zone_id = '';
                if (zonesLayer)
                    map.removeLayer(zonesLayer);
                zonesFilter = clone(zones);
                zonesFilter.features = [];
                for (k in zones.features) {
                    z = zones.features[k];
                    console.log(z.properties.camp_id, scope.elem.camp_id);
                    if (z.properties.camp_id == scope.elem.camp_id || !z.properties.camp_id && !scope.elem.camp_id)
                        zonesFilter.features.push(z);
                }
                if (zonesFilter.features.length) {
                    zonesLayer = L.geoJson(zonesFilter, {
                                    style: style,
                                    onEachFeature: function (feature, layer) {
                                        // layer.bindPopup("Code: " + feature.properties.code + "<br>Titre: " + feature.properties.title + (feature.properties.description ? "<br>Description: " + feature.properties.description : ''));
                                        layer.bindTooltip(feature.properties.code, {permanent: false, sticky: true, direction: 'right'});
                                    }
                                }).addTo(map);
                    map.fitBounds(zonesLayer.getBounds());
                }
                findSector([scope.elem.lng, scope.elem.lat]);
            });
        }
    };
});

