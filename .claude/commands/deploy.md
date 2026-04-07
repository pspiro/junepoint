---
description: Deploy the application to AWS — EC2 + Docker + nginx + Route53, using CDK for infrastructure
---

## Ground Rules
- This is a test/development deployment — optimize for simplicity over scale
- Use **Docker Compose** on EC2 (backend + postgres + nginx in containers)
- Use **AWS CDK** (TypeScript) to provision infrastructure — it's already set up in `infrastructure/`
- Use the AWS CLI for all AWS operations
- Operate in full auto mode — proceed through all steps without asking for permission unless genuinely blocked
- Run independent steps in parallel wherever possible

---

## Step 1 — Read project context

Read in parallel:
- `docs/overview.md` — project name and description (used for naming resources)
- `docs/config.md` — environment variables and secrets required by the backend
- `docs/structure.md` — folder layout
- `infrastructure/` — check what CDK code already exists

---

## Step 2 — Build the application

Run in parallel:

**Frontend build**
- In `frontend/`: run `npm install` then `npm run build`
- Output lands in `frontend/dist/` — these are the static files nginx will serve

**Backend compile**
- In `backend/`: run `npm install` then `npm run build` (or `tsc`)
- Output lands in `backend/dist/`

Confirm both builds succeed before continuing.

---

## Step 3 — Create Docker artifacts

Create the following files if they don't already exist:

**`backend/Dockerfile`**
- Base image: `node:20-alpine`
- Copy `dist/` and `package.json`, run `npm install --production`
- Expose port `3001`
- Entrypoint: `node dist/index.js`

**`docker-compose.yml`** (at project root)
- Services: `postgres`, `backend`, `nginx`
- `postgres`: image `postgres:16-alpine`, named volume for data, env vars for DB credentials
- `backend`: built from `backend/Dockerfile`, depends on `postgres`, env file from `/opt/app/.env`
- `nginx`: image `nginx:alpine`, mounts `frontend/dist` as static files, proxies `/api` to `backend:3001`, exposes port 80

**`nginx.conf`** (at project root)
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Step 4 — Create an ECR repository and push the Docker image

```bash
# Create ECR repo (if not exists)
aws ecr create-repository --repository-name capitalflow-backend --region us-east-1

# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t capitalflow-backend ./backend
docker tag capitalflow-backend:latest <ecr-uri>:latest
docker push <ecr-uri>:latest
```

---

## Step 5 — Write the CDK stack for EC2

In `infrastructure/lib/capitalflow-stack.ts` (or a new `deploy-stack.ts`), define:

- **VPC**: default VPC is fine for a test deployment
- **Security Group**: inbound 80 (HTTP), 443 (HTTPS if cert added later), 22 (SSH from your IP only)
- **Key Pair**: create or reference an existing EC2 key pair for SSH access
- **IAM Role**: EC2 instance role with policies for:
  - ECR pull (`AmazonEC2ContainerRegistryReadOnly`)
  - Secrets Manager read (scoped to `capitalflow/*` secrets)
- **EC2 Instance**: `t3.micro`, Amazon Linux 2023, attach the IAM role and security group
- **Elastic IP**: allocate and associate so the IP is stable across reboots
- Output the Elastic IP and instance ID

---

## Step 6 — Register a Route53 domain

Search for and register a cheap domain that fits the project (e.g., `.link`, `.click`, or `.io` — check current AWS pricing):

```bash
# Search available domains
aws route53domains check-domain-availability --domain-name capitalflow.link --region us-east-1

# Register (adjust domain name as needed; ~$5/yr for .link)
aws route53domains register-domain \
  --domain-name capitalflow.link \
  --duration-in-years 1 \
  --auto-renew \
  --admin-contact file://contact.json \
  --registrant-contact file://contact.json \
  --tech-contact file://contact.json \
  --region us-east-1
```

Create a `contact.json` file with the required registrant fields (first name, last name, email, phone, address). Registration takes a few minutes.

---

## Step 7 — Deploy the CDK stack

```bash
cd infrastructure
npm install
cdk bootstrap   # only needed once per account/region
cdk deploy
```

Note the Elastic IP from the stack outputs.

---

## Step 8 — Bootstrap the EC2 instance

SSH into the instance and set it up:

```bash
ssh -i <key.pem> ec2-user@<elastic-ip>

# Install Docker and Docker Compose
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Create `/opt/app/.env` on the instance with the backend environment variables from `docs/config.md` (fill in real values — DB password, JWT secret, Anthropic API key, etc.):

```bash
sudo mkdir -p /opt/app
sudo nano /opt/app/.env
```

Copy `docker-compose.yml` and `nginx.conf` to `/opt/app/` on the instance (via `scp` or by writing them directly). Copy the built `frontend/dist/` to `/opt/app/frontend/dist/`.

Authenticate to ECR, pull the backend image, and start services:

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ecr-uri>

cd /opt/app
docker-compose up -d
```

---

## Step 9 — Configure DNS in Route53

Once the domain is registered and the Elastic IP is known:

```bash
# Get the hosted zone ID (auto-created when domain was registered)
aws route53 list-hosted-zones

# Create A record pointing to the Elastic IP
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "capitalflow.link",
        "Type": "A",
        "TTL": 60,
        "ResourceRecords": [{ "Value": "<elastic-ip>" }]
      }
    }]
  }'
```

DNS propagation typically takes 1–5 minutes with TTL 60.

---

## Step 10 — Verify the deployment

Check each of the following:  (assuming, for example, a url of 'capitalflow.link')

- `http://capitalflow.link` — loads the React app home page
- `http://capitalflow.link/login` — React Router route works (SPA routing via nginx `try_files`)
- `http://capitalflow.link/api/health` — backend health check returns 200
- `http://capitalflow.link/api/auth/login` — auth endpoint reachable (expect 400/422, not 502)
- SSH in and run `docker-compose ps` — confirm all three containers are `Up`
- Check logs: `docker-compose logs backend` and `docker-compose logs nginx`

Fix any errors found before declaring the deployment complete.