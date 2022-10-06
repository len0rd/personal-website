# Sphinx docs configuration for building project documentation
from datetime import datetime
import os

project = "Lenords Projects"
author = "lenord"
copyright = f"{datetime.now().year}, lenordsNet"

extensions = [
    "sphinxcontrib.youtube",
]

root_doc = "contents"

html_theme = "sphinx_rtd_theme"
html_additional_pages = {
    "index": os.path.abspath(os.path.join("..", "views", "pages", "index.ejs"))
}
# html_static_path = ["_static"]

pygments_style = "sas"
