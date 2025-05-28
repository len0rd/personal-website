

Defining CANBus messages with a DBC file
========================================
 
.. post:: 03, December 2024
   :tags: embedded, development, toolchain
   :category: Projects
   :author: len0rd


DBC files are a standard way to define the messages that will be transmitted over a raw CANBus.
While working with this format I found it easy to find tools that could interpret, use, and generate DBC files.
However I had a hard time finding resources to describe the format and schema of these files. This post describes
some of the schema details I found the most helpful, many of which I had to learn by digging through the source
code of tools that work with DBC files. Personally, I find examples the easiest way to learn/understand
schema basics, so I'll use that here while also describing the schema itself.

Here are a few useful resources I found while trying to work with DBC files:

- This repository provides a useful overview of the DBC spec along with a basic example DBC file: https://github.com/stefanhoelzl/CANpy
- This repository can serialize/deserialize DBC files into python objects, generate code from them, etc: https://github.com/cantools/cantools


Defining a message
------------------

Defining a message is a well-documented, core function of DBC files. Here's an example:

.. code-block:: dbc
    :linenos:

    BO_ 608 TEMPERATURE_RH: 8 UNITB
     SG_ TMPD  :  0|1@1+    (1,0) [0|1]          ""   UNITA
     SG_ RHD   :  1|1@1+    (1,0) [0|1]          ""   UNITA
     SG_ FLT1  :  2|1@1+    (1,0) [0|1]          ""   UNITA
     SG_ FLT2  :  3|1@1+    (1,0) [0|1]          ""   UNITA
     SG_ TEMP1 : 16|16@1- (0.1,0) [-32768|32767] "C"  UNITA
     SG_ TEMP2 : 32|16@1- (0.1,0) [-32768|32767] "C"  UNITA
     SG_ RH1   : 48|8@1+    (1,0) [0|255]        "%"  UNITA
     SG_ RH2   : 56|8@1+    (1,0) [0|255]        "%"  UNITA


| ``BO_`` is used to define a new message. 
| Format: ``BO_ <CAN-ID> <MessageName>: <MessageLength> <SendingNode>``

So in the above example, this message has a CAN frame ID of ``608``, is named "TEMPERATURE_RH", is ``8`` bytes in length and is sent by a CAN network node named "UNITB".

| Within the "TEMERATURE_RH" message, a number of "signals" (aka message fields) are defined, using ``SG_``.
| Format: ``SG_ <SignalName> : <StartBit>|<Length>@<Endianness><Signed> (<Factor>,<Offset>) [<Min>|<Max>] "[Unit]" [ReceivingNodes]``

Given the above message definition, the CAN payload will look like this:

.. bitfield::
    :bits: 64
    :lanes: 2
    :vflip:
    :vspace: 192
    :fontfamily: monospace
    :caption: TEMPERATURE_RH bitmap
    :fontcolor: grey

    [
        { "name": "TMPD", "rotate": "-90", "bits": 1},
        { "name": "RHD", "rotate": "-90", "bits": 1},
        { "name": "FLT1", "rotate": "-90", "bits": 1},
        { "name": "FLT2", "rotate": "-90", "bits": 1},
        { "name": "reserved",  "bits": 12, "type": 5},
        { "name": "TEMP1",  "bits": 16},
        { "name": "TEMP2",  "bits": 16},
        { "name": "RH1",  "bits": 8},
        { "name": "RH2",  "bits": 8}
    ]

And here's one way it could look in a C++ struct representation:

.. code-block:: cpp
    :linenos:

    struct TemperatureRh {
        uint8_t TMPD : 1;
        uint8_t RHD : 1;
        uint8_t FLT1 : 1;
        uint8_t FLT2 : 1;
        uint16_t _reserved : 12;
        int16_t TEMP1;
        int16_t TEMP2;
        uint8_t RH1;
        uint8_t RH2;

        constexpr size_t WIRE_SIZE_BYTES = 8;
    } __attribute__((packed));


Node names are arbitrary, but the list of possible nodes should be defined at the top of a DBC file using ``BU_``

.. code-block:: dbc

    BU_: UNITB UNITA


Documenting messages
--------------------

Documenting messages and signals is done using the ``CM_`` keyword:

.. code-block:: dbc
    :linenos:

    CM_ BO_ 608 "Current Temp / % RH.";

    CM_ SG_ 608 TMPD "Set if Sensor 1 / Sensor 2 Temp data differs by more than 3 degC";
    CM_ SG_ 608 RHD "Set if Sensor 1 / Sensor 2 % RH data differs by more than 5%";
    CM_ SG_ 608 FLT1 "Set if Sensor 1's diagnostics indicate an error";
    CM_ SG_ 608 FLT2 "Set if Sensor 2's diagnostics indicate an error";
    CM_ SG_ 608 TEMP1 "Sensor 1's temp reading as a signed 16-bit value. **LSB =** 0.1 degC";
    CM_ SG_ 608 TEMP2 "Sensor 2's temp reading as a signed 16-bit value. **LSB =** 0.1 degC";
    CM_ SG_ 608 RH1 "Sensor 1's % RH value as an unsigned 8-bit value. **LSB =** 1%";
    CM_ SG_ 608 RH2 "Sensor 2's % RH value as an unsigned 8-bit value. 
    **LSB =** 1%";

