/*
* base code for scheduling audio events adapted from
* Chris Wilson's Web Audio Tutorial Series
* https://www.html5rocks.com/en/tutorials/audio/scheduling/
*
* drum samples downloaded for free from http://99sounds.org/
*/

'use strict';

jQuery(($) => {

  window.requestAnimFrame = (function setRequestAnimFrame() {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function requestAnimFrame(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  }());

  const model = {
    grid: {
      height: $('.sequence-grid-inner').children().length,
      width: $('.sequence-row').first().children().length,

      // array of ordinal numbers representing grid coordinates
      activeCells: [],
    },

    // kits populated with audio buffers in controller.loadSounds() Ajax request
    kits: {
      '808 kit': {},
      acoustic: {},
      noise: {},
    },

    // core audio context
    audio: (function initAudio() {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        return new AudioContext();
      } catch (e) {
        alert('We\'re sorry, but Web Audio API is not supported in this browser. This app will not function in this browser. Try Chrome or Firefox.');
        return e;
      }
    }()),

    play: false,

    /**
     * beatsInQueue represents grid rows to animate during playback.
     * populated in this.scheduleBeat(). used in controller.animateActiveCells()
     */
    beatsInQueue: [],

    setTempo: function setTempo(tempo) {
      this.tempo = tempo;
    },

    togglePlay: function togglePlay() {
      this.play = !this.play;
      if (this.play) {
        this.currentBeat = 0;
        this.nextBeatTime = this.audio.currentTime;
        this.timerID = setInterval(this.scheduler.bind(this), 25);
      } else if (this.play === false) {
        clearInterval(this.timerID);
        this.timerID = null;
      }
    },

    /**
     * scheduler() looks ahead 100ms and schedules playback of any beats
     * that will occur within that time. It will always play the first beat
     * when togglePlay() is called.
     */
    scheduler: function scheduler() {
      // how far ahead to schedule beat playback, in seconds
      const scheduleAheadTime = 0.1

      // schedule next beat if it falls within the next 100ms
      while (this.nextBeatTime < this.audio.currentTime + scheduleAheadTime) {
        this.scheduleBeat(this.currentBeat, this.nextBeatTime);
        this.nextNote();
      }
    },

    scheduleBeat: function scheduleBeat(beat, time) {
      const height = this.grid.height;
      const width = this.grid.width;
      const activeCells = this.grid.activeCells;

      // queue beat to animate grid row with controller.animateActiveCells()
      this.beatsInQueue.push({ beat, time });

      for (let column = 0; column < width; column++) {

        // convert cell coordinates into ordinal number
        const currentCell = (beat * height) + column;

        if (activeCells.includes(currentCell)) {
          const buffer = this.kits[this.activeKit][column];
          this.triggerSound(buffer, time);
        }
      }
    },

    nextNote: function nextNote() {
      const secondsPerBeat = 60.0 / this.tempo;
      this.nextBeatTime += 0.25 * secondsPerBeat;
      this.currentBeat++;
      if (this.currentBeat === 32) {
        this.currentBeat = 0;
      }
    },

    // basic web audio API playback function
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

      // sets this.activeKit on first call
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

    animateActiveCells: function animateActiveCells(cells) {
      $(cells).toggleClass('animate-cell');
      setTimeout(() => {
        $(cells).toggleClass('animate-cell');
      }, model.tempo / 1.5);
    },

    clearCells: function clearCells() {
      $('.active-cell').toggleClass('active-cell');
    },

    animateButton: function animateButton(target) {
      $(target).toggleClass('animate-button');
      setTimeout(() => {
        $(target).toggleClass('animate-button');
      }, 150);
    },

    toggleVisibleMeasure: function toggleVisibleMeasure() {
      this.visibleMeasure = this.visibleMeasure || 0;
      this.visibleMeasure = (this.visibleMeasure + 1) % 2;
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
      requestAnimFrame(this.animateActiveCells.bind(this));
    },

    setupListeners: function setupListeners() {
      $('.main-control-bar, .drums-bar').on('click', this.animateButton);
      $('.play').one('click', this.getPlayPermission)
        .on('click', this.togglePlay.bind(this));
      $('.kit').on('click', this.toggleActiveKit);
      $('.sequence-grid-inner')
        .on('click', '.sequence-cell', this.toggleActiveCell);
      $('#tempo-input').on('input', this.setTempo);
      $('.clear').on('click', this.clearCells);
      $('.drums-bar').on('click', '.drum', this.previewDrum);
      $('.measure').on('click', this.toggleVisibleMeasure);
      $(window).on('resize', this.respondToOrientationChange);
    },

    loadSounds: function loadSounds() {

      // map of mp3 file names
      const drums =
        ['hat', 'kick', 'snare', 'tom', 'crash', 'perc1', 'perc2', 'perc3'];

      Object.keys(model.kits).forEach((kit) => {
        drums.forEach((drum, index) => {
          const request = new XMLHttpRequest();
          // const audioUrl = `/assets/${kit}/${drum}.mp3`;
          const audioUrl = `/drum-sequencer/assets/${kit}/${drum}.mp3`;

          request.open('GET', audioUrl);
          request.responseType = 'arraybuffer';

          request.onload = function onload() {

            // convert arraybuffer to audio buffer
            model.audio.decodeAudioData(request.response, (buffer) => {

              // insert audio buffer into corresponding slot in kit array
              model.kits[kit][index] = buffer;
            });
          };
          request.send();
        });
      });
    },

    /**
     * work around mobile browser audio restrictions. Playing any sound,
     * including silence, on direct user trigger of an event lifts restrictions.
     * This function is called once: the first time user presses 'play'
     */
    getPlayPermission: function getPlayPermission() {
      const inaudible = model.audio.createBuffer(1, 22050, 44100);
      model.triggerSound(inaudible);
    },

    // obsessive MVC structuring
    togglePlay: function togglePlay() {
      model.togglePlay();
      view.togglePlay();
    },

    toggleActiveKit: function toggleActiveKit() {
      model.toggleActiveKit();
      view.toggleActiveKit();
    },

    toggleActiveCell: function toggleCell(e) {
      const row = $(e.target.parentElement).index();
      const column = $(e.target).index();
      const height = model.grid.height;

      // convert cell grid coordinates into ordinal number
      model.toggleActiveCell((row * height) + column);
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

    /**
     * animateActiveCells() continuously checks if any scheduled beats have played,
     * and animates the coresponding grid row as needed. default lastRow = -1
     * means no rows have been animated yet
     */
    animateActiveCells: function animateActiveCells(lastRow = -1) {
      let rowToAnimate = lastRow;
      const currentTime = model.audio.currentTime;

      // if a queued beat has played...
      while (model.beatsInQueue.length && model.beatsInQueue[0].time < currentTime) {

        // ... set its row to be animated, and remove it from queue
        rowToAnimate = model.beatsInQueue[0].beat;
        model.beatsInQueue.splice(0, 1);
      }

      // if the while loop updated row to be animated, animate the row
      if (lastRow !== rowToAnimate) {
        const row = `.sequence-row:nth-child(${rowToAnimate + 1})`;
        view.animateActiveCells(`${row} > .sequence-cell`);

        // update last row that was animated
        lastRow = rowToAnimate;
      }
      requestAnimFrame(animateActiveCells.bind(this, lastRow));
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
    },
  };

  controller.initialize();
});
