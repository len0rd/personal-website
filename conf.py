# Sphinx docs configuration for building project documentation
from datetime import datetime

project = "lenordsNet"
author = "lenord"
copyright = f"{datetime.now().year}, lenordsNet"

extensions = [
    "sphinxcontrib.youtube",
    "ablog",
    "sphinx.ext.intersphinx",
    "sphinx_design",
]

templates_path = ["_templates"]

blog_baseurl = "https://lenord.me/"
# A path relative to the configuration directory for posts archive pages.
blog_path = "posts"
# The "title" for the posts, used in active pages.  Default is ``'Blog'``.
blog_title = "lenordsNet"

fontawesome_included = True

html_baseurl = blog_baseurl
html_title = blog_title

html_theme = "pydata_sphinx_theme"
html_theme_options = {
    "search_bar_text": "search ...",
    "show_prev_next": False,
    "navbar_center": [],
}
html_favicon = "assets/img/favicon.ico"

html_sidebars = {
    "*": [
        "ablog/recentposts.html",
        "ablog/archives.html",
    ],
    "posts/**": [
        "ablog/postcard.html",
        "ablog/recentposts.html",
        "ablog/archives.html",
    ],
}

html_context = {"html_title": html_title}

pygments_style = "sas"

drawio_headless = True
drawio_no_sandbox = True
