# gesfut-front

## Deploy (Easypanel)

Los servicios en Easypanel se llaman `db`, `back` y `front`. Hay que setear `BACKEND_URL` en el front (por ejemplo `http://back:8080`). El default de la imagen (`http://gesfut-back:8080`) no va a resolver con esos nombres. No hay secretos en la imagen; `BACKEND_URL` es una env de runtime.

`REAL_IP_FROM` es un CIDR extra para `set_real_ip_from` (default `10.0.0.0/8`). El template ya incluye redes privadas Docker. Solo origen, sin secretos.
