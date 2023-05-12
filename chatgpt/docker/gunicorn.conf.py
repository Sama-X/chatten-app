"""
gunicorn config file.
"""
# flake8: noqa
# pylint: skip-file
workers = 1
worker_class = 'uvicorn.workers.UvicornWorker'
timeout = 300  # timeout 6m
