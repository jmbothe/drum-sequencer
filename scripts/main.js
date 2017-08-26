'use strict';

jQuery(($) => {
  const model = {
    '808': {
      path: 'assets/808/',
      files: ['clap', 'crash', 'hat', 'kick', 'snare', 'tom', 'bell', 'click'],
    },

    electro: {
      path: 'assets/electro/',
      files: ['clap', 'crash', 'hat', 'kick', 'snare', 'tom', 'laser', 'shake'],
    },

    activeKit: '808',

    toggleActiveKit: function toggleActiveKit() {
      this.activeKit = this.activeKit == '808' ? 'electro' : '808';
    },
  };

  const view = {

  };

  const controller = {
    initialize: function initialize() {
      this.setupKit()
      this.kitClickListener()
      this.drumClickListener();
      this.sequenceBlockClickListener()
    },

    setupKit: function setupKit() {
      model.toggleActiveKit();
      $('.kit')[0].textContent = `${model.activeKit} kit`;
      $('.drum').each((index, item) => {
        item.textContent = model[model.activeKit].files[index];
      });
    },

    triggerSound: function triggerSound(e) {
      const sound = new Audio(`assets/kit-808/${e.target.textContent}.wav`);
      sound.play();
    },

    toggleActiveSequenceBlock: function toggleActiveSequenceBlock(e) {
      $(e.target).toggleClass('active-block');
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
