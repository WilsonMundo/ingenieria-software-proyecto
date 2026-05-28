# Deploy VPS - GolTech

Dominio: `https://goltech.mundoalonzo.com`

## Backend y base de datos

En la VPS, desde la raiz del proyecto:

```bash
cd /ruta/ingenieria-software-proyecto
cp backend/.env.example backend/.env
nano backend/.env
docker-compose -f backend/docker-compose.yml up --build -d
```

Usa una password real en `PASSWORD_DB` y una clave larga en `SECRET_KEY`.

## Frontend

```bash
cd /ruta/ingenieria-software-proyecto/frontend
npm ci
npm run build
sudo mkdir -p /var/www/goltech
sudo rsync -av --delete dist/frontend/browser/ /var/www/goltech/
```

## Nginx

```bash
sudo cp /ruta/ingenieria-software-proyecto/deploy/nginx-goltech.conf /etc/nginx/sites-available/goltech
sudo ln -sf /etc/nginx/sites-available/goltech /etc/nginx/sites-enabled/goltech
sudo nginx -t
sudo systemctl reload nginx
```

Si aun no tienes certificado:

```bash
sudo certbot --nginx -d goltech.mundoalonzo.com
```

## Actualizar despues de cambios

```bash
cd /ruta/ingenieria-software-proyecto
git pull
docker-compose -f backend/docker-compose.yml up --build -d
cd frontend
npm ci
npm run build
sudo rsync -av --delete dist/frontend/browser/ /var/www/goltech/
sudo systemctl reload nginx
```
