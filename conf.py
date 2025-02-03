# Sphinx docs configuration for building project documentation
from datetime import datetime
from pygments.lexer import RegexLexer, bygroups
from pygments import token
from sphinx.highlighting import lexers

project = "lenordsNet"
author = "lenord"
copyright = f"{datetime.now().year}, lenordsNet"

extensions = [
    "sphinxcontrib.youtube",
    "ablog",
    "sphinx.ext.intersphinx",
    "sphinx_design",
    "sphinxcontrib.bitfield",
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

html_extra_path = [
    "assets/img/me.png",
]

html_static_path = [
    "_static",
]

html_css_files = [
    "customizations.css",
]

html_sidebars = {
    "*": [
        "ablog/recentposts.html",
        "ablog/archives.html",
        "aboutme.html",
    ],
    "posts/**": [
        "ablog/postcard.html",
        "ablog/recentposts.html",
        "ablog/archives.html",
    ],
}

html_context = {"html_title": html_title}

pygments_style = "sas"


class CanbusDbcLexer(RegexLexer):
    name = "DBC"

    tokens = {
        "root": [
            (r"[:\|\[\],\(\)]", token.Punctuation),
            (r"[\@\-\+]", token.Operator),
            ("CM_", token.Keyword, "comment"),
            ("SG_", token.Keyword, "signal"),
            ("BO_", token.Keyword, "msg"),
            ("BA_DEF_DEF_", token.Keyword, "attrdefault"),
            ("BA_DEF_", token.Keyword, "attrdef"),
            ("BA_", token.Keyword, "sigdefault"),
        ],
        "msg": [
            (
                r"(\s+)(\d+)(\s+)([\w_]+)(\s*?)(:)(\s+)(\d+)(\s+)(\w+)",
                bygroups(
                    token.Whitespace,
                    token.Number,
                    token.Whitespace,
                    token.Name,
                    token.Whitespace,
                    token.Punctuation,
                    token.Whitespace,
                    token.Number,
                    token.Whitespace,
                    token.Name,
                ),
            ),
        ],
        "signal": [
            (
                r'(\s+)([\w_]+)(\s+)(:)(\s+)(\d+)(\|)(\d+)(@)(\d+)([+-])(\s+)(\()([-\d\.]+)(,)([-\d\.]+)(\))(\s+)(\[)([\d-]+)(\|)([\d-]+)(\])(\s+)(".*?")(.*?\n)',
                bygroups(
                    token.Whitespace,
                    token.Name,
                    token.Whitespace,
                    token.Punctuation,
                    token.Whitespace,
                    token.Number,
                    token.Punctuation,
                    token.Number,
                    token.Punctuation,
                    token.Number,
                    token.Punctuation,
                    token.Whitespace,
                    token.Punctuation,
                    token.Number,
                    token.Punctuation,
                    token.Number,
                    token.Punctuation,
                    token.Whitespace,
                    token.Punctuation,
                    token.Number,
                    token.Punctuation,
                    token.Number,
                    token.Punctuation,
                    token.Whitespace,
                    token.String,
                    token.Name,
                ),
            ),
        ],
        "comment": [
            (
                r'(\s+)(BO_)(\s+)(\d+)(\s+)(".*?")(;)',
                bygroups(
                    token.Whitespace,
                    token.Keyword,
                    token.Whitespace,
                    token.Number,
                    token.Whitespace,
                    token.String,
                    token.Punctuation,
                ),
            ),
            (
                r'(\s+)(SG_)(\s+)(\d+)(\s+)(\w+)(\s+)(".*?")(;)',
                bygroups(
                    token.Whitespace,
                    token.Keyword,
                    token.Whitespace,
                    token.Number,
                    token.Whitespace,
                    token.Name,
                    token.Whitespace,
                    token.String,
                    token.Punctuation,
                ),
            ),
        ],
        "attrdef": [
            (
                r'(\s+)([\w_]+)(\s+)(".*?")(\s+)(\w+)(\s+)(.*?)(;)',
                bygroups(
                    token.Whitespace,
                    token.Keyword,
                    token.Whitespace,
                    token.String,
                    token.Whitespace,
                    token.Keyword,
                    token.Whitespace,
                    token.Name,
                    token.Punctuation,
                ),
            )
        ],
        "attrdefault": [
            (
                r'(\s+)(".*?")(\s+)(.*?)(;)',
                bygroups(
                    token.Whitespace,
                    token.String,
                    token.Whitespace,
                    token.Name,
                    token.Punctuation,
                ),
            )
        ],
        "sigdefault": [
            (
                r'(\s+)(".*?")(\s+)(SG_)(\s+)(\d+)(\s+)(\S+)(\s+)([0-9\-\.]+)(;)',
                bygroups(
                    token.Whitespace,
                    token.String,
                    token.Whitespace,
                    token.Keyword,
                    token.Whitespace,
                    token.Number,
                    token.Whitespace,
                    token.Name,
                    token.Whitespace,
                    token.Number,
                    token.Punctuation,
                ),
            )
        ],
    }


lexers["dbc"] = CanbusDbcLexer(startinline=True)
