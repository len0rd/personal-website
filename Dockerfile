FROM python:3.11-bullseye AS dev

ADD pip-requirements.txt /tmp/pip-requirements.txt
RUN pip install -r /tmp/pip-requirements.txt \
    && rm /tmp/pip-requirements.txt

# install drawio for doc diagram gen
ENV DRAWIO_VERSION "21.1.2"
RUN apt update \
    && apt install -yq --no-install-recommends \
        xvfb \
        wget \
        libnotify4 \
        libgbm1 \
        libasound2 \
        libxss1 \
        libsecret-1-0 \
    && wget https://github.com/jgraph/drawio-desktop/releases/download/v${DRAWIO_VERSION}/drawio-amd64-${DRAWIO_VERSION}.deb \
    && apt install -y ./drawio-amd64-${DRAWIO_VERSION}.deb \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf drawio-amd64-${DRAWIO_VERSION}.deb
ENV XVFB_DISPLAY ":42"

FROM dev as prod

# Bundle app source
COPY . .
RUN ablog build

EXPOSE 8090
CMD [ "ablog", "serve", "-p", "8090" ]
