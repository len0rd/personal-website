FROM python:3.11-bullseye AS dev

ADD pip-requirements.txt /tmp/pip-requirements.txt
RUN pip install -r /tmp/pip-requirements.txt \
    && rm /tmp/pip-requirements.txt

FROM dev as prod

# Bundle app source
COPY . /website
WORKDIR /website
EXPOSE 8090
ENTRYPOINT [ "/bin/bash", "/website/container_serve.sh" ]
