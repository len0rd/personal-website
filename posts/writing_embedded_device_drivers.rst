.. writing_emb_dev_drivers

.. for symbols like left/right arrow
.. include:: <isonum.txt>

Writing Embedded Device Drivers
===============================

.. post:: 27, May 2025
    :tags: embedded, development, advice
    :category: Projects
    :author: len0rd

In this post I wanted to quickly describe some of the guiding principles I follow when writing device drivers in C++ for an embedded project. By "device driver" I mean the code that provides an interface between your application and some hardware device on an embedded system. For instance: an IMU, a temperature sensor, an ADC sensor, a motor controller, etc.

1: Use composition for the transport driver used by a device
------------------------------------------------------------

"Transport driver" could also be called peripheral code. This is the code that interfaces with a MCU's peripherals for various physical transport protocols. Like SPI, I2C, UART, CAN, etc. This is the code responsible for sending bytes back and forth from the MCU to the device you are controlling.

Composition should be used to provide this transport interface to your device driver. For example, here's the constructor of a temperature sensor that uses SPI:

.. code-block:: cpp
    :linenos:

    class TempSensor123 : public ITempSensor {
      public:
        TempSensor123(ISpibus& spi);
        // ...
      private:
        ISpibus& m_spi;
    };

Reasons to do this:

- Some transports, like SPI, I2C and CANbus can have multiple devices attached. Your device drivers should allow this possibility. Device drivers should not assume they have full control of a peripheral. Keeping peripheral code separate allows you to follow the logical structure of: one physical peripheral has one peripheral driver instance at runtime.

- On a similar note, using composition mimics the physical layout of the hardware: your device "has a" connection to a transport between itself and the MCU. This logically fits into a composition relationship.

- With composition, you can provide an interface reference (as shown in the above example). This allows dependency-injection for easy unit testing of the driver.

  - You can mock out your transport layer and verify the device driver sends and responds to bytes as expected.

  - I've found unit tests of device drivers extremely helpful as I can more easily track down bugs and even inaccuracy's in the vendors ICD.


2: Keep hardware-config specific info out of the device driver
--------------------------------------------------------------

This point is a follow-on to the previous. Any hardware-specific configuration that could change from one board to another should not be hardcoded in a driver.

For example: external ADC-current sense chips will often have an external sense resistor that your driver will need to know in order to convert a reported ADC value |rarr| Amps. Dont hardcode that resistor value in the driver! Require the information on construction:

.. code-block:: cpp
    :linenos:

    class AdcAdm1192 {
      public:
        AdcAdm1192(II2c& i2c, float senseResistorOhms);
    };

Doing this makes a driver more reusable and resilient to hardware changes down the line.

Your driver should never attempt to manually configure lower-level hardware. For instance, it should not attempt to reconfigure a provided SPI bus to a different bus speed. Configuring the peripherals provided to a driver should be the responsibility of a higher level. Your driver should assume all provided hardware interfaces (SPI, I2C, etc) are ready to go once provided on construction.

What your driver should do is provide configuration *suggestions* to whoever is responsible for configuring a transport. For instance, most SPI devices will define a max clock speed they can run at. Make info like this easily accessible from your driver:

.. code-block:: cpp
    :linenos:

    class TempSensor123 : public ITempSensor {
      public:
        /// Per the ICD, max SPI clock rate in hertz
        constexpr size_t MAX_SPI_CLK_HZ = 1000000;

        TempSensor123(ISpibus& spi);
    };

From here the code responsible for creating a SPI bus instance can make an informed decision about how to configure the bus before passing it over to your driver constructor.


3: Encapsulate the device request |rarr| reply protocol in structs
------------------------------------------------------------------

The basic gist of this point is dont hardcode register addresses and bitwise operations for message (de)serialization. Take advantage of enums and bitfield structs to describe the data you are sending and receiving. This is especially relevant for I2C and SPI devices which usually operate under a register model.

This approach requires a lot more types and work up front, but in the long run makes your driver much more readable and easier to work with.

.. code-block:: cpp
    :linenos:

    class TempSensor123 : public ITempSensor {
        // ...
      private:

        /// Defines addresses of registers available 
        enum Register {
            CONFIG_A = 0,
            CONFIG_B = 1,
            TEMP_A = 2,
            TEMP_B = 4,
        };

        // Layout of the CONFIG registers
        struct RegConfig {
            uint8_t sampleRate : 4;
            uint8_t oversample : 2;
            uint8_t enable : 1;
            uint8_t _reserved : 1;
        };

        // ...
    };
