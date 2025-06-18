.. embedded_logging:

Embedded Logging
================

.. post:: 10, June 2025
    :tags: diy, docker, embedded, development, advice
    :category: Projects
    :author: len0rd

I often encounter situations in embedded development where I need to roll my own solution for logging on an MCU. The standard quick-fix to this challenge is for your application to tie a UART to printf and listen there during runtime. While this is a good start, getting embedded code to a production state will often require more.

In my first fulltime job out of college, the senior engineers who mentored me came up with a simple but flexible solution for logging on an embedded platform which I still use to this day. Here's a quick summary of how it works and how you can implement it.

Support multiple output streams
-------------------------------

