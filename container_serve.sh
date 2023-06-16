#!/bin/bash

ablog build
python -m http.server -d /website/_website/ 8090
