# drum sequencer

#### A learning project focused on leveling-up with:
* [Jquery](https://jquery.com/) DOM traversal and manipulation.
* The [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
* The [model/view/controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) software architecture pattern.
* Principles of [clean](https://github.com/ryanmcdermott/clean-code-javascript), [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself), [self-documenting code](https://en.wikipedia.org/wiki/Self-documenting_code).
* Mobile-first responsive design.

## Table of Contents

1. [Demo](#demo)
2. [Description](#description)
3. [Highlights and Discussion](#highlights)
4. [Contributing](#contributing)
5. [Author, Credits and Links](#author)
5. [License](#license)

<a name="demo"/>

## Demo

[Try it out!](https://jmbothe.github.io/drum-sequencer/)

<a name="description"/>

## Description

This is a very basic drum sequencer that has three options for drum kit sounds, two toggleable measures of 16th notes, and a tempo slider that ranges between 30bpm and 200bpm. It was built as a learning exercise in jQuery, but quickly grew to double as a serious challenge in wrangling the Web Audio API.

#### How is jQuery used in this drum sequencer?
* To setup event listeners for clicks, user input, and window resizing.
* To animate interactive elements of the drum sequencer.
* To dynamically manipulate text content.
* And much, much more!

#### What about the Web Audio API?
* To decode, route and playback drum sounds.
* To schedule audio events with highly precise timing and very low latency.
* To manage dynamic tempo setting during playback.

<a name="highlights"/>

## Highlights and Discussion

### Web Audio Love.

I began building this drum sequencer with the most basic concept how audio could be played back in a browser setting: namely, the `audio` element. After I had the basic grid setup and running, it became quickly and painfully obvious that the `audio` element was not going to be up to scruff. It's slow, imprecise, and suffers from harsh (but justifiable) restrictions in mobile browsers. After much hand-wringing, hair-pulling, and rabbit-hole-chasing ("maybe I just need to reduce the audio file size?" "Maybe I need to store the audio file as a base64 encoded string in local storage?") I discovered the Web Audio API through Boris Smus's [tutorial](https://www.html5rocks.com/en/tutorials/webaudio/intro/). What a game changer! Thanks to this powerful API, I was able to decode the audio, set up asynchronous playback, and implement a very simple work around to mobile browser audio restrictions (so simple that it makes you wonder what good the restrictions are).

### Clocks, clocks and more clocks.

Once I learned the basics of setting up and playing back audio through the Web Audio API, I figured I was nearly finished building the drum sequencer. Man was I wrong. To keep time, I was using a recursive setTimeout setup that looked something like this:

```
row = 0

function runSequencer() {
  // if sequencer is playing
  // iterate over current row and play sounds for toggled grid cells
  row++
  setTimeout(runSequencer, tempo);
}
```

It performed reasonably well in a laptop browser, but when used on a mobile browser the timing would lag severely whenever the orientation changed, or whenever the user toggled the measure view or other buttons. Sometimes it would get so far behind that it would lose the rhythm completely, sounding as though it were galloping rather than keeping precise time. Continuing on the Web Audio API tutorial search, I found [this gem](https://www.html5rocks.com/en/tutorials/audio/scheduling/) by Chris Wilson, wherein he lays out a basic framework for scheduling audio events with razor-sharp precision. The Web Audio clock is more precise than JS clock by orders of magnitude, and since Web Audio events are processed on their own thread, their firing is not delayed by other events occurring on the main JS execution thread. Implementing Chris's framework meant completely restructuring my audio model, digging deep to understand the functionality of three different timing systems--`setInterval`, `AudioContext.currentTime()`, and `requestAnimationFrame()`--and tweaking and restructuring all of it to fit this project's specific needs. But the end result is a world of difference in terms of performance. Now you can rapidly toggle every cell in the sequencer grid, recklessly toggle back and forth between measures, and swap out drum samples without ever losing a beat.

### Responsive design nightmare.

text

<a name="contributing"/>

## Contributing

Your contributions are very welcome! The best thing you could possibly do is break this code and then let me know about it. Contact me or open an issue to discuss potential changes/additions.

<a name="author"/>

## Author, Credits and Links

Author
* Jeff Bothe, @jmbothe

Inspiration
* [Getting Started with the Web Audio API](https://www.html5rocks.com/en/tutorials/webaudio/intro/), Boris Smus, @borismus
* [A Tale of Two Clocks](https://www.html5rocks.com/en/tutorials/audio/scheduling/), Chris Wilson, @cwilso
* [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript), Ryan McDermott, @ryanmcdermott

<a name="License"/>

## License

#### (The MIT License)

Copyright (c) 2017 Jeff Bothe

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**[Back to top](#table-of-contents)**
