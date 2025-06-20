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
    healthcheck:
      test: ["CMD", "cloudflared", "--version"] # Checks if cloudflared is responsive
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  ssh-server:
    image: linuxserver/openssh-server:latest
    container_name: ssh-server
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Makasar
      - PUBLIC_KEY=${SSH_PUBLIC_KEY}
      - USER_NAME=makuro
      - TCP_PORTS=22
      - SUDO_ACCESS=false
    volumes:
      - ./ssh-config:/config
    networks:
      - cloudflared-network
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "22"] # Checks if SSH server is listening on port 22
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

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

### akses host dari container

jalankan app

```bash
bun run dev --port 3000 --host 0.0.0.0
```

```bash
➜ Network:  http://192.168.1.247:3000/
```

atau 


```bash
(base) bips-MacBook-Air:cloudflared bip$ ifconfig
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	options=6463<RXCSUM,TXCSUM,TSO4,TSO6,CHANNEL_IO,PARTIAL_CSUM,ZEROINVERT_CSUM>
	ether c0:95:6d:3f:e3:1a 
	inet6 fe80::4fa:90e3:7add:9269%en0 prefixlen 64 secured scopeid 0xb 
	inet 192.168.1.247 netmask 0xffffff00 broadcast 192.168.1.255
	nd6 options=201<PERFORMNUD,DAD>
	media: autoselect
	status: active
```

### login ke Host

```bash
ssh bip@host.docker.internal -p 22
```

### custom port 22

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
    healthcheck:
      test: ["CMD", "cloudflared", "--version"] 
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  ssh-server:
    image: linuxserver/openssh-server:latest
    container_name: ssh-server
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Makassar
      - PUBLIC_KEY=${SSH_PUBLIC_KEY}
      - USER_NAME=makuro
      - SUDO_ACCESS=false
      - LISTEN_PORT=22  # Ini akan membuat SSH listen di port 22
    volumes:
      - ./ssh-config:/config
    networks:
      - cloudflared-network
    ports:
      - "2222:22"  # Host port 2222 -> Container port 22
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "22"] 
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  cloudflared-network:
    external: true
```

### akses Host

```bash
# Cek status SSH
sudo systemsetup -getremotelogin

# Aktifkan SSH jika belum aktif
sudo systemsetup -setremotelogin on

# Atau melalui System Preferences
# System Preferences > Sharing > Remote Login
```

