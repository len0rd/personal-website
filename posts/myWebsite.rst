.. myWebsite:

My Website [Old]
================

.. post:: 31, July 2018
    :tags: coding, diy, old
    :category: Projects
    :author: len0rd

.. note::

   This page describes how I initially implemented this website back in 2018. I've since moved to a much
   simpler solution using `Sphinx Docs <https://www.sphinx-doc.org/en/master/>`_ and `ablog <https://ablog.readthedocs.io/en/stable/>`_

Starting out with this website, I had essentially no knowledge of modern web technologies. I knew that I wanted something modern but also easy to maintain that I could use well into the future.

The end result is the site you see here. By no means perfect or beautiful, but functional and a place where I can store guides mainly for my benefit. But maybe for your benefit too? I certainly dont know who's reading this ¯\\\_(ツ)_/¯

As I'm writing this page after the fact (about a year since originally making this site), I'll likely glaze over a lot of the details.

Technologies Used
-----------------

- `Node <https://nodejs.org/>`_ for quick 'n easy webserver creation

- `NPM <https://www.npmjs.com>`_ for a bunch of support packages

- `ExpressJS <https://expressjs.com>`_ with `ejs <https://ejs.co/>`_ for amped up static pages. Express is great for beginners that want a simple framework for a static website with no code duplication

- `Bootstrap <https://getbootstrap.com>`_ to make it all pretty

- Other stuff

Express
-------

Originally I started this site as a pure html/bootstrap affair. This worked for all of 2 days until I got sick of copying and pasting code all over the place. While I had no desire to maintain duplicate copies of code, I was even less interested in using some massive overkill framework (as an embedded dev, I have a need for speed). Low and behold: ExpressJS! The perfect minimal framework solution for my problem. Express has a concept of 'pages' and 'partials'. A page defines the overall structure of a static webpage (say my home page). Partials define chunks/components of that page that are shared in other locations. So for example, all the html for my navigation/ header bar has its own partial, as does the footer. Then in a page, to use this content you can simply add a ``<% include`` as if you were writing a C program! Express was speaking my language.

Static Project Pages
--------------------

The bulk of the effort for me was sunk into generating the project writeup pages (like the page you're reading this off of right now!). I wanted them to be simple static text, images and video. But I didn't want the complexity of using a whole framework like wordpress, and I definitely wasn't into the idea of writting everything in html. I wanted my writeups to be in a portable format I could easily migrate or use in other places in the future.

Given these requirements I thought it best to write about all of my projects in markdown. I've used markdown for years and like its readability and easy syntax. To convert my markdown to HTML, I grabbed `showdown <https://github.com/showdownjs/showdown>`_ . Showdown does it's job well and has some hooks (called 'extensions') that made it easier for me to get the formatting jusssst right. At present the only extension I've created helps make the title/H1 of each writeup nice and big (ie: look at those big 'My Website' letters up top). All the showdown generator stuff lives in ``prestart.js`` which is run before the server is started so the markdown is generated once and can then be served statically for all time.

I saved showdown's resulting files as ExpressJS partials. These partials are linked to a template page which adds the header, footer and table of contents you see here. Then, any requests that contain ``/projects`` actually load the ``project_template`` page with the requested project-name partial. Express makes this all surprisingly simple (I say after struggling with it for hours):

.. code-block:: javascript

    if (pathname.includes('projects') && page !== 'index') {
        // projects has a custom template that is used for all projects
        // so we need to change the pathname that the renderer is using
        // that template:
        pathname = pathname.substr(0, pathname.lastIndexOf(page));
        pathname += 'project_template'
        // provide the pagename for project_template to use for main content
        page = 'partials/md/' + page;
    }
