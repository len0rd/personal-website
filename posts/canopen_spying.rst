
Spying on a CANOpen bus
=======================

.. post:: 13, December 2024
   :tags: embedded, development
   :category: Projects
   :author: len0rd

`CANOpen <https://en.wikipedia.org/wiki/CANopen>`_ is a protocol stack that sits on top of a normal CANBus.
Recently I found myself needing to monitor the traffic between 2 devices on a CANOpen network. Monitoring a
CANbus by itself is easy to do with a little Python. Where I ran into difficulty was interpreting the
raw CANbus frames into CANOpen messages. Here's how I solved that.

Hardware Setup
--------------

First, I had to insert a CAN<->USB adaptor into the network as a silent listener. I've used the expensive 
`IXXAT USB-to-CAN adaptor <https://www.hms-networks.com/p/1-01-0281-12002-ixxat-usb-to-can-v2-compact#>`_ and
would not recommend it. It doesnt provide enough value for the price. 
`CANable <https://canable.io/>`_ (and its `cheap knockoffs <https://www.amazon.com/gp/product/B0CRB8KXWL>`_) 
have worked just fine for my needs. Any adaptor that supports Linux socketcan will work in this demonstration

Once the adapter was installed on the CAN network and properly terminated, I needed to configure it on Linux
to connect to the bus in ``listen-only`` mode, allowing me to be a silent observer. For instance:

.. code-block:: bash

    # note: listen-only disables TX
    sudo ip link set can0 type can bitrate 1000000 listen-only on
    sudo ip link set can0 up

Software Setup
--------------

As mentioned, logging raw CAN frames is easy with the `python-can <https://python-can.readthedocs.io/en/stable/>`_ package.
For instance (using the can0 network created in the previous bash block):

.. code-block:: python
    :linenos:

    import can # using v4.4.2 at time of writing
    from datetime import datetime
    from pathlib import Path

    channel = "can0"
    now_str = f"{datetime.now():%Y_%m_%d-%H_%M_%S%z}"
    SCRIPT_ROOT = Path(__file__).parent.resolve()
    file_desc = input("Enter description for filenames: ")
    root_filename = f"canopen_{now_str}_{file_desc}"

    # create python canbus and log packets to a TRC logfile
    canbus = can.ThreadSafeBus(interface="socketcan", channel=channel)
    trc_logfile = SCRIPT_ROOT / "logs" / f"{root_filename}.trc"
    trc_logger = can.TRCWriter(trc_logfile)
    # canbus automatically logs packets to the shell and trc file
    notifier = can.Notifier(canbus, [can.Printer(), trc_logger])

    user_in = input("Press enter to stop capture... ")
    print("Closing canbus/logs")
    notifier.stop()
    canbus.shutdown()


Now I have a file with raw CAN frames. Interpreting those to CANopen messages would be pretty tedious.
I had a hard time finding any tools that could do this for me until I eventually stumbled on the tiny
`canopen-message-interpreter <https://github.com/hilch/canopen-message-interpreter>`_ python project.
This takes a CANbus logfile, parses valid CANopen messages from it, and saves the results in a CSV file:

.. csv-table::
    :header: "Message Number","Time [ms]","ID","DLC","Data Bytes","CANopen","Node","Index","Subindex","Interpretation"

    "0","0.000","0x0080","0","[]","EMCY","-","-","-","SYNC"
    "1","0.486","0x0181","8","[0x19 0xc4 0xfc 0xff 0xd6 0xf4 0xff 0xff]","PDO1_T","1","-","-","Transmit PDO1"
    "2","143.334","0x0581","8","[0x4b 0x40 0x60 0x00 0x07 0x01 0x00 0x00]","SDO_T","1","0x6040","0","server: upload response = [0x07 0x01] --> [\x07\x01]"


This is a great start. I can now see an interpretation of the CANOpen packets being sent on the network. As expected,
there's a series of SDO, PDO, NMT, SYNC, etc messages getting passed around.

But I want to take it a step further. CANopen has a spec for an "Electronic Data Sheet" or "EDS" file. EDS can be used
to define the objects that can be passed around a CANopen network. I believe CAN-In-Automation, the maintainers of the
CANOpen spec, require vendors to create one of these files to be CANOpen certified. A number of tools exist
to create/modify these files and generate code from them. Under the hood an EDS file is just a big `.ini` file.
For instance, here's a portion of EDS file I was using:


.. code-block:: ini


    [1000]
    ParameterName=Device type
    ObjectType=0x7
    ;StorageLocation=PERSIST_COMM
    DataType=0x0007
    AccessType=ro
    DefaultValue=0x00000000
    PDOMapping=0

    [1001]
    ParameterName=Error register
    ObjectType=0x7
    ;StorageLocation=RAM
    DataType=0x0005
    AccessType=ro
    DefaultValue=0x00
    PDOMapping=1

Given the simple format, it was easy to extend canopen-message-interpreter to support reading in an EDS,
then filling in information about SDO's: their name and an interpretation of the value they were reading/writing.

Here's the resulting code: https://github.com/len0rd/canopen-message-interpreter/tree/feature/len0rd/eds_sdo

And here's an example of what the CSV would look like with the new columns added.

.. csv-table:: 
    :header: "Message Number","Time [ms]","ID","DLC","Data Bytes","CANopen","Node","Index","Subindex","Interpretation","SDO Name","SDO Value (hex)","SDO Value (int)"

    "26","3856.139","0x0601","8","[0x2b 0x40 0x60 0x00 0x00 0x01 0x00 0x00]","SDO_R","1","0x6040","0","client: download request = [0x00 0x01] --> [\x00\x01]","ControlWord","0x100","256"
    "60","3899.052","0x0601","8","[0x23 0x81 0x60 0x00 0x46 0x55 0x55 0x00]","SDO_R","1","0x6081","0","client: download request = [0x46 0x55 0x55 0x00] --> [FUU\x00]","Profile Velocity","0x555546","5592390"


Much more helpful. This made parsing logs much easier. I also updated the package so a CSV analysis could
be run right after a log was captured. Continuing the python code from earlier:

.. code-block:: python
    :linenos:

    import can # using v4.4.2 at time of writing
    from datetime import datetime
    from canopen_msg_interpreter import interpret
    from pathlib import Path

    channel = "can0"
    now_str = f"{datetime.now():%Y_%m_%d-%H_%M_%S%z}"
    SCRIPT_ROOT = Path(__file__).parent.resolve()
    file_desc = input("Enter description for filenames: ")
    root_filename = f"canopen_{now_str}_{file_desc}"

    # create python canbus and log packets to a TRC logfile
    canbus = can.ThreadSafeBus(interface="socketcan", channel=channel)
    trc_logfile = SCRIPT_ROOT / "logs" / f"{root_filename}.trc"
    trc_logger = can.TRCWriter(trc_logfile)
    # canbus automatically log packets to the shell and trc file
    notifier = can.Notifier(canbus, [can.Printer(), trc_logger])

    user_in = input("Press enter to stop capture... ")
    print("Closing canbus/logs")
    notifier.stop()
    canbus.shutdown()

    # now create the CSV from the logfile
    print("Run log through CANOpen analyzer...")

    interpret.analyze(
        trc_logfile, SCRIPT_ROOT.parent / "can_database" / "my_eds_file.eds"
    )
