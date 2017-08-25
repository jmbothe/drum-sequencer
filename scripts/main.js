'use strict';

jQuery(($) => {
  const model = {

  };

  const view = {

  };

  const controller = {
    playDrum: function playDrum(e) {
      const sound = $(`audio[src*='${e.target.textContent}']`)[0];
      sound.play();
    },
    drumClickListener: function drumClickListener() {
      $('.drums-bar').on('click', this.playDrum);
    },
  };

  controller.drumClickListener();
});
