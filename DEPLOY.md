# Deploying school28.uz

```
 editor clicks "Publish" in /admin ─┐
                                    ├─► commit on main ─► GitHub Actions ─► Docker Hub ─► VPS pulls & restarts
 developer runs `git push`  ────────┘     (check, build)    nazacd/school28-web     (/opt/school28/deploy.sh)
```

Every push to `main` goes live automatically, usually **2–4 minutes** after the commit.
HTML pages are never cached, so visitors see the change as soon as the deploy finishes.
Build assets (CSS, fonts) are cached for a year; their file names change with every build.

On the VPS, the site runs as the container `school28-web` on the existing `sat_makon_network`.
The existing edge nginx (`makonbook-nginx`) proxies `school28.uz` to it, exactly like `sat-makon-site`.
No ports are opened on the host.

| File in this repo | Goes to | Purpose |
|---|---|---|
| `.github/workflows/deploy.yml` | GitHub | check → build → push → deploy |
| `deploy/docker-compose.prod.yml` | `/opt/school28/docker-compose.yml` | the production container |
| `deploy/deploy.sh` | `/opt/school28/deploy.sh` | pull + restart + health check |
| `deploy/nginx-school28.conf` | appended to `/opt/sat-makon/makonbook/nginx/default.conf` | proxy + TLS for school28.uz |

---

## One-time setup

### 0. Before you start

- DNS: both `school28.uz` **and** `www.school28.uz` have an A record pointing to the VPS.
  Check with `dig +short school28.uz www.school28.uz`.
- The editor and the workflow both use the **`main`** branch. Merge the development branch into `main` first.

### 1. Docker Hub access token

hub.docker.com → **Account settings → Personal access tokens → Generate** (permission: *Read & Write*).
Keep it for step 4. The repository `nazacd/school28-web` is created automatically on the first push.

> The image contains no secrets (they live in `.env` on the server), so it can stay public.
> If you make it private, run `docker login -u nazacd` once on the VPS.

### 2. Prepare the VPS

From your computer, in the project folder:

```bash
ssh root@<VPS> 'mkdir -p /opt/school28'
scp deploy/docker-compose.prod.yml root@<VPS>:/opt/school28/docker-compose.yml
scp deploy/deploy.sh               root@<VPS>:/opt/school28/deploy.sh
```

On the VPS, create `/opt/school28/.env`:

```bash
cat > /opt/school28/.env <<'EOF'
SITE_URL=https://school28.uz

# Contact form email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=website@school28.uz
SMTP_PASS=change-me
CONTACT_TO=info@school28.uz
CONTACT_FROM="School 28 website <website@school28.uz>"

# /admin login (step 6)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
EOF
chmod 600 /opt/school28/.env
chmod +x /opt/school28/deploy.sh
```

### 3. Deploy key for GitHub Actions

Create a key pair used **only** for deploying. On your computer:

```bash
ssh-keygen -t ed25519 -N "" -C "github-actions-school28" -f school28_deploy
```

On the VPS, add the **public** key to `/root/.ssh/authorized_keys`, locked to the deploy script.
This is one line; replace `AAAA…` with the contents of `school28_deploy.pub`:

```
command="/opt/school28/deploy.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA… github-actions-school28
```

With `command=`, anyone holding this key can only run `deploy.sh`. They get no shell, no file access and no tunnels.

Get the server's host key so GitHub can verify it is talking to *your* server. Run this on your computer:

```bash
ssh-keyscan -H <VPS>
```

### 4. GitHub secrets

Repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | `nazacd` |
| `DOCKERHUB_TOKEN` | the token from step 1 |
| `VPS_HOST` | VPS IP address |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | the whole **private** key file `school28_deploy` |
| `VPS_KNOWN_HOSTS` | the output of `ssh-keyscan -H <VPS>` |
| `VPS_PORT` | only if SSH is not on port 22 |

Then delete the private key from your computer, or store it in a password manager.

### 5. nginx + HTTPS certificate

