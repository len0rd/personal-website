# Darkstar Quadcopter

The Darkstar is a RC quadcopter with the ability to fly autonomously through pre-designated waypoints, using advanced estimation techniques and object avoidance.

..At least that is the end-goal. Getting there however requires resources I simply do not have as a college student (read: money). Given such constraints, building an advance copter on the cheap sounded like a good challenge. Perhaps you can learn from my mistakes if you're interested in such a venture.

Having landed a gig at an autonomous flight research center for the summer, I figured now was as good a time as any to dive into the exciting world of quadrotors - a world I've always been interested in, but never had the time to sit down and learn.

## Part 1: Part Selection

As is the case with most hobbies, much of my money was spent on initial startup costs: an RC transmitter and battery charger, while essential, would only need to be purchased once. If I want to build more rc-craft in the future, this will make it a lot easier.

![FrSky Taranis QX7](img/writeup/frsky-contoller.jpg)

**Transmitter:** I went with a [FrSky Taranis QX7](https://www.amazon.com/dp/B06XC4C4WH) for a few reasons:

1. It's "cheap": This is a pretty feature-rich transmitter for the price. Amazon has it priced fairly high, but I managed to pick mine up from [ProgressiveRC](https://www.progressiverc.com/) for $105, shipping was free and fast.

2. Experience: I've been using/fiddling around with this transmitter at work while building some vehicles, so I had at least an introduction to the system, leaving me with one less thing to learn.

3. Aesthetic: From what I've seen, there are few transmitters out there that have any semblance of competent industrial design. This happens to be one of them. It's well-built with decent ergonomics and doesn't look overly tacky or intimidating. Plus it comes in white, which I really have been enjoying lately for some reason.

**Frame:** Really nothing special here. I got a [Reptile 500](https://www.ebay.com/sch/i.html?_nkw=reptile500+v3+quadcopter+frame) frame... or something. Honestly not sure on the name here. Basically my strategy was to browse [hobbyking](https://hobbyking.com) til I found something I liked, then I headed over to ebay, to buy something similar. You can get frames for pretty cheap off there if you're willing to wait for it to ship from China. I wasn't, so I paid an extra $10 to get it from a US seller.

As Shipped:
![Frame as shipped](img/writeup/darkstar/frame-boxed-sm.jpg)

(Mostly) Assembled:
![Assembled](img/writeup/darkstar/frame-assembled-sm.jpg)

Some of the arms were a pain to secure:
![Arm Trouble](img/writeup/darkstar/frame-armtrouble-sm.jpg)

Overall I'm pretty happy with the frame. It's simple and it was cheap. At first I thought 500mm between motors would be huge, but I've grown to like it and how much space it gives me. I have plenty of room to jam all of my various gizmos throughout. Being cheap and from ebay, it was a bit of an effort to secure all the arms to the frame; aligning the holes was more difficult than anticipated. But once mounted they're pretty solid, and have already survived a few crashes with ease.

**Motors:** [LHI 2212 920KV](https://www.amazon.com/dp/B00XQYTZQ2) motors. Again, cheap and functional. The product I ordered from Amazon came with ESC's, which I thought was great, but I eventually had to swap out those ESC's, so overall, not worth the 'savings' I thought I was getting. I didn't have any idea as to what speed or motor rating I wanted, and initially I was worried that 920KV wouldn't be fast enough. However, seeing that 920 is used by the phantom reassured me and they work great. The copter isn't too acrobatic, but still has some 'umph'. Another great thing about these motors is they're built as DJI replacements, which means they also work with DJI's self-tightening props. Thank goodness! That makes portability/replacement so much easier.

I was stupid and tried to screw the motor in through all 4 holes on the arm with some aggressive dremeling, before realizing there were two holes for my motor size, and two for a different size.

![Motors attached](img/writeup/darkstar/motor-attached-sm.jpg)

DJI props! So much easier than the other nightmares I've worked with in the past.

![DJI Props](img/writeup/darkstar/motor-djiprops-sm.jpg)

**Receiver:** [FrSky D4R-II](https://www.amazon.com/gp/product/B00SWHWFWO/) Cheap, compatible, capable. I would be comfortable with any FrSky CPPM receiver here.

**ESC:** [Makerfire 20A](https://www.amazon.com/gp/product/B01DEN46I6) As I mentioned above, the ESC's that came with my motors had some weird issues... Actually come to think of it, it was likely my own stupidity that was the issue. It's okay though, the makerfire esc's get the job done, and are a factor of magnitude smaller/lighter than my original esc's, so I'll consider that a win.

**Flight Controller:** Flip32+ This is one of those parts that I didn't want to skimp out on or mess around with. This is the board that we use fairly exclusively at work, so I'm familiar with it, and it's a reasonable price. The cheaper Chinese versions of these have been known to have some IMU/Gyro issues, so we only buy these from [readytoflyquads](http://www.readytoflyquads.com/the-flip32-187)

**Battery:**Currently I'm using a 2200mAh 3S LiPo battery, but as of writing this, I'm looking at stepping up to a 4 or 5000mAh. 2200 is adequate in terms of flight time, but as I throw more gear on this thing, it'd be good to have something a bit larger.

### Assembly
Mostly I just added things on here and there as I got them in the mail. I had most of the frame pieces setup and ready to go by the time I had my big 'assembly party'... alone... on a Friday night.... Help me:

Receiver mounted on top with a twist tie, ESC's secured on the arm with some good velcro/zip ties:
![Receiver mounted](img/writeup/darkstar/assembly-1-sm.jpg)

This plate+anti-shock mount combo was intended to go in the front of the drone for fpv. While that is something I would like to eventually add, this plate also happened to be the perfect size for the Flip32. So I drilled a few holes, allowing me to mount the naze as close to the center of gravity as was reasonable:
![Flip32 Mount](img/writeup/darkstar/assembly-2-sm.jpg)

Assembly can get messy:
![Assembly environment](img/writeup/darkstar/assembly-3-sm.jpg)

This is the handiest edition I think I've made. This allows me to plug in the battery with the confidence that the motors aren't going to immediately attack me. Currently I only use one side of the switch, but in the future I plan on having one side turn everything on, while the other side only turns on the small electronics(and not the finger-slicing motors):
![Power switch](img/writeup/darkstar/assembly-4-sm.jpg)

Power distribution soldered and mounted! The velcroed piece at the top is my 5V BEC:
![Power distribution](img/writeup/darkstar/assembly-5-sm.jpg)

Naze (aka Flip32) mounted! This is all a bit tighter than anticipated:
![Naze mounted](img/writeup/darkstar/assembly-6-sm.jpg)

Todo: cable management
![Cable management](img/writeup/darkstar/assembly-7-sm.jpg)

Also Todo: Secure the battery in a non-terrible way
![Secure battery](img/writeup/darkstar/assembly-8-sm.jpg)

## Part 2: Fixes and Tweaks
Its been a few weeks since writing part 1 and a lot has changed. For starters the thing actually flies now. As I mentioned in part 1 I had some troubles getting my first set of esc's to work correctly. So I replaced them with new, smaller ones, and *still* had trouble with them. That is until I finally sat down and figured out how to calibrate them (protip: read the instructions that come with your products!). With that squared away, this hunk of junk finally became a flyable drone as opposed to a 180deg flipping machine, as shown in the video below.

<iframe width="560" height="315" src="https://www.youtube.com/embed/TKvzu6X0z1E" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

Unfortunately I dont have any footage of the first successful flights(I was out by myself, as usual), but just know it was legendary. Flight 1 went well until I accidentally crashed into a pine tree, which provided a surprisingly cushy landing. Flight 2 was absolutely beautiful until I somehow managed to clothesline my drone on literally the only power line in the immediate vicinity. The rest of the initial flights followed a similar pattern. All-in-all, I ended up buying another 4 sets (with 2/set) of props, after breaking 4 of them. Seeing as this was my first real drone-flying experience, and I was still tweaking some of the settings, I chalk it up to the cost of learning.

![Broken Props](img/writeup/darkstar/tweaks-1-sm.jpg)

### Sim Practice

Around this time I also discovered a nifty, cheap piece of software: [fpv-freedrider](https://fpv-freerider.itch.io/fpv-freerider). This is simple but functional simulator that is handy to practice on. I simply plugged my transmitter via usb into my machine and it recognized it straight away. All I had to do was calibrate once in the software and I was off to the sim. This definitely helps with mastering some basic flight skills, but naturally its not as difficult as the real thing. And I've found the best way to learn to fly is having the constant threat of a catastrophic crash looming over you and every decision you make (while flying that is).

### LED Upgrade

These days its basically an undeniable fact that RGB LEDs make everything in this world better. And you'd be a fool to think I wasn't planning on adding them from the beginning. With the quad finally getting up in the air, I needed something to make my crashes look *cooler*. and boy-oh-boy did the LEDs fit the bill. The LEDs are programmed through an Arduino and change state/pattern based on the CPPM input coming from the rc receiver!

I've been planning for some time to integrate an Arduino nano into the copter because of the rapid prototyping I'll be able to do with various sensors that work with it. LED control was the perfect first-step to get the Arduino project online. This was also my first time working with the Arduino and LED control is the simple (and traditional!) place to start.  Here's an overview of how the LED control works as of this writing:

- When the craft is disarmed, the LEDs fade in and out

- When armed, the LEDs switch to solid illumination

- If armed, and not in autopilot mode, if the incoming CPPM command does change *enough* (ie the current command hasn't deviated by some delta compared to multiple past commands), then the LEDs alternate from solid to blinking about one every 1.5 seconds, until a new unique command is read.

The backbone of this project is an absolutely killer [CPPM library](https://github.com/jmparatte/CPPM) developed by Jean-Marc Paratte. The library is very simple to use, and the examples are self-explanatory. It was pretty accurate with my 8-channel FrSky receiver. With that library in place, the rest was just some good 'n simple state machine logic. If you're interested in taking a peek, here's [the repository](https://github.com/len0rd/darkstar_copter). Release 0.1 has the basic LED state machine using CPPM. After that release I've added some more features, making it a bit more complex (I'll write about those later, when I know they all work properly).

Assembly was easy. For now, I'm running all 4 LEDs off one MOSFET and 1 pin on the Arduino. This is so I have more pins available for other sensors in the future, but it would also be cool to have each arm individually controlled. [Here](https://www.amazon.com/gp/product/B017X92K9Y) are the LEDs I used. [This guy](https://www.youtube.com/watch?v=sVyi7yWuXxs) is pretty helpful if you need help figuring out how to use a MOSFET + Arduino to control 12V LEDs. These LEDs are actually a really good reason to use a 3S LiPo battery, since its standard voltage is ~12V ish.