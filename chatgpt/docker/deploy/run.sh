#!/bin/sh
# wait for mysql to start
Path="/app/data/logs"

if [ ! -d ${Path} ]; then
  mkdir ${Path}
fi
python manage.py compilemessages
python manage.py migrate
supervisord -n -c docker/supervisord.conf
