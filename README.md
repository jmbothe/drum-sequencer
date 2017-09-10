![logo](/assets/logo.jpg)
---

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

[Try it out!](https://jmbothe.github.io/drum-sequencer/dist)

<a name="description"/>

## Description

This is a very basic drum sequencer that has three options for drum kit sounds, two toggle-able measures of 16th notes, and a tempo slider that ranges between 30bpm and 150bpm. It was originally conceived as a learning exercise in jQuery, but quickly grew to double as a serious challenge in wrangling the Web Audio API.

#### How is jQuery used in this drum sequencer?
* To setup listeners for events like clicks and other user input.
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

I began building this drum sequencer with the most basic concept of how audio could play back in a browser setting: namely, the `<audio>` element. After I had the basic grid setup and running, it became quickly and painfully obvious that the `<audio>` element was not going to be up to scruff. It's slow, imprecise, and suffers from harsh (but justifiable) restrictions in mobile browsers. After much hand-wringing, hair-pulling, and rabbit-hole-chasing ("maybe I just need to reduce the audio file size?" "Maybe I need to store the audio file as a base64 encoded string in local storage?") I discovered the Web Audio API through Boris Smus's [tutorial](https://www.html5rocks.com/en/tutorials/webaudio/intro/). What a game changer! Thanks to this powerful API, I was able to decode the audio, set up asynchronous playback, and implement a very simple work around to mobile browser audio restrictions (so simple that it makes you wonder what good the restrictions are).

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

It performed reasonably well in a laptop browser, but when used on a mobile browser the timing would lag severely whenever the orientation changed, or whenever the user toggled the measure view or other buttons. Sometimes it would get so far behind that it would lose the rhythm completely, sounding as though it were galloping rather than keeping precise time. As you may already know, this is due to the way the JS engine event loop is structured. In one cycle of the event loop, setTimeout callbacks are processed after all other functions in the call stack, and so their timing is only guaranteed as a minimum timeout. In practice, it could be a significantly longer timeout depending on how backed up the stack is.

Continuing on the Web Audio API tutorial search, I found [this gem](https://www.html5rocks.com/en/tutorials/audio/scheduling/) by Chris Wilson, wherein he lays out a basic framework for scheduling audio events with razor-sharp precision. The Web Audio API has its own clock that is more precise than the JS clock by orders of magnitude, and since Web Audio events are processed on their own thread, their firing is not delayed by other events occurring on the main JS execution thread. Implementing Chris's framework meant completely restructuring my audio model, digging deep to understand the functionality of three different timing systems--`setInterval`, `AudioContext.currentTime()`, and `requestAnimationFrame()`--and tweaking and restructuring all of it to fit this project's specific needs. But the end result is a world of difference in terms of performance. Now you can rapidly toggle every cell in the sequencer grid, recklessly toggle back and forth between measures, adjust the tempo in real time, and repeatedly swap out drum samples without ever losing a beat.

### Browser compatability and the usefulness of tools.

I listen to several JavaScript podcast and follow a few blogs, and some common themes I have noticed include the debate over the proliferation of JS frameworks and tools, complaints about so-called "JavaScript Fatigue", and some calls for a back-to-basics approach to coding. As a newbie I have found all of these conversations edifying, but I haven't really had to deal with any of these problems first-hand because all of my projects are very light-weight. The only tool I am currently using is Babel for compiling my JS to browser-compatible code. I've found it nearly impossible to keep up with which features are compatible with which browsers, so it's nice to know that there is at least one quick, easy step I can take to alleviate certain time-consuming frustrations. For this project specifically, I knew ahead of time that Internet Explorer wouldn't support the Web Audio API, and I coded a `try... throw` statement that would alert IE users as such. But before I had compiled the code with Babel, IE was throwing errors about ES2015, blocking further code execution, and preventing users from seeing the alert. Granted that a nasty alert telling you your browser sucks is not every user's dream, but it's significantly better than a half-loaded frozen app with zero functionality. I am sure that down the road I will feel the fatigue and learn to loathe my apps' dependencies, but for now I am drinking the Babel Kool-Aid and loving it.

### Note on Accessibility

There is so, so, so much more I could do to make this app (and all of my apps) more accessible. However, I would like to specifically point out, for anyone who might be conerned, that I intentionally set the maximum tempo to 150bpm so that--in accordance with the WCAG 2.0 specifications regarding design features known to cause seizures--the grid rows would flash fewer than three times per second.

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
* [99 Sounds](http://99sounds.org/), free sound effects and sample libraries

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
