<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="description" content="">
    <meta name="author" content="Antoine Giraud">
    <link rel="icon" href="img/logoGSE.png">

    <title>Projet Louveteaux 38e St JB</title>

    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="css/style.css" rel="stylesheet">
  </head>

  <body ng-app="app" ng-controller="PageCtrl">

    <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
      <a class="navbar-brand" href="#">
        <img src="img/logoGSE.png" width="30" height="30" class="d-inline-block align-top" alt="">
        Louveteaux
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarsExampleDefault">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#">38e St JB <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item active">
            <a class="nav-link" href="#" ng-click="Sounds.pauseAllSounds()"><span class="btn btn-info btn-sm">Chut !</span></a>
          </li>
        </ul>
      </div>
    </nav>
    <main role="main" class="container">
      <div class="starter-template">
        <h2>Thème</h2>
        <p>
                <span style="margin-right:10px;" ng-repeat="s in sounds.themes" class="btn btn-lg btn-primary" ng-click="Sounds.playTheme(s.audio, 0.7, 1)">{{s.name}}</span>
        </p>
        <h2>Events</h2>
        <p>
                <span style="margin-right:10px;" ng-repeat="s in sounds.events" class="btn btn-lg btn-primary" ng-click="Sounds.playTheme(s.audio, 1, 0)">{{s.name}}</span>
        </p>
        <h2>Petits sons</h2>
        <p>
            <span style="margin-right:10px;" ng-repeat="s in sounds.beeps" class="btn btn-lg btn-primary" ng-click="Sounds.play(s.audio)">{{s.name}}</span>
        </p>
      </div>
    </main><!-- /.container -->

    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="js/lib/jquery.min.js"></script>
    <script src="js/lib/bootstrap.min.js"></script>

    <?php
        $themes = array_filter(scandir('musics/themes'), function($d) { return in_array(substr($d, -4), ['.mp3', '.wav']); });
        $events = array_filter(scandir('musics/events'), function($d) { return in_array(substr($d, -4), ['.mp3', '.wav']); });
        $beeps = array_filter(scandir('musics'), function($d) { return in_array(substr($d, -4), ['.mp3', '.wav']); });
    ?>
    <script>
        var themes = <?= !empty($themes) ? json_encode(array_values($themes)) : '[]'; ?>;
        var beeps = <?= !empty($beeps) ? json_encode(array_values($beeps)) : '[]'; ?>;
        var events = <?= !empty($events) ? json_encode(array_values($events)) : '[]'; ?>;
    </script>

    <script src="js/lib/lodash.min.js"></script>
    <script src="js/lib/angular.min.js"></script>
    <!-- <script src="js/lib/angular-locale_fr-fr.js"></script> -->
    <!-- <script src="js/lib/angular-sanitize.min.js"></script> -->
    <!-- <script src="js/lib/ui-bootstrap-tpls-2.1.3.min.js"></script> -->
    <!-- <script src="js/lib/angularjs-slider.js"></script> -->
    <!-- ============= Applications ============= -->
    <script src="js/louveteaux/app.js"></script>
    <script src="js/louveteaux/controllers/PageCtrl.js"></script>
    <script src="js/louveteaux/services/Loaders.js"></script>
    <script src="js/louveteaux/services/Sounds.js"></script>
  </body>
</html>
