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

html_static_path = ["_static"]
templates_path = ["_templates"]

blog_baseurl = "https://lenord.me/"
# A path relative to the configuration directory for posts archive pages.
blog_path = "posts"
# The "title" for the posts, used in active pages.  Default is ``'Blog'``.
blog_title = "lenordsNet"

fontawesome_included = True

html_baseurl = blog_baseurl
html_title = blog_title

html_theme = "sphinx_book_theme"
html_theme_options = {
    "repository_url": "https://github.com/len0rd/",
    "search_bar_text": "search ...",
    "show_prev_next": False,
    "navbar_center": [],
    "use_fullscreen_button": False,
    "use_repository_button": True,
    # "footer_items": ["copyright", "sphinx-version", x"last-updated"],
}
html_favicon = "assets/img/favicon.ico"

html_sidebars = {
    "*": [
        "sitename.html",
        "search-field.html",
        "recentposts.html",
        "archives.html",
    ],
    "posts/**": [
        "sitename.html",
        "search-field.html",
        "postcard.html",
        "recentposts.html",
        "archives.html",
    ],
}

html_context = {"html_title": html_title}

pygments_style = "sas"
