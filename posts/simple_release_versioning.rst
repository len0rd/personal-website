.. simple_release_versioning:

Release Versioning In C/C++ Projects
====================================

.. post:: 10, June 2025
    :tags: diy, docker, embedded, development, advice
    :category: Projects
    :author: len0rd


- this is geared towards projects that use languages that dont have a standardized approach to versioning (c,cpp)
- simple version.json in repo root that is used as a the single source of truth
- generate version.cpp via cmakes tools
