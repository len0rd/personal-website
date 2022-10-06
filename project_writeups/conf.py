# Sphinx docs configuration for building project documentation
from datetime import datetime
import sphinx_bootstrap_theme
import os

project = "lenordsNet Projects"
author = "lenord"
copyright = f"{datetime.now().year}, lenordsNet"

extensions = [
    "sphinxcontrib.youtube",
]

root_doc = "contents"

html_theme = "bootstrap"
html_theme_path = sphinx_bootstrap_theme.get_html_theme_path()
html_baseurl = "/"
html_use_index = False
html_theme_options = {
    "navbar_title": "lenordsNet",
    "navbar_sidebarrel": False,
    "navbar_class": "navbar navbar-inverse navbar-dark",
    "source_link_position": "footer",
    "bootswatch_theme": "cyborg",
}

pygments_style = "sas"
