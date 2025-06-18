# Health Check

docker-compose.yml

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
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "22"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  app1:
    image: oven/bun:debian
    container_name: app1
    restart: unless-stopped
    environment:
      - PORT=3000
    volumes:
      - ./apps:/apps
    working_dir: /apps
    command: bun run src/index.ts
    networks:
      - cloudflared-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - ./grafana:/var/lib/grafana
    networks:
      - cloudflared-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

networks:
  cloudflared-network:
    external: true
```

### service monitor

```yml
services:
  monitor:
    image: alpine
    container_name: health_monitor
    volumes:
      - ./notify.sh:/notify.sh
    command: sh -c "apk add curl && chmod +x /notify.sh && docker events --filter 'event=health_status' --filter 'health_status=unhealthy' | /notify.sh"
    networks:
      - cloudflared-network
```

notify.sh

```sh
#!/bin/bash
while read -r event; do
    container=$(echo "$event" | grep -oP 'container \K[^ ]+')
    message="Kontainer $container terdeteksi unhealthy pada $(date)"
    # Kirim notifikasi ke Telegram
    curl -s -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
         -d chat_id="<YOUR_CHAT_ID>" \
         -d text="$message"
done
```
