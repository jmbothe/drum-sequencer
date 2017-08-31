'use strict';

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

    activeKit: undefined,

    play: false,

    beatLength: undefined,

    setBeatLength: function setBpm(bpm) {
      this.beatLength = (15 / bpm) * 1000;
    },

    togglePlay: function togglePlay() {
      this.play = this.play === false;
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

    audio: ((function initAudio() {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        return new AudioContext();
      } catch (e) {
        alert('Web Audio API is not supported in this browser');
        return e;
      }
    })()),

    triggerSound: function triggerSound(buffer) {
      const source = model.audio.createBufferSource();
      source.buffer = buffer;
      source.connect(model.audio.destination);
      source.start(0);
    },

    previewDrum: function previewDrum(drum) {
      this.triggerSound(drum);
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
      this.setBpm();
    },

    setupListeners: function setupListeners() {
      $('.play').one('click', this.getPlayPermission).on('click', this.togglePlay.bind(this));
      $('.kit').on('click', this.toggleActiveKit);
      $('.sequence-grid-inner').on('click', '.sequence-cell', this.toggleActiveCell);
      $('#bpm-input').on('input', this.setBpm);
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

    runSequencer: function runSequencer(row = 0) {
      const height = model.grid.height;
      const width = model.grid.width;
      const activeCells = model.grid.activeCells;
      if (model.play) {
        for (let column = 0; column < width; column++) {
          const currentCell = ((row % height) * height) + column;

          if (activeCells.includes(currentCell)) {
            const parent = `.sequence-column:nth-child(${column + 1})`;
            const child = `.sequence-cell:nth-child(${(row % height) + 1})`;
            const buffer = model.kits[model.activeKit][column];

            model.triggerSound(buffer);
            view.animateActiveCell(`${parent} > ${child}`);
          }
        }
        setTimeout(runSequencer.bind(null, ++row), model.beatLength);
      }
    },

    getPlayPermission: function getPlayPermission() {
      const inaudible = model.audio.createBuffer(1, 22050, 44100);
      model.triggerSound(inaudible);
    },

    togglePlay: function togglePlay() {
      model.togglePlay();
      this.runSequencer();
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

    setBpm: function setBpm() {
      model.setBeatLength($('#bpm-input').val());
    },

    previewDrum: function previewDrum(e) {
      model.previewDrum(model.kits[model.activeKit][$(e.target).index()]);
    },

    toggleVisibleMeasure: function toggleVisibleMeasure() {
      view.toggleVisibleMeasure();
    },

    respondToOrientationChange: function respondToOrientationChange() {
      view.respondToOrientationChange();
    }
  };

  controller.initialize();
});
