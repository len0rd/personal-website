#!/bin/bash

ablog build
python -m http.server -d _website/ 8090
