FROM python:3.10-slim
RUN pip install --upgrade pip -i http://mirrors.aliyun.com/pypi/simple/ --trusted mirrors.aliyun.com
RUN pip install ipython -i http://mirrors.aliyun.com/pypi/simple/ --trusted mirrors.aliyun.com

RUN echo > /etc/apt/sources.list
RUN echo 'deb http://mirrors.aliyun.com/debian/ stretch main non-free contrib' >> /etc/apt/sources.list
RUN echo 'deb-src http://mirrors.aliyun.com/debian/ stretch main non-free contrib' >> /etc/apt/sources.list
RUN echo 'deb http://mirrors.aliyun.com/debian-security stretch/updates main' >> /etc/apt/sources.list
RUN echo 'deb-src http://mirrors.aliyun.com/debian-security stretch/updates main' >> /etc/apt/sources.list
RUN echo 'deb http://mirrors.aliyun.com/debian/ stretch-updates main non-free contrib' >> /etc/apt/sources.list
RUN echo 'deb-src http://mirrors.aliyun.com/debian/ stretch-updates main non-free contrib' >> /etc/apt/sources.list
RUN echo 'deb http://mirrors.aliyun.com/debian/ stretch-backports main non-free contrib' >> /etc/apt/sources.list
RUN echo 'deb-src http://mirrors.aliyun.com/debian/ stretch-backports main non-free contrib' >> /etc/apt/sources.list

RUN apt update && apt install -y libtinfo5 --allow-remove-essential
RUN apt-get install -y gettext

LABEL tag="chatgpt"
LABEL version="0.0.1"
ENV PYTHONUNBUFFERED 1

RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone 

ENV LANG C.UTF-8

ARG work=/app/data
COPY . ${work}
WORKDIR ${work}
RUN /usr/local/bin/pip3 install -i http://mirrors.aliyun.com/pypi/simple/ --trusted mirrors.aliyun.com -r requirements.txt
RUN chmod +x ${work}/docker/deploy/*

EXPOSE 8000
