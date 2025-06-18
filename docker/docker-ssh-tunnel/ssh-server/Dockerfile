FROM ubuntu:22.04

ARG SSH_PUBLIC_KEY
ENV DEBIAN_FRONTEND=noninteractive
ENV NVM_DIR=/home/devuser/.nvm
ENV NODE_VERSION=20.11.1
ENV BUN_INSTALL=/home/devuser/.bun
ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$BUN_INSTALL/bin:$PATH"

# Install OS dependencies
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    curl wget git build-essential \
    ca-certificates openssh-server sudo nano unzip \
    && mkdir -p /var/run/sshd \
    && useradd -m -s /bin/bash devuser \
    && echo "devuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Switch to devuser for installations
USER devuser
WORKDIR /home/devuser

# Install NVM + Node.js + PM2
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION && nvm use $NODE_VERSION && \
    npm install -g pm2

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Switch back to root for SSH setup
USER root

# Setup SSH for devuser
RUN mkdir -p /home/devuser/.ssh && chmod 700 /home/devuser/.ssh && \
    echo "${SSH_PUBLIC_KEY}" > /home/devuser/.ssh/authorized_keys && \
    chown -R devuser:devuser /home/devuser/.ssh && \
    chmod 600 /home/devuser/.ssh/authorized_keys && \
    echo "export NVM_DIR=/home/devuser/.nvm" >> /home/devuser/.bashrc && \
    echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"" >> /home/devuser/.bashrc && \
    echo "export PATH=\$NVM_DIR/versions/node/v$NODE_VERSION/bin:/home/devuser/.bun/bin:\$PATH" >> /home/devuser/.bashrc

# Configure SSH
RUN echo "PermitRootLogin no" >> /etc/ssh/sshd_config && \
    echo "AuthorizedKeysFile .ssh/authorized_keys" >> /etc/ssh/sshd_config && \
    echo "PasswordAuthentication no" >> /etc/ssh/sshd_config

# Copy SSH host keys from volume if available
RUN mkdir -p /etc/ssh/keys && \
    [ -f /etc/ssh/keys/ssh_host_rsa_key ] && cp /etc/ssh/keys/ssh_host_* /etc/ssh/ || ssh-keygen -A

# Working directory
WORKDIR /apps
RUN chown -R devuser:devuser /apps && chmod -R 775 /apps

# Healthcheck for SSH
HEALTHCHECK --interval=30s --timeout=3s CMD pgrep sshd || exit 1

# Expose SSH
EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
