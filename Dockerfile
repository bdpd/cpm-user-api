FROM node:6.11.1

# copy & unpack dist to /api, set workdir
ADD ./ /api
WORKDIR /api

# install npm v3
RUN     npm install forever -g

# create a custom user for running the api
RUN     groupadd -r local-group --gid=9999 && useradd -r -g local-group --uid=9999 local-user -d /api
RUN     chown -R local-user /api/

# a little security hardening step
# remove setuids and setuid/setgid
RUN     find / -perm +6000 -type f -exec chmod a-s {} \; || true

# switch user to local-user everything from now on is run as this user
USER    local-user
RUN     npm install

# expose api port
EXPOSE  3000

# start the server
CMD     ["forever", "--pidFile", "/tmp/consumer.pid", "--minUptime", "1000ms", "--spinSleepTime", "1000ms", "-f", "app.js"]
