app.directive('mapallmission', function($rootScope, SpatialTools) {
    return {
        link: function(scope, iElement, iAttrs) {
            d3.select(iElement[0]).append("div")
                .attr("id", "mapLeaflet")
            center = [47.5, 2.5];

            ////////////////////
            // fonds de carte //
            ////////////////////
            // Google lyrs: h = roads only, m = standard roadmap, p = terrain, r = somehow altered roadmap, s = satellite only, t = terrain only, y = hybrid
            googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{attribution: '&copy; <a href="https://www.google.com">Google</a>', subdomains:['mt0','mt1','mt2','mt3']});
            googleRoadmap = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{attribution: '&copy; <a href="https://www.google.com">Google</a>', subdomains:['mt0','mt1','mt2','mt3']});
            googleSatelite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{attribution: '&copy; <a href="https://www.google.com">Google</a>', subdomains:['mt0','mt1','mt2','mt3']});
            IGN = L.tileLayer(
                "https://wxs.ign.fr/v7jx7wkn50o3noz9m4hvl477/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=normal" +
                "&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",
                {attribution : "IGN-F/Geoportail", tileSize : 256}
            );
            osmLayer = new L.TileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png",{attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
            var map = new L.Map("mapLeaflet", {center: center, zoom: 5, minZoom: 2, noWrap:true})
                .addLayer(IGN);
                // http://{s}.tile.osm.org/{z}/{x}/{y}.png                  // http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
                // http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png  // http://a.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png
            fondsCarte = L.control.layers({'IGN':IGN, 'Google Maps':googleStreets, 'Google Maps Terrain':googleRoadmap, 'Google Maps Satellite':googleSatelite, 'Open Street Map':osmLayer}).addTo(map);

            ////////////////////////////

            findClosestZones = function(distAdmissible) {
                for (k in missions) {
                    mission = missions[k];
                    mission.nearbyZones = [];
                    for (c in zones_geojson.features) {
                        zone = zones_geojson.features[c];
                        if (mission.lng && mission.lat && zone.geometry.coordinates.length) {
                            dist = SpatialTools.distToPolygon([mission.lng, mission.lat], SpatialTools.geoJsonGeometryToOneArry(zone.geometry.coordinates));
                            if (dist < distAdmissible)
                                mission.nearbyZones.push(zone.properties.id);
                        }
                    }
                }
            }
            findClosestZones(500);

            function isElemAndFormArrayEqual(elem, form) {
                if (!elem) elem = '';
                return form.includes(elem) || !elem && !form.length || form.toString() === ['all'].toString();
            }
            function mission_in_filter(mission) {
                isMissionInZone = false;
                if (mission.nearbyZones.length) {
                    for (k in mission.nearbyZones)
                        if (scope.form.zone_id.includes(mission.nearbyZones[k].toString()))
                            isMissionInZone = true;
                }
                return isElemAndFormArrayEqual(mission.cours_id, scope.form.cours_id)
                    && isElemAndFormArrayEqual(mission.type_id, scope.form.type_id)
                    && isElemAndFormArrayEqual(mission.camp_id, scope.form.camp_id)
                    && isElemAndFormArrayEqual(mission.contact_id, scope.form.contact_id)
                    && (isMissionInZone || isElemAndFormArrayEqual(mission.zone_id, scope.form.zone_id))
            }
            function put_missions_on_map(missions) {
                if (missionsLayer)
                    map.removeLayer(missionsLayer);

                var missions_coordinates = [];

                for(var index in missions) {
                    var mission = missions[index];
                    if(mission.lat != undefined && mission.lng != undefined) {
                        if(mission_in_filter(mission)) {
                            var mission_coordinate = {
                                "type": "Point",
                                "coordinates": [mission.lng, mission.lat],
                                "data": mission}
                            missions_coordinates.push(mission_coordinate);
                        }
                    }
                }
                scope.mission_number = missions_coordinates.length;
                missionsLayer = L.geoJSON(missions_coordinates, {
                    onEachFeature: function (feature, layer) {
                        mi = feature.data;
                        info = "";
                        if (mi.type_code) info = info + ' <span class="label label-primary">'+mi.type_code+'</span> ';
                        if (mi.cours_code) info = info + ' <span class="label label-info">'+mi.cours_code+'</span> ';
                        if (mi.file_path) info = info + " <a target='_blank' href='public/files/" + mi.file_path + "'><span class='glyphicon glyphicon-file'></span> "+mi.file_path.substr(mi.file_path.lastIndexOf('.'))+"</a> ";
                        if (mi.file_path_word) info = info + " <a target='_blank' href='public/files/" + mi.file_path_word + "'><span class='glyphicon glyphicon-file'></span> "+mi.file_path_word.substr(mi.file_path_word.lastIndexOf('.'))+"</a> ";
                        showVal = function(title, val) { return !val?'': "<strong>"+title+":</strong> " +val+ "<br>"};

                        note = '';
                        if (mi.notes) {
                            note += "<em style='margin-right:10px;'>"+mi.notes.note+"</em>";
                            for (i=1; i <= 5; i++)
                                note += "<span class='glyphicon glyphicon-star"+(round(mi.notes.note)<i?'-empty':'')+"'></span> ";
                            note += "<small >"+mi.notes.nb_votes+" vote"+(mi.notes.nb_votes==1?'':'s')+"</small>";
                        }

                        editBtn = !canEdit ? '' : " <a href='gestion/missions/edit/" + mi.id + "'><span class='glyphicon glyphicon-pencil'></span> Editer </a> ";
                        showBtn = " <a href='gestion/missions/show/" + mi.id + "'><span class='glyphicon glyphicon-search'></span> Afficher </a> ";
                        layer.bindPopup("<h4>"+mi.title+"</h4>"+
                                        "<p style='margin:8px 0;'><code style='font-size:15px;'>"+mi.code+"</code> "+editBtn+showBtn+"</p>"+
                                        ((note) ? "<p style='font-size:15px;margin:8px 0;'>"+note+"</p>" : '')+
                                        ((info) ? "<p style='font-size:15px;margin:8px 0;'>"+info+"</p>" : '')+
                                        (mi.description ? '<blockquote style="font-size:100%;margin-bottom:10px">'+mi.description+(mi.contact_email?'<footer>'+mi.contact_email+'</footer>':'')+'</blockquote>' : ''));
                        layer.bindTooltip(mi.code, {permanent: false, sticky: true, direction: 'right'});
                }}).addTo(map);
            }


            var missionsLayer = null;
            var zonesLayer = null;
            var zonesFilter = null;

            ///////////////////////
            // form change watch //
            ///////////////////////
            scope.$watch('form.contact_id', function(vals, oldVals) {
                if (!vals.length) scope.form.contact_id = [''];
                else if (vals.length>1 && vals.includes('all')) scope.form.contact_id = ['all'];
                else put_missions_on_map(missions);
            });
            scope.$watch('form.cours_id', function(vals, oldVals) {
                if (!vals.length) scope.form.cours_id = [''];
                else if (vals.length>1 && vals.includes('all')) scope.form.cours_id = ['all'];
                else put_missions_on_map(missions);
            });
            scope.$watch('form.type_id', function(vals, oldVals) {
                if (!vals.length) scope.form.type_id = [''];
                else if (vals.length>1 && vals.includes('all')) scope.form.type_id = ['all'];
                else put_missions_on_map(missions);
            });
            scope.$watch('form.zone_id', function(vals, oldVals) {
                if (!vals.length) scope.form.zone_id = [''];
                else if (vals.length>1 && vals.includes('all')) scope.form.zone_id = ['all'];
                else put_missions_on_map(missions);
                renderZones(1);
            });
            scope.$watch('form.zone_buffer', function(vals, oldVals) {
                findClosestZones(1*vals);
                put_missions_on_map(missions);
            });
            scope.$watch('form.camp_id', function(vals, oldVals) {
                put_missions_on_map(missions);
                scope.form.zone_id = ['all'];
                zonesFilter = clone(zones_geojson);
                zonesFilter.features = [];
                for (k in zones_geojson.features) {
                    z = zones_geojson.features[k];
                    if (scope.form.camp_id.includes(z.properties.camp_id+'') || !z.properties.camp_id && scope.form.camp_id.toString() === [''].toString() || scope.form.camp_id.toString() === ['all'].toString())
                        zonesFilter.features.push(z);
                }
                renderZones();
            });
            function renderZones(noFitBounds) {
                if (zonesLayer)
                    map.removeLayer(zonesLayer);
                if (zonesFilter && zonesFilter.features.length) {
                    zonesLayer = L.geoJson(zonesFilter, {
                                    style: style,
                                    onEachFeature: function (feature, layer) {
                                        zo = feature.properties;
                                        editBtn = !canEdit ? '' : "<a href='gestion/zones/edit/" + zo.id + "'><span class='glyphicon glyphicon-pencil'></span> Editer </a>";
                                        layer.bindPopup("<h4>"+zo.title+"</h4>"+
                                            "<p style='margin:8px 0;'><code style='font-size:15px;'>"+zo.code+"</code> "+editBtn+"</p>" +
                                            (zo.description ? '<blockquote style="font-size:100%;margin-bottom:10px">'+zo.description+'</blockquote>' : '')
                                        );
                                        layer.bindTooltip(zo.code, {permanent: false, sticky: true, direction: 'right'});
                                        }}).addTo(map)
                    if (!noFitBounds)
                        map.fitBounds(zonesLayer.getBounds());
                }
            }
            IGN.on('add', function() {renderZones(1); })
            IGN.on('remove', function() {renderZones(1); })
            function style(feature) {
                isCurZone=isElemAndFormArrayEqual(feature.properties.id.toString(), scope.form.zone_id);
                boost = map.hasLayer(IGN) ? 0.2 : 0;
                return {
                    fillColor: '#6379FF',
                    weight: 1.5,
                    opacity: isCurZone ? 1 : (0.3+boost*1.10),
                    color: '#5270F3',
                    fillOpacity: isCurZone ? (0.13+boost) : (0.05+boost/1.8)
                };
            }
        }
    }
})