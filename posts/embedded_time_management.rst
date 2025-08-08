.. embedded_time_management:

Embedded Time Management
========================

.. post:: 8, August 2025
    :tags: embedded, development, advice
    :category: Dev
    :author: len0rd

As an embedded project matures, having methods to track timing and durations become necessary. In this post I'll describe how I typically implement time in an embedded project so its cross platform while also not slowing down unit tests.

Implementing monotonic time
---------------------------

Having a monotonic clock in your application is useful for a variety of situations:

- **Duration tracking**: How long has it been since an event occurred or how long did an event take?
- **Simple reset detection**: If monotonic time reported by a subsystem suddenly resets or goes backwards, the subsystem crashed and reset
- **Managing task periods**: Especially on bare-metal, if something needs to occur every X milliseconds, a monotonic clock enables this (there are only so many hardware timers/interrupts).
- **Tracking event timings**: With logging, you want a way to place events in the order the system saw them, espcially if its possible that those events are reported to you in a different order (due to interrupts, context switches, etc).

Implementation requirements

- **Global access** Timestamps should be easily accessible from anywhere on the system as soon as possible after startup
- **Abstract interface** Clock getting functions should not be tied to any particular platform. An application should be able to choose its desired clock implementation (justification for this later)

Time interface
^^^^^^^^^^^^^^

.. code-block:: cpp

    /// @brief Get the applications monotonic uptime in milliseconds
    ///
    /// "Uptime" is how long the application has been running
    TimeMs uptime_ms();

    /// @brief Get the applications monotonic uptime in microseconds
    TimeUs uptime_us();

    /// @brief Timer driver interface, a TimerDriver is used internally by the global @ref uptime_ms,
    /// etc functions. Its done this way so users have the option to choose a specific timer
    /// implementation early on if desired. Methods here should work exactly
    /// the same as their global counterparts
    class ITimeDriver {
    public:
        virtual TimeMs uptime_ms() = 0;
        virtual TimeUs uptime_us() = 0;
    };

    /// @brief Set the time driver this application should use
    void setTimeDriver(ITimeDriver& timeDriver);

    /// @brief Pointer to the global time driver. Must be defined and set to a default value by each
    /// hardware platform
    extern ITimeDriver* g_timeDriver;


Uptime on ARM MCUs (Cortex-M chips)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Interfaces are great and all, but how would you implement ``ITimeDriver`` on that ARM Cortex chip in your project? See: SysTick.

SysTick is a feature/peripheral that is part of the core register set on all ARM Cortex-M MCUs (and maybe more?). SysTick is a configurable prescaled timer which has an interrupt tied to it. Given its general availability, its a great option for implementing timing information. You will find projects like FreeRTOS utilize SysTick to run its scheduler.

To keep it brief, SysTick has 3 registers we care about: 

- ``SYST_CSR``: Control and Status Register. Use to enable/disable the counter and interrupt.
- ``SYST_RVR``: Reload Value Register. Also called "Load" register. This is the value the counter will start at, count down from, and roll-under to once it reaches 0
- ``SYST_CVR``: Current Value Register. The current count.

Timing-wise SysTick will usually be tied to the core clock, so you can use that rate to calculate the RVR value for your required timing accuracy. SysTick should have its own ISR which is triggered at the end of every count. Keep it at a high priority and use it to add to your own counter to keep track of overall ticks.

To bring this all together, here's a simple ``ITimeDriver`` implementation for an application running bare metal on a Microchip ATSAMD20

.. code-block:: cpp

    // have Systick rollunder and generate an interrupt at 1000Hz. Makes it easy to count milliseconds
    const uint32_t TIME_TICK_RATE_HZ = 1000;

    void TimeDriverMcSamd20::setup() {
        SysTick->CTRL = 0;
        SysTick->VAL = 0;
        // load is the value the counter counts from before rolling under and generating a tick. Counts at
        // the core clock rate.
        // You either need to solve for your CLK_PLL_VAL_HZ or have it hard-coded
        SysTick->LOAD = (CLK_PLL_VAL_HZ / TIME_TICK_RATE_HZ) - 1;
        // - enable TICK interrupt
        // - use processor clock for clock source
        // - Enable the SysTick counter
        SysTick->CTRL = SysTick_CTRL_TICKINT_Msk | SysTick_CTRL_CLKSOURCE_Msk | SysTick_CTRL_ENABLE_Msk;
    }
    

    static uint32_t s_tickCount = 0;
    extern "C" {
    /// SysTick ISR
    void SysTick_Handler(void) {
        // Reading control register clears the count flag
        (void)SysTick->CTRL;
        s_tickCount++;
    }
    }

    TimeMs TimeDriverMcSamd20::uptime_ms() {
        return s_tickCount;
    }

What about microsecond resolution? Well we can use the current value of the counter along with our knowledge of how often its rolling under:

.. code-block:: cpp

    TimeUs TimeDriverMcSamd20::uptime_us() 
        // Calculating best estimate of current microseconds:
        //
        // now_us = (now_ms * 1000) + SysTickCounts * tickCountsPerMicro
        // = (base_us) + (SysTick.LOAD - SysTick.Count) * (microseconds_per_SysTick /
        //                                 counts_per_SysTick)
        // = (base_us) + (SysTick.LOAD - SysTick.Count) * (1E6 / TIME_TICK_RATE_HZ) / SysTick.LOAD

        TimeUs base_us = this->uptime_ms() * 1000;

        // per the TRM current/reload values are 24bit
        uint32_t tickCounterValue = (SYSTICK_CURRENT_VALUE_REG) & 0x00ffffff;
        uint32_t tickCounterReload = (SYSTICK_LOAD_REG) & 0x00ffffff;
        TimeUs sub_us = ((tickCounterReload - tickCounterValue) * (1000000 / TIME_TICK_RATE_HZ)) / tickCounterReload;
        return base_us + sub_us;
    }



