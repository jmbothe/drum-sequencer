'use strict';

jQuery(($) => {
  const model = {
    808: {
      path: 'assets/808/',
      files: ['clap', 'crash', 'hat', 'kick', 'snare', 'tom', 'bell', 'click'],
    },

    electro: {
      path: 'assets/electro/',
      files: ['clap', 'crash', 'hat', 'kick', 'snare', 'tom', 'laser', 'shake'],
    },

    activeKit: 'electro',

    play: false,

    togglePlay: function togglePlay() {
      this.play = this.play === false;
      model.runSequence();
    },

    toggleActiveKit: function toggleActiveKit() {
      this.activeKit = this.activeKit == '808' ? 'electro' : '808';
    },

    triggerSound: function triggerSound(drum) {
      const sound = new Audio(`${model[model.activeKit].path}${drum}.wav`);
      sound.play();
    },

    runSequence: function runSequence() {
      for (let i = 1; i < 65; i++) {
        let step = i % 16;
        setTimeout(function () {
          $('.sequence-row').each(function (index) {
            if ($(`:nth-child(${step})`, this).hasClass('active-block')) {
              model.triggerSound($(`#drum${index + 1}`).text());
            }
          });
        }, i * 100);
      }
    },
  };

  const view = {

  };

  const controller = {
    initialize: function initialize() {
      this.setupKit();
      this.kitClickListener();
      this.drumClickListener();
      this.sequenceBlockClickListener();
      this.playClickListener();
    },

    setupKit: function setupKit() {
      model.toggleActiveKit();
      $('.kit').text(`${model.activeKit} kit`);
      $('.drum').text((index) => {
        return model[model.activeKit].files[index];
      });
    },

    triggerSound: function triggerSound(e) {
      const sound = new Audio(`${model[model.activeKit].path}${e.target.textContent}.wav`);
      sound.play();
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
