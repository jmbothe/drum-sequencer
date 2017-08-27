'use strict';

jQuery(($) => {
  const model = {
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

    bpm: (60 / 100) * 1000,

    setBpm: function setBpm(number) {
      this.bpm = (60 / number) * 1000
    },

    togglePlay: function togglePlay() {
      if (this.play) {
        this.play = false;
      } else {
        this.play = true;
        model.runSequence();
      }
    },

    toggleActiveKit: function toggleActiveKit() {
      this.activeKit = this.activeKit === '808' ? 'electro' : '808';
    },

    toggleActiveCell: function toggleActiveCell(cell) {
      const cellIndex = this.sequenceGrid.activeCells.indexOf(cell)
      if (cellIndex !== -1) {
        this.sequenceGrid.activeCells.splice(cellIndex, 1)
      } else {
        this.sequenceGrid.activeCells.push(cell)
      }
    },

    triggerSound: function playSound(buffer) {
      const reader = new FileReader();
      reader.onload = function() {
        const aud = new Audio(this.result);
        let playPromise = aud.play();
        if (playPromise !== undefined) {
          playPromise.then(function() {
          }).catch(function(error) {
            alert('audio issues', error)
          });
        }
      };
      reader.readAsDataURL(buffer);
    },

    runSequence: function runSequence() {
      let row = 0;
      const height = model.sequenceGrid.height;
      const width = model.sequenceGrid.width;
      (function recurse () {
        for (let column = 0; column < width; column++) {
          let cellIsActive = model.sequenceGrid.activeCells.includes(((row % height) * height) + column);
          if (cellIsActive) {
            model.triggerSound(model.kits[model.activeKit].buffers[column]);
          }
        }
        if (model.play) {
          row++;
          setTimeout(recurse, model.bpm);
        }
      })();
    },

    // runSequence: function runSequence() {
    //   let row = 0;
    //   const height = model.sequenceGrid.height
    //   const width = model.sequenceGrid.width
    //   let cycle = setInterval(function () {
    //     for (let column = 0; column < width; column++) {
    //       let cellIsActive = model.sequenceGrid.activeCells.includes(((row % height) * height) + column);
    //       if (cellIsActive) {
    //         model.triggerSound(model.kits[model.activeKit].buffers[column]);
    //       }
    //     }
    //     !model.play ? clearInterval(cycle) : row++;
    //   }, model.bpm);
    // },
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

    togglePlay: function togglePlay(e) {
      let newText = $('.play').text() === 'play' ? 'pause' : 'play';
      $('.play').text(newText);
    }
  };

  const controller = {
    initialize: function initialize() {
      this.setupListeners();
      this.loadSounds();
      this.toggleActiveKit();
    },

    setupListeners: function setupListeners() {
      $('.play').on('click', this.togglePlay);
      $('.kit').on('click', this.setupKit);
      $('.sequence-cell').on('click', this.toggleActiveCell);
      $('.bpm').on('change', this.setBpm);
    },

    loadSounds: function loadSounds() {
      Object.keys(model.kits).forEach((kit) => {
        model.kits[kit].files.forEach((item) => {
          const request = new XMLHttpRequest();
          const audioUrl = `/assets/${kit}/${item}.mp3`;

          request.open('GET', audioUrl, true);
          request.responseType = 'blob';

          request.onload = function onload() {
            const buffers = model.kits[kit].buffers;
            const index = model.kits[kit].files.indexOf(item);
            buffers[index] = request.response;
          };
          request.send();
        });
      });
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
      view.togglePlay(e);
    },
    setBpm: function setBpm() {
      let bpm = $('#bpm-input').val()
      model.setBpm(bpm);
    },
  };

  controller.initialize();
});