Timing requirements in unit tests
---------------------------------

By abstracting the hardware time driver with ``ITimeDriver``, any implementation can be substituted in. My favorite use-case of this is creating an implementation that fakes time elapsing with a variable. For instance:

.. code-block:: cpp

    class TimeDriverFake : public ITimeDriver {
    public:
        TimeMs uptime_ms() override { return m_currentUs / 1000; }
        TimeUs uptime_us() override { return m_currentUs; }

        void elapse_ms(TimeMs msToElapse) { m_currentUs += (msToElapse * 1000); }
        void elapse_us(TimeUs usToElapse) { m_currentUs += usToElapse; }
        void setUptime(TimeUs uptimeUs) { m_currentUs = uptimeUs; }

    private:
        TimeUs m_currentUs = 0;
    };


This simple abstraction + fake provides a lot of benefits:

- Decrease test execution time. No more literal delays/sleeps in your tests
- You have full control of time. If you need literal sleeps, you dont have to use TimeDriverFake in that test.
- Tests of modules that have timing requirements will be more repeatable across environments/systems

On repeatability
^^^^^^^^^^^^^^^^

Unit test repeatability is one of large motivators for why this time management system was implemented in my first job. I worked on a large embedded project that was thoroughly unit tested, to the order of a couple thousand unit tests.

Occassionally we would have random failures in CI when running the test suite. We discovered that these failures always occurred in tests that had some type of timing requirement. We tried loosening timing requirements in these tests, but the random errors persisted. This was puzzling since the test suite and individual tests ran locally without issue.

The issue was rooted in our CI machine being configured to run multiple jobs simultaneously. For instance, if one job's test suite was run while another job was building, the CPU would be pegged and our tight millisecond timing requirements in tests could fail. The solution? Take real hardware timing out of the picture so that we could verify the actual behavior under test. This not only made our test suite pass more reliably, but it also sped up running the entire suite significantly.

Since this lesson, my environment has contained a couple helpful bash functions that allow me to place a system under heavy load and run a process until it fails.

.. code-block:: bash

    # max out all cpu cores with arbitrary task. Good for tests that need to be performed under heavy load
    function burncpu() {
        numProc="$(getconf _NPROCESSORS_ONLN)"
        openssl speed -multi ${numProc}
    }

    # run whatever is passed in until it returns a non-zero exit code
    function untilfail() {
        while "$@"; do :; done
    }

Duration and period handling
----------------------------

Once a system has monotonic uptime, its easy to add duration calculation and period checking. Having a software timer is useful for the many aspects of embedded development that have looser timing requirements. Of course anything thats especially hard-realtime should try and use a hardware timer. Using the above time functions, you can quickly create a helper class that provides elapsed time and rough periodic interval checking:

.. code-block:: cpp

    /// @brief SwStopwatch base class. Typically you should use the already-extended
    /// @ref SwStopwatchMs or @ref SwStopwatchUs
    template <typename T>
    class SwStopwatch {
    public:
        /// @brief Start this stopwatch
        void start() { m_startTick = now(); }

        /// @brief Get how much time has elapsed since the stopwatch was last
        /// started via @ref start
        /// @return The amount of time since the stopwatch was started
        T elapsedTime() const {
            T currentTs = now();
            if (currentTs < m_startTick) {
                // rollover case:
                // + 1 since the rollover from MAX -> 0 is a tick
                return (std::numeric_limits<T>::max() - m_startTick) + currentTs + 1;
            }
            else {
                return currentTs - m_startTick;
            }
        }

        /// @brief Returns true if at least \p stopwatchPeriod time has elapsed
        /// since the last time this stopwatch was started. If the period has
        /// elapsed, this stopwatch is started again Example usage:
        /// @verbatim
        /// if (myMsStopwatch.isPeriodElapsed(500)) {
        ///     // 500ms or more has elapsed, run my periodic task
        /// }
        /// @endverbatim
        /// @param stopwatchPeriod Period to check
        /// @return true if \p stopwatchPeriod has elapsed, otherwise false.
        bool isPeriodElapsed(T stopwatchPeriod) {
            if (elapsedTime() > stopwatchPeriod) {
                start();
                return true;
            }
            return false;
        }

    protected:
        T m_startTick;

        virtual T now() const = 0;
    };

    /// @brief Millisecond software stopwatch. Keeps track of milliseconds elapsed
    /// since it was started
    class SwStopwatchMs : public SwStopwatch<TimeMs> {
    protected:
        inline TimeMs now() const override { return uptime_ms(); }
    };

    /// @brief Microsecond software stopwatch. Keeps track of microseconds elapsed
    /// since it was started. Accuracy/resolution varies by platform
    class SwStopwatchUs : public SwStopwatch<TimeUs> {
    protected:
        inline TimeUs now() const override { return uptime_us(); }
    };


From here, implementing a module that enables running callbacks periodically is trivial. However at this point its good to keep your target platforms in mind. If you are running on an RTOS or OS, a better mechanism for periodic tasks likely already exists. For instance FreeRTOS has [TimerSVC](https://www.freertos.org/Documentation/02-Kernel/02-Kernel-features/05-Software-timers/02-Timer-service-daemon-task). So this is a spot where its good to think about more OS abstractions like what was done with ``ITimeDriver`` above.
