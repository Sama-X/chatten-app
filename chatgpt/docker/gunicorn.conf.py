"""
gunicorn config file.
"""
# flake8: noqa
# pylint: skip-file
workers = 1
worker_class = 'uvicorn.workers.UvicornWorker'
bind = '0.0.0.0:8000'
timeout = 300  # timeout 6m
