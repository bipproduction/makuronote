# DOCKER SSH TUNNEL

saat masuk ssh jika error jalankan perintah

```sh
ssh-keygen -R ssh-tunnel.wibudev.com
```

~/.ssh/config

```txt
Host ssh-tunnel1
  HostName ssh-tunnel1.wibudev.com
  User devuser
  Port 22
  ProxyCommand cloudflared access ssh --hostname %h
```

.env

```ini
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiY...
SSH_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABA ..."
```

mebuat kunci rsa

```bash
ssh-keygen -t rsa -b 4096 -C "email@contoh.com"
```

copy

```
pbcopy < ~/.ssh/id_rsa.pub
```

