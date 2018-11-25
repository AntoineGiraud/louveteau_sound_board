app.controller('PageCtrl', function($scope, $timeout, $window, $rootScope, Loaders, Sounds){
    ////////////////////////////////
    // Variables & Initialisation //
    ////////////////////////////////
    $scope.loaders = Loaders;

    $scope.alerts = [
        // { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.', 'timeout':false },
        // { type: 'black', msg: 'Oh snap! Change a few things up and try submitting again.', 'timeout':false },
        // { type: 'success', msg: 'Well done! You successfully read this important alert message.', 'timeout':false }
    ];
    $scope.addAlert = function(msg, type, timeout) {
        type = type || ''
        timeout = timeout || null
        msg = msg || 'Another alert!'
        $scope.alerts.push({type:type, msg:msg, timeout:timeout});
    };
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    // $scope.addAlert("Message bidon", "danger", 5000);
    // $scope.alertModal('Attention', "Vous n'êtes pas connecté à Internet");

    // $scope.addAlert(ouuutput, "danger", false);
    // console.log("ouuutput", ouuutput);


    Sounds.loadSounds(beeps, "musics/");
    Sounds.loadSounds(themes, "musics/themes/");
    Sounds.loadSounds(events, "musics/events/");
    $scope.sounds = {
        'beeps': _.map(beeps, function(d) { return {'name':d.substr(0, d.length-4), 'audio':d}; } ),
        'themes': _.map(themes, function(d) { return {'name':d.substr(0, d.length-4), 'audio':d}; } ),
        'events': _.map(events, function(d) { return {'name':d.substr(0, d.length-4), 'audio':d}; } )
    };
    $scope.Sounds = Sounds;

    console.log('Sounds', Sounds);

});
