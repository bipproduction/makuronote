# Cloudflared SSH 

## SERVER

### Create Tunnel

masuk ke cloudfared > zero trust > network > tunnel > create tunnel

pada tunnel yang telah dibuat pada tab overview akan mendapatkan key : eyJhIjoiYzNhMjNkYTVjMTZmYmVhZGI0ZWE1Y ...

pada tab public hostname buat custom hostname: 
 - hostname: ssh-tunnel1.wibudev.com
 - service: tcp://ssh-server:2222


### ssh public key

```bash
ls -al ~/.ssh
```

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

```bash
cat ~/.ssh/id_ed25519.pub
```

### Network 

```bash
docker network create cloudflared-network
```

### .env

```ini
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiYzNhMjNkYTVjMTZmY ...
GRAFANA_ADMIN_PASSWORD=Makuro_123
SSH_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABA ...
```

### Docker compose

./docker-compose.yml
```yml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    restart: unless-stopped
    volumes:
      - ./cloudflared:/root/.cloudflared
    networks:
      - cloudflared-network
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}

  ssh-server:
    image: lscr.io/linuxserver/openssh-server:latest
    container_name: ssh-server
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Jakarta
      - PUBLIC_KEY=${SSH_PUBLIC_KEY}
      - USER_NAME=makuro
      - TCP_PORTS=22
      - SUDO_ACCESS=false
    volumes:
      - ./ssh-config:/config
      - ./apps:/apps
    networks:
      - cloudflared-network
volumes:
  cloudflared:
  ssh-config:

networks:
  cloudflared-network:
    external: true
```


## CLIENT

install cloudflared

```bash
sudo apt-get update && sudo apt-get install cloudflared
```

login

```bash
cloudflared tunnel login
```

### ssh

```bash
cat ~/.ssh/config
```

```ini
Host ssh-tunnel1
  HostName ssh-tunnel1.wibudev.com
  User makuro
  Port 22
  ProxyCommand cloudflared access ssh --hostname %h
```

```bash
ssh sshtunnel1
```





