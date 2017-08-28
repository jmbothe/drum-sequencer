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
      808: {
        files: ['clap', 'crash', 'hat', 'kick', 'snare', 'tom', 'bell', 'click'],
        buffers: [],
      },

      electro: {
        files: ['clap', 'crash', 'hat', 'kick', 'snare', 'tom', 'laser', 'shake'],
        buffers: [],
      },
    },

    activeKit: 'electro',

    play: false,

    bpm: undefined,

    setBpm: function setBpm(number) {
      this.bpm = (60 / number) * 1000;
    },

    togglePlay: function togglePlay() {
      this.play = this.play === false;
    },

    toggleActiveKit: function toggleActiveKit() {
      this.activeKit = this.activeKit === '808' ? 'electro' : '808';
    },

    toggleActiveCell: function toggleActiveCell(cell) {
      const cellIndex = this.sequenceGrid.activeCells.indexOf(cell);
      if (cellIndex !== -1) {
        this.sequenceGrid.activeCells.splice(cellIndex, 1);
      } else {
        this.sequenceGrid.activeCells.push(cell);
      }
    },

    triggerSound: function playSound(buffer) {
      const source = model.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(model.audioContext.destination);
      source.start(0);
    },
  };

  const view = {
    toggleActiveKit: function toggleActiveKit() {
      $('.kit').text(`${model.activeKit} kit`);
      $('.drum').text(index =>
        model.kits[model.activeKit].files[index],
      );
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
      this.setupListeners();
      this.loadSounds();
      this.toggleActiveKit();
      this.setBpm();
    },

    setupListeners: function setupListeners() {
      $('.play').on('click', this.togglePlay.bind(this));
      $('.kit').on('click', this.toggleActiveKit);
      $('.sequence-cell').on('click', this.toggleActiveCell);
      $('#bpm-input').on('input', this.setBpm);
      $('#bpm-input').inputDrag({ min: 1, max: 600 });
    },

    loadSounds: function loadSounds() {
      Object.keys(model.kits).forEach((kit) => {
        model.kits[kit].files.forEach((item) => {
          const request = new XMLHttpRequest();
          const audioUrl = `/assets/${kit}/${item}.mp3`;
          // const audioUrl = `/drum-sequencer/assets/${kit}/${item}.mp3`;

          request.open('GET', audioUrl);
          request.responseType = 'arraybuffer';

          request.onload = function onload() {
            model.audioContext.decodeAudioData(request.response, (buffer) => {
              const buffers = model.kits[kit].buffers;
              const index = model.kits[kit].files.indexOf(item);
              buffers[index] = buffer;
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
            const cell = ((row % height) * height) + column;

            if (activeCells.includes(cell)) {
              const parent = `.sequence-column:nth-child(${column + 1})`;
              const child = `.sequence-cell:nth-child(${(row % height) + 1})`;
              const buffer = model.kits[model.activeKit].buffers[column];

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
