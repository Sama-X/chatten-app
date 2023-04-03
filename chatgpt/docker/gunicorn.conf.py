# flake8: noqa
# pylint: skip-file
workers=1

backlog=2048

worker_class="gevent"

debug=False

syslog = True
enable_stdio_inheritance = True
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" "%({x-forwarded-for}i)s"'

logconfig_dict = {
    'version':1,
    'disable_existing_loggers': False,
    'loggers': {
        "root": {
            "level": "INFO", "handlers": ["console"]
        },
        "gunicorn.access": {
            "level": "INFO",
            "handlers": ["access_file"],
            "propagate": 0,
            "qualname": "gunicorn.access"
        }
    },
    'handlers':{
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "generic",
            "stream": "sys.stdout"
        },
        "access_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 20,
            "backupCount": 10,
            "formatter": "generic",
            "filename": "/app/data/logs/gunicorn.access.log",
        }
    },
    'formatters':{
        "generic": {
            "format": '%(levelname)s %(asctime)s %(module)s %(message)s',
            "datefmt": "[%Y-%m-%d %H:%M:%S %z]",
            "class": "logging.Formatter"
        }
    }
}