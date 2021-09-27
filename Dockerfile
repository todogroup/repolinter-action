FROM ghcr.io/todogroup/repolinter:v0.11.2

# copy repolinter-action
WORKDIR /repolinter-action
COPY dist dist

# Working directory will automagically be set to github workspace when the container is executed
ENTRYPOINT ["bundle", "exec", "node /repolinter-action/dist/index.js"]
