'use strict';

jQuery(($) => {
  const model = {
    audioContext: ((function initAudioContext() {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        return new AudioContext();
      } catch (e) {
        alert('Web Audio API is not supported in this browser');
        return undefined;
      }
    })()),

    sequenceGrid: {
      height: 16,
      width: 8,
      activeCells: [],
    },

    kits: {
      808: {},
      natural: {},
    },

    activeKit: 'natural',

    play: false,

    bpm: undefined,

    setBpm: function setBpm(number) {
      this.bpm = (60 / number) * 1000;
    },

    togglePlay: function togglePlay() {
      this.play = this.play === false;
    },

    toggleActiveKit: function toggleActiveKit() {
      this.activeKit = this.activeKit === '808' ? 'natural' : '808';
    },

    toggleActiveCell: function toggleActiveCell(cell) {
      const cellIndex = this.sequenceGrid.activeCells.indexOf(cell);
      if (cellIndex !== -1) {
        this.sequenceGrid.activeCells.splice(cellIndex, 1);
      } else {
        this.sequenceGrid.activeCells.push(cell);
      }
    },

    triggerSound: function triggerSound(buffer) {
      const source = model.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(model.audioContext.destination);
      source.start(0);
    },
  };

  const view = {
    toggleActiveKit: function toggleActiveKit() {
      $('.kit').text(`${model.activeKit} kit`);
    },

    toggleActiveCell: function toggleActiveCell(e) {
      $(e.target).toggleClass('active-cell');
    },

    togglePlay: function togglePlay() {
      const newText = $('.play').text() === 'play' ? 'pause' : 'play';
      $('.play').text(newText);
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
  };

  const controller = {
    initialize: function initialize() {
      this.loadSounds();
      this.setupListeners();
      this.toggleActiveKit();
      this.setBpm();
    },

    setupListeners: function setupListeners() {
      $('.play').one('click', this.getPlayPermission).on('click', this.togglePlay.bind(this));
      $('.kit').on('click', this.toggleActiveKit);
      $('.sequence-cell').on('click', this.toggleActiveCell);
      $('#bpm-input').on('input', this.setBpm);
      $('#bpm-input').inputDrag({ min: 1, max: 600 });
    },

    getPlayPermission: function getPlayPermission() {
      const source = model.audioContext.createBufferSource();
      const gainNode = model.audioContext.createGain();
      source.buffer = model.kits[model.activeKit][0];
      source.connect(gainNode);
      gainNode.connect(model.audioContext.destination);
      gainNode.gain.value = 0;
      source.start(0);
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
            model.audioContext.decodeAudioData(request.response, (buffer) => {
              model.kits[kit][index] = buffer;
            });
          };
          request.send();
        });
      });
    },

    runSequence: function runSequence() {
      let row = 0;
      const height = model.sequenceGrid.height;
      const width = model.sequenceGrid.width;
      const activeCells = model.sequenceGrid.activeCells;

      ((function recursive() {
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
          row++;
          setTimeout(recursive, model.bpm);
        }
      })());
    },

    toggleActiveKit: function toggleActiveKit() {
      model.toggleActiveKit();
      view.toggleActiveKit();
    },

    toggleActiveCell: function toggleCell(e) {
      const column = $(e.target.parentElement).index();
      const row = $(e.target).index();
      const gridHeight = model.sequenceGrid.height;

      model.toggleActiveCell((row * gridHeight) + column);
      view.toggleActiveCell(e);
    },

    togglePlay: function togglePlay(e) {
      model.togglePlay();
      this.runSequence();
      view.togglePlay(e);
    },

    setBpm: function setBpm() {
      model.setBpm($('#bpm-input').val());
    },
  };

  controller.initialize();
});
