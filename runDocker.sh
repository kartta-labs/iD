#!/bin/bash

docker build -t id_dev .
docker run --rm -p 8000:8080 -it id_dev
