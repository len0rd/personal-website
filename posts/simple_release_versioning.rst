.. simple_release_versioning:

Release Versioning In C/C++ Projects
====================================

.. post:: 10, June 2025
    :tags: diy, docker, embedded, development, advice
    :category: Dev
    :author: len0rd

How do you define semver in a large C/C++ project? For CMake-based projects the simplest solution is to rely on the version info passed to the CMake ``project`` directive. But what do you do when you have multiple languages/tools in a monorepo that need access to the project semver? In this situation, I've developed a somewhat simple solution for a single, easily accessible source of truth on project semver information.

version.json
------------

These days, all tooling can easily interact with JSON. I use this fact and define a simple ``version.json`` in the root of a project:

.. code-block:: json

    {
        "major": 1,
        "minor": 0,
        "patch": 1
    }

That's it! This file can then be used by anything interested in the current version info: CMake, Python, Jenkins, etc. The rest of this post just explains all the utility methods I have for accessing and using this information.

Also, while semver is fine, it may not be enough to pin the exact version of code running in an environment. Especially during develpment or if your release process is not rigorous. For this reason I always make Git SHA information accessible in my release binaries.

CMake Versioning
----------------

Using ``version.json`` in CMake can be done with a simple macro:

.. code-block:: cmake 

    # Using the given filepath, load a version.json file into VERSION_MAJOR, VERSION_MINOR, and VERSION_PATCH cache variables
    # As a macro this will be executed in the context of the CMakeLists that calls it.
    macro(load_version_json version_filepath)
        if(EXISTS ${version_filepath})
            file(READ ${version_filepath} version_contents)
            # Note: variables are set to "keyname-NOTFOUND" if they are not present in the JSON string.
            # An error is emitted when the key is not found. This error is again emitted by the `project`
            # directive if you attempt to use a string like "<key>-NOTFOUND" as a version number. This
            # error will halt the build
            string(JSON VERSION_MAJOR GET ${version_contents} "major")
            string(JSON VERSION_MINOR GET ${version_contents} "minor")
            string(JSON VERSION_PATCH GET ${version_contents} "patch")
            set(SEMVER_STRING "${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}" CACHE STRING "Semantic Version String for the project")
        else()
            message(FATAL_ERROR "Unable to load version info file at ${version_filepath}")
        endif()
    endmacro()

Then, just ensure this macro is called before your project declaration in the root CMakeLists.txt:

.. code-block:: cmake

    load_version_json(${CMAKE_CURRENT_LIST_DIR}/version.json)
    project(my_project
        VERSION ${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}
        LANGUAGES C CXX
    )

Earlier, I also mentioned using the Git SHA in version information. You cant included it in a CMake ``project`` directive, but I include it in a ``Version.cpp`` file generated during configure time. To make it accessible in CMake, I've defined a helper function:

.. code-block:: cmake

    # Get the SHA of the current project directory
    # @oaram result: Place the result of the function into a variable with this name
    # @param SHA_LEN: Desired length of the SHA. LEN=[0,39] will return the first
    #   LEN characters of the SHA. Values <0 or >=40 will return the full SHA
    # @param INCLUDE_DIRTY_FLAG: if set to 1, a 'dirty' flag will be included
    # 	at the end of the string if the project working directory is dirty.
    #	if any other value, no flag will be included
    function(git_sha result SHA_LEN INCLUDE_DIRTY_FLAG)
        # get the sha. this returns the full 40 character SHA without any working directory marker (no dirty flag)
        execute_process(
            COMMAND ${GIT_EXECUTABLE} rev-parse HEAD
            # note: PROJECT variables are based on the last project call
            WORKING_DIRECTORY ${ARA_COMMON_ROOT_DIR}
            OUTPUT_VARIABLE raw_sha
        )
        # first substring the sha to its max length. This ensures no newline characters are included in the final output
        string(SUBSTRING ${raw_sha} 0 40 OUT_STR)
        string(SUBSTRING ${OUT_STR} 0 ${SHA_LEN} OUT_STR)

        if(${INCLUDE_DIRTY_FLAG} EQUAL 1)
            # diff --quiet returns 1 when working directory is dirty and 0 when clean
            execute_process(
                COMMAND ${GIT_EXECUTABLE} diff --quiet
                WORKING_DIRECTORY ${ARA_COMMON_ROOT_DIR}
                RESULT_VARIABLE raw_is_dirty
            )
            if(${raw_is_dirty} EQUAL 1)
                string(APPEND OUT_STR "+")
            endif()
        endif()

        set(${result} ${OUT_STR} PARENT_SCOPE)
    endfunction()

