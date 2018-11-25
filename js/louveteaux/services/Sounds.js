/* Sounds.js */
// Stores sounds in a global sounds object, to be played back on command
app.factory('Sounds', function($http, $q){
    var factory = {
        library: {},
        sounds: {},
        theme: false,
        muted: 'true',


        // Loads sounds (in order) from the reference into the container
        createElement: function(type) {
          var elem = document.createElement(type || "div"),
              i = arguments.length;
          while(--i > 0) // because negative
            factory.proliferate(elem, arguments[i]);
          return elem;
        },
        proliferate: function(elem, settings, no_override) {
          var setting, i;
          for(i in settings) {
            if(no_override && elem[i]) continue;
            if(typeof(setting = settings[i]) == "object") {
              if(!elem[i]) elem[i] = {};
              factory.proliferate(elem[i], setting, no_override);
            }
            else elem[i] = setting;
          }
          return elem;
        },
        loadSounds: function(reference, prefix) {
          var sound, name_raw,
              details = {
                  preload: 'auto',
                  prefix: '',
                  name_raw: '',
                  src: '',
                  used: 0
                },
              len, i;
          for(i = 0, len = reference.length; i < len; ++i) {
            name_raw = reference[i];
            details.name_raw = name_raw;
            details.src = prefix + name_raw;

            // Create the sound and store it in the container
            sound = factory.createElement("Audio", details);
            factory.library[name_raw] = sound;
            console.log("Sounds", sound)

            // This preloads the sound.
            sound.volume = 0;
            sound.play();
          }
        },


        // Starts pre-emptively loading sounds (see load.js::startLoadingSOunds)
        // All sounds are stored in factory.library, while ones used in this run are also in window.sounds
        resetSounds: function() {
          factory.sounds = {};
          factory.sounds.theme = false;
          factory.muted = 'true';
        },


        // Override is whether the main music pauses
        play: function(name_raw, override) {
            console.log("play ", name_raw);
          // First check if this is already in sounds
          var name = "Sounds/" + name_raw,
              sound = factory.sounds[name_raw];

          // Is this even needed?
          if(override) console.log("Play as override?!", arguments);

          // If it's not already being played,
          if(!sound) {
            // Check for it in the library
            if(sound = factory.library[name_raw]) {
              factory.sounds[name_raw] = sound;
            }
            // Otherwise it's not known, complain
            else {
              console.log("Unknown sound: '" + name_raw + "'");
              return sound;
            }
          }

          // Reset the sound, then play it
          if(sound.readyState) {
            sound.pause();
            sound.currentTime = 0;
          }
          sound.volume = 1;
          sound.play();

          // If this is the first time the sound was added, let it know how to stop
          if(!(sound.used++)) sound.addEventListener("ended", function() { console.log("Sounds", sound); factory.soundFinish(sound, name_raw); });

          return sound;
        },


        // Plays a theme as sounds.theme via play()
        // If no theme is provided, it plays the area's theme
        playTheme: function(name_raw, volume, loop) {
            console.log("playTheme ", name_raw);
          // First make sure there isn't already a theme playing
          if(sound = factory.sounds.theme) {
            factory.soundStop(sound);
            delete factory.sounds.theme;
            delete factory.sounds[sound.name_raw];
          }

          // If the name doesn't exist, get it from the current area
          // if(!name_raw) name_raw = area.theme;
          // They all happen to end with .mp3...
          // name_raw += ".mp3";

          // This creates the sound.
          sound = factory.sounds.theme = factory.play(name_raw);
          sound.loop = typeof loop != 'undefined' ? loop : false;
          sound.volume = typeof volume != 'undefined' ? volume : 0.6;

          // If it's only used once, add the event listener to resume theme
          if(sound.used == 1) sound.addEventListener("ended", factory.playTheme);

          return sound;
        },

        // Called when a sound is done to get it out of sounds
        soundFinish: function(sound, name_raw) {
          if(factory.sounds[name_raw]) delete factory.sounds[name_raw];
        },

        soundStop: function(sound) {
          // If this sound has a readyState, stop it
          if(sound) {
            sound.pause();
            if(sound.readyState) sound.currentTime = 0;
          }
        },

        toggleMute: function() {
          level = !(localStorage.muted = data.muted = muted = !muted);
          for(i in factory.sounds) factory.sounds[i].volume = level;
        },

        pauseAllSounds: function() { for(i in factory.sounds) factory.sounds[i].pause(); },
        resumeAllSounds: function() { for(i in factory.sounds) factory.sounds[i].play(); },
        pauseTheme: function() { if(factory.sounds.theme) factory.sounds.theme.pause(); },
        resumeTheme: function() { if(factory.sounds.theme) factory.sounds.theme.play(); }
    }
    return factory;
});