# Servidor en DigitalOcean

Guía rápida de como se hizo deploy en DigitalOcean para poder consumir las apis de este proyecto NodeJs

Se completó el formulario para crear un droplet de DigitalOcean

## Configuración del servidor

### Nos conectamos al servidor vía SSH windows:

1. Abrimos la terminal de windows
2. Pegamos la dirección ipv4 que muestra el droplet
3. Pegamos el comando: ``` ssh nombre_usuario@ipv4 ```

### Actualizamos el servidor

Cuando estemos conectados vía SSH al servidor ejecutamos los siguientes comandos para mantener actualizado el servidor:

``` 
sudo apt update
sudo apt upgrade
```

### Instalamos nvm para desplegar proyecto node:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Repositorio del comando: https://github.com/nvm-sh/nvm

### Refrescamos scripts del servidor:

```
source ~/.bashrc
```

### Instalamos node:

```
nvm install node
```

### Creamos una carpeta en donde estará el proyecto:

```
mkdir projects
```

### Clonamos el repositorio:

```
git clone https://github.com/cesardevhub/PRUEBA_CHATCARTEL_CESAR_DE_LEON.git
```

### Instalamos las dependencias de node:

```
cd PRUEBA_CHATCARTEL_CESAR_DE_LEON
npm i
```

### Configuramos las variables de entorno:

```
cp .env.example .env
nano .env
```

### Instalamos pm2:

```
npm install pm2 -g
```

### Ejecutamos proyecto:

Necesitamos dos comandos ya que es un proyecto con typescript y en el package.json tenemos el script "build" que ejecuta tsc, comando que compila el proyecto a javascript y lo guarda en la carpeta build ya que en tsconfig.json tenemos el campo outDir con el valor ./build, valor que indica en donde se debe guardar el proyecto pasado a javascript

```
npm run build
pm2 start build/index.js
```

### Indicar reinicios del proyecto

Indicamos que se debe reiniciar el proyecto cuando ocurra algo inesperado y se pare el servidor

```
pm2 startup
pm2 save
```

## Levantar firewall - activar

```
sudo ufw enable
```

### Admitimos conexiones con ssh, http, https

```
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
```

### Recargamos el firewall

```
sudo ufw reload
```

### Instalamos nginx

```
sudo apt install nginx
```

### Activamos conexión de nginx

```
sudo ufw allow 'Nginx HTTP'
```

### Verificamos el estado de nginx

```
systemctl status nginx
```

## Configuramos virtual host de nginx

Entramos a editar el archivo con los siguientes comandos:

```
cd /etc/nginx/sites-available/
nano default
```

Pegamos lo siguiente antes de server{

``` 
upstream nodejs_project {
    server 127.0.0.1:3000;
    keepalive 61;
}
```

Sustituimos todo el apartado location

```
location / {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header HOST $http_host;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_pass http://nodejs_project/;
    proxy_redirect off;
    proxy_read_timeout 240s;
}
```

### Validamos que el status este bien

```
service nginx status
```

### Reiniciamos nginx restart

```
service nginx restart
```

### Validar entorno externo

Petición GET: 

```
http://68.183.29.160/user/test
```

Respuesta esperada: 

```
{
    "message": "User test running successfully"
}
```