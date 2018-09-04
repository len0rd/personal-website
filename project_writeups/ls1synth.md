# LS-1: Modular Synth

The LS-1 is a modular oscillator and sequencer, and includes 2 LFO’s (low-frequency oscillators), one external oscillator, and the oscillator attached to the sequencer. The sequencer itself is made up of a counter which acts as a LFO/clock divider, and dual muxes to select the feedback resistance and led to display. The counter outputs and mux select inputs have ports on the front-panel allowing the user to mix and match LFO divisions with mux selects, thus creating custom sequences.

This build included a lot of firsts for me. This is the first time I’ve used Eagle to create a PCB/schematic (which should honestly be considered an atrocity given I am a Computer Engineering student), my first in creating a metal case using a water jet, and in general this is my first large-scale hobby project.

## Case

### Design

Originally I was hoping to pack everything into a 1U 19″ package, using the case of an old network switch I had laying around, but I soon realized to include all the I/O I wanted I would have to increase the size, so I made the logical step up to 2U. Even with the increased size, its a pretty cozy fit for the front panel. I did some prototype configurations for different control sections using cardboard and the components I was planning on using, testing which layout I found to be the most natural.

![Layout prototype](/img/writeup/ls1synth/case-1-sm.jpg)

Following this, I designed the case in Autodesk Inventor (since it’s free to students, I’m more of a Solidworks guy personally). It had been a few years since I had needed to touch Inventor, so it was a little rough, but I got the job done. Going in I knew I was planning on cutting this on my university’s water jet, so I built it all off a single sketch, taking into account how the faces would link together. I also decided to make a timelapse of the process, mostly for my own enjoyment, but feel free to watch and mock my terrible CAD skills:

<iframe width="560" height="315" src="https://www.youtube.com/embed/iJbLcks4f_g?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

This timelapse shows the majority of the design, but not all of it. Following this I consulted with my ME friend about how to build a proper metal case. He suggested cutting small circles where corners would fold to make sure excess material didn't get in the way. Before the water jet, I also made some slight modifications the the front panel layout - mostly related to spacing between components.

### Build

With the panel designed, I simply needed to export the sketch face to a format the water jet would understand. I purchased a decently high gauge sheet of steel (maybe 12? I cannot remember) from my university and they cut it to roughly the dimensions I would need. Despite being a student, many of the resources I used for this part of the project are open to the public. If you're looking to do something similar, it never hurts to check with your local university's engineering/technology department to see what resources they have available.

![Metal sheet cut and ready for the jet](/img/writeup/ls1synth/case-2-sm.jpg)

With the metal sheet cut, I was ready to cut out the case with the water jet. My university charges for how much time you use a product, and since the case is not too large, this only cost me around $20. Putting the case portion of the project at ~$30 total! This was my first time using a water jet, so it was a very big deal for me. Computer Engineering is fun and all, but you don't get enough chances to play with big toys like other disciplines do.

### TODO: video embed
![Metal sheet cut and ready for the jet](/img/writeup/ls1synth/case-waterjet.mp4)