Format: ``CM_ [<BU_|BO_|SG_> [CAN-ID] [SignalName]] "<DescriptionText>";``

Since these specify the specific signal/message they apply to, you can place them anywhere in a DBC file. Note comments can span multiple lines.


Specifying default values for signals
-------------------------------------

Sometimes it can be helpful to define default initial values of certain signals in a message. This can be done using an "Attribute" named "GenSigStartValue".

In order to use attributes, you need to first define them using ``BA_DEF_``. Its format looks like this:

``BA_DEF_ [BU_|BO_|SG_] "<AttributeName>" <DataType> [Config];``

The data in ``[Config]`` is dependent on the ``<DataType>``. of the attribute being defined. "GenSigStartValue" is a ``INT`` type, so the format of ``[Config]`` will be ``<min> <max>``.
I think in the case of "GenSigStartValue", the min and max values dont really matter (at least it doesnt when using a lenient parser like `cantools <https://github.com/cantools/cantools>`_ )

You can define a default value for an attribute using ``BA_DEF_DEF_``. 

.. code-block:: dbc

    BA_DEF_ SG_ "GenSigStartValue" INT -100000 100000;
    BA_DEF_DEF_ "GenSigStartValue" 0;

This definitions need only be made once per DBC file.

Once you've defined the attribute, you can use it to set default/initial values for signals. For instance, using our message from earlier:

.. code-block:: dbc

    BA_ "GenSigStartValue" SG_ 608 TEMP1 -32768;
    BA_ "GenSigStartValue" SG_ 608 RH1 255;
    BA_ "GenSigStartValue" SG_ 608 RH2 254;

Using this information to generate a C++ struct representation may look something like this:


.. code-block:: cpp
    :linenos:

    struct TemperatureRh {
        uint8_t TMPD : 1;
        uint8_t RHD : 1;
        uint8_t FLT1 : 1;
        uint8_t FLT2 : 1;
        uint16_t _reserved : 12;
        int16_t TEMP1 = -32768;
        int16_t TEMP2;
        uint8_t RH1 = 255;
        uint8_t RH2 = 254;

        constexpr size_t WIRE_SIZE_BYTES = 8;
    } __attribute__((packed));


Bringing it all together
------------------------

We've now defined, commented, and set some default values for a single message. If this were the only message in a DBC file, the file would look like this:

.. code-block:: dbc
    :linenos:

    VERSION ""

    BA_DEF_ SG_ "GenSigStartValue" INT -100000 100000;
    BA_DEF_DEF_ "GenSigStartValue" 0;

    BU_: UNITA UNITB

    BO_ 608 TEMPERATURE_RH: 8 UNITB
     SG_ TMPD  :  0|1@1+    (1,0) [0|1]          ""   UNITA
     SG_ RHD   :  1|1@1+    (1,0) [0|1]          ""   UNITA
     SG_ FLT1  :  2|1@1+    (1,0) [0|1]          ""   UNITA
     SG_ FLT2  :  3|1@1+    (1,0) [0|1]          ""   UNITA
     SG_ TEMP1 : 16|16@1- (0.1,0) [-32768|32767] "C"  UNITA
     SG_ TEMP2 : 32|16@1- (0.1,0) [-32768|32767] "C"  UNITA
     SG_ RH1   : 48|8@1+    (1,0) [0|255]        "%"  UNITA
     SG_ RH2   : 56|8@1+    (1,0) [0|255]        "%"  UNITA

    CM_ BO_ 608 "Current Temp / % RH.";

    CM_ SG_ 608 TMPD "Set if Sensor 1 / Sensor 2 Temp data differs by more than 3 degC";
    CM_ SG_ 608 RHD "Set if Sensor 1 / Sensor 2 % RH data differs by more than 5%";
    CM_ SG_ 608 FLT1 "Set if Sensor 1's diagnostics indicate an error";
    CM_ SG_ 608 FLT2 "Set if Sensor 2's diagnostics indicate an error";
    CM_ SG_ 608 TEMP1 "Sensor 1's temp reading as a signed 16-bit value. **LSB =** 0.1 degC";
    CM_ SG_ 608 TEMP2 "Sensor 2's temp reading as a signed 16-bit value. **LSB =** 0.1 degC";
    CM_ SG_ 608 RH1 "Sensor 1's % RH value as an unsigned 8-bit value. **LSB =** 1%";
    CM_ SG_ 608 RH2 "Sensor 2's % RH value as an unsigned 8-bit value. **LSB =** 1%";

    BA_ "GenSigStartValue" SG_ 608 TEMP1 -32768;
    BA_ "GenSigStartValue" SG_ 608 RH1 255;
    BA_ "GenSigStartValue" SG_ 608 RH2 254;


There's a lot more that can be done in DBC files like defining Enum values (using ``VAL_``), groups of signals, multiplexed
messages (where a messages meaning/Signals change based on the value of one signal), and more. But this covers the basics that I 
found most helpful while generating code from a DBC file.