The site gets **its own certificate** (`--cert-name school28.uz`), separate from the makonbook/sat-makon SAN
certificate. If anything goes wrong while issuing it, the other two sites are not affected.

**a) Check certbot's mounts** (webroot and certificate folder):

```bash
docker inspect makonbook-certbot --format '{{range .Mounts}}{{.Destination}}{{"\n"}}{{end}}'
# expect /var/www/certbot and /etc/letsencrypt
```

**b) Add the HTTP block.** Open `/opt/sat-makon/makonbook/nginx/default.conf` and append only the first
`server { listen 80; … }` block from `deploy/nginx-school28.conf`. Then:

```bash
docker exec makonbook-nginx nginx -t && docker exec makonbook-nginx nginx -s reload
```

> **Bind-mount gotcha:** `default.conf` is mounted as a single file. Some editors (and `sed -i`) save by
> replacing the file, so the container keeps seeing the old version. If `docker exec makonbook-nginx cat
> /etc/nginx/conf.d/default.conf` doesn't show your edit, run `docker restart makonbook-nginx`.
> That causes about a second of downtime for all sites.

**c) Issue the certificate.** Do a dry run first, then the real one:

```bash
docker exec makonbook-certbot certbot certonly --webroot -w /var/www/certbot \
  --cert-name school28.uz -d school28.uz -d www.school28.uz \
  --email you@example.com --agree-tos --no-eff-email --dry-run

# if the dry run succeeds, run the same command without --dry-run
```

**d) Add the HTTPS block.** Append the `server { listen 443 ssl; … }` block from `deploy/nginx-school28.conf`, then:

```bash
docker exec makonbook-nginx nginx -t && docker exec makonbook-nginx nginx -s reload
```

The upstream is a variable resolved through Docker DNS (the same pattern as your other sites). nginx starts
fine even before `school28-web` exists, and returns 502 for this site only while it is down.

**e) Renewal.** Your certbot container's renew loop renews every certificate lineage, including this one.
nginx must reload to start using renewed files. Whatever already does that for makonbook covers this site too.
If nothing does, add a cron job on the VPS: `0 4 * * * docker exec makonbook-nginx nginx -s reload`.

### 6. Editor login (/admin)

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**

- Homepage URL: `https://school28.uz`
- Authorization callback URL: `https://school28.uz/api/callback`

Put the Client ID and a generated Client secret into `/opt/school28/.env`. Give each editor write access to
the `nazacd/school28_web` repository.

### 7. First deploy

Push to `main`, or open **Actions → Build & deploy → Run workflow**. When it turns green, open https://school28.uz.

---

## Everyday use

| You want to… | Do this |
|---|---|
| Change text or photos | `/admin` → edit → **Publish**. Live in a few minutes. |
| Ship code changes | `git push` to `main` (or merge a pull request). Pull requests are only built and checked. |
| Change `.env` (SMTP, OAuth) | edit `/opt/school28/.env`, then run `/opt/school28/deploy.sh` (it recreates the container with the new values) |
| Redeploy by hand | `/opt/school28/deploy.sh` on the VPS, or **Run workflow** on GitHub |
| Roll back | `git revert <commit>` and push. The previous version is rebuilt and deployed. For an emergency rollback on the VPS: `docker tag nazacd/school28-web:<old-commit-sha> nazacd/school28-web:latest && docker compose -f /opt/school28/docker-compose.yml up -d` |
| See logs | `docker logs -f school28-web` (contact-form messages are logged here when SMTP is not set) |
| Watch a deploy | GitHub → **Actions** tab. A failed deploy shows the container logs. |

Notes:
- Each image is tagged `latest` and with its commit SHA, so every version stays on Docker Hub for rollbacks.
- A redeploy restarts the container, so expect 1–2 seconds of 502 for this site only. If several publishes
  happen quickly, only the newest one is deployed.
- `deploy.sh` waits for the container's health check. If the new version doesn't come up, the workflow fails and prints the logs.
