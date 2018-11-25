app.factory('Loaders', function($http, $q){
    var factory = {
        generic: { loading: true, error: false, msg: "chargement", errorMsg: "chargement"},
        map: { loading: true, error: false, msg: "chargement carte", errorMsg: "chargement carte"},
        load: function(k){ factory[k].loading=true; factory[k].error=false; },
        error: function(k, msg){ factory[k].loading=false; factory[k].error=true; factory[k].errorMsg=msg; }
    }
    return factory;
});