# Start from a base image that has Python pre-installed
FROM mcr.microsoft.com/devcontainers/python:3.11-bullseye

# Install Node.js
RUN sudo apt-get update && \
    sudo apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
    sudo apt-get install -y nodejs

# Set the working directory
WORKDIR /workspaces/unified-app

# Copy project files
COPY .. /workspaces/unified-app

# Set ownership to the vscode user
RUN chown -R vscode:vscode /workspaces/unified-app

# Switch to the non-root user
USER vscode
