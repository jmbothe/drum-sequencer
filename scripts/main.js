/* base code for scheduling audio events adapted from
* Chris Wilson's Web Audio Tutorial Series
* https://www.html5rocks.com/en/tutorials/audio/scheduling/
*
* drum samples downloaded for free from http://99sounds.org/
*/

'use strict';

window.requestAnimFrame = ((function setRequestAnimFrame() {
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function requestAnimFrame(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})());

jQuery(($) => {
  const model = {
    grid: {
      height: $('.sequence-column').first().children().length,
      width: $('.sequence-grid-inner').children().length,
      activeCells: [],
    },

    kits: {
      '808 kit': {},
      acoustic: {},
      noise: {},
    },

    audio: ((function initAudio() {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        return new AudioContext();
      } catch (e) {
        alert('Web Audio API is not supported in this browser');
        return e;
      }
    })()),

    play: false,

    lastBeat: -1,

    notesInQueue: [],

    tempo: 120,

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
      const scheduleAheadTime = 0.1
      while (this.nextNoteTime < this.audio.currentTime + scheduleAheadTime) {
        this.scheduleNote(this.currentBeat, this.nextNoteTime);
        this.nextNote();
      }
    },

    scheduleNote: function scheduleNote(beat, time) {
      const height = this.grid.height;
      const width = this.grid.width;
      const activeCells = this.grid.activeCells;

      for (let column = 0; column < width; column++) {
        const currentCell = ((beat % height) * height) + column;

        if (activeCells.includes(currentCell)) {
          this.notesInQueue.push({ beat, column, time });
          const buffer = this.kits[this.activeKit][column];
          this.triggerSound(buffer, time);
        }
      }
    },

    nextNote: function nextNote() {
      const secondsPerBeat = 60.0 / this.tempo;
      this.nextNoteTime += 0.25 * secondsPerBeat;
      this.currentBeat++;
      if (this.currentBeat === 32) {
        this.currentBeat = 0;
      }
    },

    triggerSound: function triggerSound(buffer, time = 0) {
      const source = this.audio.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audio.destination);
      source.start(time);
    },

    previewDrum: function previewDrum(drum) {
      this.triggerSound(drum);
    },

    toggleActiveKit: function toggleActiveKit() {
      const kits = Object.keys(this.kits);
      const nextKit = (kits.indexOf(this.activeKit) + 1) % kits.length;
      this.activeKit = kits[nextKit];
    },

    toggleActiveCell: function toggleActiveCell(cell) {
      const cellIndex = this.grid.activeCells.indexOf(cell);
      if (cellIndex !== -1) {
        this.grid.activeCells.splice(cellIndex, 1);
      } else {
        this.grid.activeCells.push(cell);
      }
    },

    clearCells: function clearCells() {
      this.grid.activeCells = [];
    },
  };

  const view = {
    togglePlay: function togglePlay() {
      const newText = $('.play').text() === 'play' ? 'stop' : 'play';
      $('.play').text(newText);
    },

    toggleActiveKit: function toggleActiveKit() {
      $('.kit').text(`${model.activeKit}`);
    },

    toggleActiveCell: function toggleActiveCell(e) {
      $(e.target).toggleClass('active-cell');
    },

    animateActiveCell: function animateActiveCell(cell) {
      $(cell).animate({
        opacity: 0.5,
      }, 50, function endAnimation() {
        $(this).animate({
          opacity: 1,
        }, 50);
      });
    },

    clearCells: function clearCells() {
      $('.active-cell').toggleClass('active-cell');
    },

    toggleVisibleMeasure: function toggleVisibleMeasure() {
      this.visibleMeasure = this.visibleMeasure || 0;
      this.visibleMeasure = (this.visibleMeasure + 1) % 2
      const measure = this.visibleMeasure;
      if (window.matchMedia('(orientation: portrait)').matches) {
        $('.sequence-grid-inner').animate({ marginTop: `${measure * -80}vh` });
      } else if (window.matchMedia('(orientation: landscape)').matches) {
        $('.sequence-grid-inner').animate({ marginLeft: `${measure * -80}vw` });
      }
    },

    respondToOrientationChange: function respondToOrientationChange() {
      this.visibleMeasure = this.visibleMeasure || 0;
      const measure = this.visibleMeasure;
      if ($('body')[0].offsetWidth > $('body')[0].offsetHeight) {
        $('.sequence-grid-inner').css('marginTop', 0);
        $('.sequence-grid-inner').css('marginLeft', `${measure * -80}vw`);
      } else {
        $('.sequence-grid-inner').css('marginTop', `${measure * -80}vh`);
        $('.sequence-grid-inner').css('marginLeft', 0);
      }
    },
  };

  const controller = {
    initialize: function initialize() {
      this.setupListeners();
      this.loadSounds();
      this.toggleActiveKit();
      this.setTempo();
      requestAnimFrame(this.animateActiveCell);
    },

    setupListeners: function setupListeners() {
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
      const drums = ['hat', 'kick', 'snare', 'tom', 'crash', 'perc1', 'perc2', 'perc3']
      Object.keys(model.kits).forEach((kit) => {
        drums.forEach((drum, index) => {
          const request = new XMLHttpRequest();
          // const audioUrl = `/assets/${kit}/${drum}.mp3`;
          const audioUrl = `/drum-sequencer/assets/${kit}/${drum}.mp3`;

          request.open('GET', audioUrl);
          request.responseType = 'arraybuffer';

          request.onload = function onload() {
            model.audio.decodeAudioData(request.response, (buffer) => {
              model.kits[kit][index] = buffer;
            });
          };
          request.send();
        });
      });
    },

    getPlayPermission: function getPlayPermission() {
      const inaudible = model.audio.createBuffer(1, 22050, 44100);
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
      const column = $(e.target.parentElement).index();
      const row = $(e.target).index();
      const gridHeight = model.grid.height;

      model.toggleActiveCell((row * gridHeight) + column);
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

    animateActiveCell: function animateActiveCell() {
      let beat = model.lastBeat;
      const currentTime = model.audio.currentTime;
      const height = model.grid.height;

      while (model.notesInQueue.length && model.notesInQueue[0].time < currentTime) {
        beat = model.notesInQueue[0].beat;
        let column = model.notesInQueue[0].column
        model.notesInQueue.splice(0, 1);
        if (model.lastBeat != beat) {
          const parent = `.sequence-column:nth-child(${column + 1})`;
          const child = `.sequence-cell:nth-child(${(beat % height) + 1})`;
          view.animateActiveCell(`${parent} > ${child}`);
        }
      }
      model.lastBeat = beat;
      requestAnimFrame(animateActiveCell);
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

    respondToOrientationChange: function respondToOrientationChange() {
      view.respondToOrientationChange();
    },
  };

  controller.initialize();
});
