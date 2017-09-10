/*
* base code for scheduling audio events adapted from
* Chris Wilson's Web Audio Tutorial Series
* https://www.html5rocks.com/en/tutorials/audio/scheduling/
*
* drum samples downloaded for free from http://99sounds.org/
*/

'use strict';

jQuery(function ($) {

  window.requestAnimFrame = function setRequestAnimFrame() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function requestAnimFrame(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  }();

  var model = {
    grid: {
      height: $('.sequence-grid-inner').children().length,
      width: $('.sequence-row').first().children().length,
      activeCells: []
    },

    kits: {
      '808 kit': {},
      acoustic: {},
      noise: {}
    },

    audio: function initAudio() {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        return new AudioContext();
      } catch (e) {
        alert('Web Audio API is not supported in this browser');
        return e;
      }
    }(),

    play: false,

    notesInQueue: [],

    setTempo: function setTempo(tempo) {
      this.tempo = tempo;
    },

    togglePlay: function togglePlay() {
      this.play = !this.play;
      if (this.play) {
        this.currentBeat = 0;
        this.nextNoteTime = this.audio.currentTime;
        this.timerID = setInterval(this.scheduler.bind(this), 25);
      } else if (this.play === false) {
        clearInterval(this.timerID);
        this.timerID = null;
      }
    },

    scheduler: function scheduler() {
      var scheduleAheadTime = 0.1;
      while (this.nextNoteTime < this.audio.currentTime + scheduleAheadTime) {
        this.scheduleNote(this.currentBeat, this.nextNoteTime);
        this.nextNote();
      }
    },

    scheduleNote: function scheduleNote(beat, time) {
      var height = this.grid.height;
      var width = this.grid.width;
      var activeCells = this.grid.activeCells;

      this.notesInQueue.push({ beat: beat, time: time });

      for (var column = 0; column < width; column++) {
        var currentCell = beat * height + column;

        if (activeCells.includes(currentCell)) {
          var buffer = this.kits[this.activeKit][column];
          this.triggerSound(buffer, time);
        }
      }
    },

    nextNote: function nextNote() {
      var secondsPerBeat = 60.0 / this.tempo;
      this.nextNoteTime += 0.25 * secondsPerBeat;
      this.currentBeat++;
      if (this.currentBeat === 32) {
        this.currentBeat = 0;
      }
    },

    triggerSound: function triggerSound(buffer) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var source = this.audio.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audio.destination);
      source.start(time);
    },

    previewDrum: function previewDrum(drum) {
      this.triggerSound(drum);
    },

    toggleActiveKit: function toggleActiveKit() {
      var kits = Object.keys(this.kits);
      var nextKit = (kits.indexOf(this.activeKit) + 1) % kits.length;
      this.activeKit = kits[nextKit];
    },

    toggleActiveCell: function toggleActiveCell(cell) {
      var cellIndex = this.grid.activeCells.indexOf(cell);
      if (cellIndex !== -1) {
        this.grid.activeCells.splice(cellIndex, 1);
      } else {
        this.grid.activeCells.push(cell);
      }
    },

    clearCells: function clearCells() {
      this.grid.activeCells = [];
    }
  };

  var view = {
    togglePlay: function togglePlay() {
      var newText = $('.play').text() === 'play' ? 'stop' : 'play';
      $('.play').text(newText);
    },

    toggleActiveKit: function toggleActiveKit() {
      $('.kit').text('' + model.activeKit);
    },

    toggleActiveCell: function toggleActiveCell(e) {
      $(e.target).toggleClass('active-cell');
    },

    animateActiveCells: function animateActiveCells(cells) {
      $(cells).toggleClass('animate-cell');
      setTimeout(function () {
        $(cells).toggleClass('animate-cell');
      }, model.tempo / 2);
    },

    clearCells: function clearCells() {
      $('.active-cell').toggleClass('active-cell');
    },

    toggleVisibleMeasure: function toggleVisibleMeasure() {
      this.visibleMeasure = this.visibleMeasure || 0;
      this.visibleMeasure = (this.visibleMeasure + 1) % 2;
      var measure = this.visibleMeasure;
      if (window.matchMedia('(orientation: portrait)').matches) {
        $('.sequence-grid-inner').animate({ marginTop: measure * -80 + 'vh' });
      } else if (window.matchMedia('(orientation: landscape)').matches) {
        $('.sequence-grid-inner').animate({ marginLeft: measure * -80 + 'vw' });
      }
    },

    animateButton: function animateButton(target) {
      $(target).toggleClass('animate-button');
      setTimeout(function () {
        $(target).toggleClass('animate-button');
      }, 200);
    },

    respondToOrientationChange: function respondToOrientationChange() {
      this.visibleMeasure = this.visibleMeasure || 0;
      var measure = this.visibleMeasure;
      if ($('body')[0].offsetWidth > $('body')[0].offsetHeight) {
        $('.sequence-grid-inner').css('marginTop', 0);
        $('.sequence-grid-inner').css('marginLeft', measure * -80 + 'vw');
      } else {
        $('.sequence-grid-inner').css('marginTop', measure * -80 + 'vh');
        $('.sequence-grid-inner').css('marginLeft', 0);
      }
    }
  };

  var controller = {
    initialize: function initialize() {
      this.setupListeners();
      this.loadSounds();
      this.toggleActiveKit();
      this.setTempo();
      requestAnimFrame(this.animateActiveCells.bind(this));
    },

    setupListeners: function setupListeners() {
      $('.main-control-bar, .drums-bar').on('click', this.animateButton);
      $('.play').one('click', this.getPlayPermission).on('click', this.togglePlay.bind(this));
      $('.kit').on('click', this.toggleActiveKit);
      $('.sequence-grid-inner').on('click', '.sequence-cell', this.toggleActiveCell);
      $('#tempo-input').on('input', this.setTempo);
      $('.clear').on('click', this.clearCells);
      $('.drums-bar').on('click', '.drum', this.previewDrum);
      $('.measure').on('click', this.toggleVisibleMeasure);
      $(window).on('resize', this.respondToOrientationChange);
    },

    loadSounds: function loadSounds() {
      var drums = ['hat', 'kick', 'snare', 'tom', 'crash', 'perc1', 'perc2', 'perc3'];

      Object.keys(model.kits).forEach(function (kit) {
        drums.forEach(function (drum, index) {
          var request = new XMLHttpRequest();
          var audioUrl = '/assets/' + kit + '/' + drum + '.mp3';
          // const audioUrl = `/drum-sequencer/assets/${kit}/${drum}.mp3`;

          request.open('GET', audioUrl);
          request.responseType = 'arraybuffer';

          request.onload = function onload() {
            model.audio.decodeAudioData(request.response, function (buffer) {
              model.kits[kit][index] = buffer;
            });
          };
          request.send();
        });
      });
    },

    getPlayPermission: function getPlayPermission() {
      var inaudible = model.audio.createBuffer(1, 22050, 44100);
      model.triggerSound(inaudible);
    },

    togglePlay: function togglePlay() {
      model.togglePlay();
      view.togglePlay();
    },

    toggleActiveKit: function toggleActiveKit() {
      model.toggleActiveKit();
      view.toggleActiveKit();
    },

    toggleActiveCell: function toggleCell(e) {
      var row = $(e.target.parentElement).index();
      var column = $(e.target).index();
      var height = model.grid.height;

      model.toggleActiveCell(row * height + column);
      view.toggleActiveCell(e);
    },

    clearCells: function clearCells() {
      model.clearCells();
      view.clearCells();
      if (model.play) {
        model.togglePlay();
        view.togglePlay();
      }
    },

    animateActiveCells: function animateActiveCells() {
      this.lastBeat = this.lastBeat || -1;
      var currentBeat = this.lastBeat;
      var currentTime = model.audio.currentTime;

      while (model.notesInQueue.length && model.notesInQueue[0].time < currentTime) {
        currentBeat = model.notesInQueue[0].beat;
        model.notesInQueue.splice(0, 1);
      }
      if (this.lastBeat !== currentBeat) {
        var row = '.sequence-row:nth-child(' + (currentBeat + 1) + ')';
        view.animateActiveCells(row + ' > .sequence-cell');
        this.lastBeat = currentBeat;
      }
      requestAnimFrame(animateActiveCells.bind(this));
    },

    setTempo: function setTempo() {
      model.setTempo($('#tempo-input').val());
    },

    previewDrum: function previewDrum(e) {
      model.previewDrum(model.kits[model.activeKit][$(e.target).index()]);
    },

    toggleVisibleMeasure: function toggleVisibleMeasure() {
      view.toggleVisibleMeasure();
    },

    animateButton: function animateButton(e) {
      view.animateButton(e.target);
    },

    respondToOrientationChange: function respondToOrientationChange() {
      view.respondToOrientationChange();
    }
  };

  controller.initialize();
});