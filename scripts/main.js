'use strict';

jQuery(($) => {
  const model = {
    audioContext: new AudioContext(),

    kits: {
      808: {
        path: 'assets/808/',
        files: ['clap', 'crash', 'hat', 'kick', 'snare', 'tom', 'bell', 'click'],
        buffers: [],
      },

      electro: {
        path: 'assets/electro/',
        files: ['clap', 'crash', 'hat', 'kick', 'snare', 'tom', 'laser', 'shake'],
        buffers: [],
      },
    },

    activeKit: 'electro',

    play: false,

    togglePlay: function togglePlay() {
      this.play = this.play === false;
      model.runSequence();
    },

    toggleActiveKit: function toggleActiveKit() {
      this.activeKit = this.activeKit === '808' ? 'electro' : '808';
    },

    triggerSound: function playSound(buffer) {
      const reader = new FileReader();
      reader.onload = function() {
        var str = this.result;
        console.log(str);
        const aud = new Audio(str);
        aud.play();
      };
      reader.readAsDataURL(buffer);

      // const source = this.audioContext.createBufferSource();
      // source.buffer = buffer;
      // source.connect(this.audioContext.destination);
      // source.start(0);
    },

    runSequence: function runSequence() {
      for (let i = 1; i < 65; i++) {
        const step = i % 16;
        setTimeout(() => {
          $('.sequence-row').each(function iterate(index) {
            if ($(`:nth-child(${step})`, this).hasClass('active-block')) {
              model.triggerSound(model.kits[model.activeKit].buffers[index]);
            }
          });
        }, i * 200);
      }
    },
  };

  const view = {

  };

  const controller = {
    initialize: function initialize() {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.loadSounds();
      this.setupKit();
      this.kitClickListener();
      this.drumClickListener();
      this.sequenceBlockClickListener();
      this.playClickListener();
    },

    loadSounds: function loadSounds() {
      Object.keys(model.kits).forEach((object) => {
        model.kits[object].files.forEach((item, index) => {
          const request = new XMLHttpRequest();
          const audioUrl = `${model.kits[object].path}${item}.wav`;

          request.open('GET', audioUrl, true);
          request.responseType = 'blob';

          request.onload = function onload() {
            model.kits[object].buffers[model.kits[object].files.indexOf(item)] = request.response;
            // model.audioContext.decodeAudioData(request.response, (buffer) => {
            //   model.kits[object].buffers[model.kits[object].files.indexOf(item)] = buffer;
            // });
          };
          request.send();
        });
      });
    },

    setupKit: function setupKit() {
      model.toggleActiveKit();
      $('.kit').text(`${model.activeKit} kit`);
      $('.drum').text(index =>
        model.kits[model.activeKit].files[index],
      );
    },

    toggleActiveSequenceBlock: function toggleActiveSequenceBlock(e) {
      $(e.target).toggleClass('active-block');
    },

    playClickListener: function playClickListener() {
      $('.play').on('click', model.togglePlay.bind(model));
    },

    kitClickListener: function kitClickListener() {
      $('.kit').on('click', this.setupKit);
    },

    sequenceBlockClickListener: function sequenceBLockClickListener() {
      $('.sequence-block').on('click', this.toggleActiveSequenceBlock);
    },

    drumClickListener: function drumClickListener() {
      $('.drums-bar').on('click', this.triggerSound);
    },
  };

  controller.initialize();
});