For this function to work, ``find_package(Git)`` has to be successfully run before its called.

C++ Versioning
--------------

Using the CMake helper functions in the last section and CMake `configure_file <https://cmake.org/cmake/help/latest/command/configure_file.html>`_, we can generate a version file at CMake configure time with the Git SHA and our ``version.json`` semver

Here's the C++ header:

.. code-block:: cpp

    #ifndef __VERSION_H__
    #define __VERSION_H__

    struct VersionInfo {
        uint8_t major;
        uint8_t minor;
        uint8_t patch;
        /// First 4-bytes of the Git SHA of this build
        uint32_t sha;
        /// True if repository Working Directory had uncommitted 
        /// changes during the build, otherwise false
        bool dirtyWd;

        /// @brief Get the Semantic Versioning string of the firmware.
        /// @return SemVer string formatted "<MAJOR>.<MINOR>.<PATCH>"
        const char* semverStr();

        /// @brief Get the Semantic version string of the firmware with the
        /// VCS short commit sha appended to the end
        /// @return Version string formatted "<MAJOR>.<MINOR>.<PATCH>-<SHORT_SHA>"
        /// Example:
        ///     "1.2.9-deadbeef+"
        const char* semverWithShaStr();
    };

    const VersionInfo& getVersionInfo();

    /// @brief Get the Version Control System commit SHA of this build
    /// @return The full 40-character SHA with an optional flag ('+') indicating working directory state
    /// Examples:
    ///     "be667637a448f6e59641594f49c26c88a51b0631"
    ///     "bf6c6826e772440b2b9818afac9ddfa27daafe7b+" <- Here the '+' indicates a dirty repository
    ///         working directory during the build
    const char* longShaStr();

    #endif /* __VERSION_H__ */

By making the header static and only generating a source file, version changes will only trigger a rebuild/relink of the library that includes ``Version.cpp``. As opposed to generating a header which could cause rebuilds of anything that includes it. 

From here its pretty simple to bring all our different components together. First, the template file thats generated into ``Version.cpp``:

.. code-block:: cpp

    #include "Version.hpp"
    #define LONG_SHA_STR "@VCS_LONG_SHA_STR@"
    #define VERSION_MAJOR @VERSION_MAJOR@
    #define VERSION_MINOR @VERSION_MINOR@
    #define VERSION_PATCH @VERSION_PATCH@
    #define SHORT_SHA_VAL 0x@VCS_SHORT_SHA_VAL@
    // May include the the '+' character to indicate dirty WD
    #define SHORT_SHA_STR "@VCS_SHORT_SHA_STR@"
    #define IS_VCS_DIRTY @VCS_IS_DIRTY@


    #define _AS_STR(arg) #arg
    #define AS_STR(arg) _AS_STR(arg)

    static const VersionInfo INFO = {
        .major = VERSION_MAJOR,
        .minor = VERSION_MINOR,
        .patch = VERSION_PATCH,
        .sha   = SHORT_SHA_VAL,
        .dirtyWd = IS_VCS_DIRTY
    };

    const char* VersionInfo::semverStr() {
        return AS_STR(VERSION_MAJOR) "." AS_STR(VERSION_MINOR) "." AS_STR(VERSION_PATCH);
    }

    const char* VersionInfo::semverWithShaStr() {
        return AS_STR(VERSION_MAJOR) "." AS_STR(
            VERSION_MINOR) "." AS_STR(VERSION_PATCH) "-" SHORT_SHA_STR;
    }

    const VersionInfo& getVersionInfo() {
        return INFO;
    }

    const char* longShaStr() {
        return LONG_SHA_STR;
    }

And finally, the ``CMakeLists.txt`` to generate Version.cpp from the above template:

.. code-block:: cmake

    #########################
    # Version info generation
    # set up the variables for substitution
    git_sha(VCS_SHORT_SHA_VAL 8 0)
    git_sha(VCS_SHORT_SHA_STR 8 1)
    git_sha(VCS_LONG_SHA_STR  -1 1)

    string(FIND ${VCS_SHORT_SHA_STR} "+" VCS_IS_DIRTY)
    if (${VCS_IS_DIRTY} EQUAL -1)
        set(VCS_IS_DIRTY "false")
    else()
        set(VCS_IS_DIRTY "true")
    endif()

    configure_file(src/Version.cpp.in Version.cpp)
    message(STATUS "Generate version: ${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}-${VCS_SHORT_SHA_STR}")

    # version generation done
    #########################
