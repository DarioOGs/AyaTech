# Notificaciones por correo (gratis, sin tarjeta)

Esto hace que llegue un correo real:
- Al **administrador**, cada vez que un cliente registra un pedido nuevo.
- Al **cliente**, cuando el administrador confirma o cancela su pedido (solo si el
  cliente escribió su correo al hacer el pedido — ese campo es opcional).

No usa Firebase ni requiere activar ningún plan de pago: es un pequeño
script de Google (Apps Script) que se despliega como página web y solo
sabe hacer una cosa, enviar el correo, usando la cuenta de Google del
equipo o de la finca.

## Desplegarlo (una sola vez)

1. Ve a [script.google.com](https://script.google.com) e inicia sesión con la
   cuenta de Google que va a enviar los correos (puede ser la misma del
   proyecto de Firebase, o la de la finca).
2. Clic en **"Nuevo proyecto"**.
3. Borra el código de ejemplo y pega todo el contenido del archivo
   `Codigo.gs` de esta carpeta.
4. Cambia la línea `const CORREOS_ADMIN = "..."` por el correo (o correos,
   separados por coma) donde quieren recibir el aviso de pedidos nuevos.
5. Guarda el proyecto (ícono de disquete), ponle un nombre como
   "Notificaciones Alevinos".
6. Arriba a la derecha, clic en **"Implementar" → "Nueva implementación"**.
7. En "Seleccionar tipo", elige **"Aplicación web"**.
8. Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
9. Clic en **"Implementar"**. La primera vez te pedirá autorizar permisos
   (tu propia cuenta pidiéndote confirmar que el script puede enviar
   correos en tu nombre) — acepta.
10. Copia la **URL de la aplicación web** que te entrega (termina en
    `/exec`).

## Conectarlo con la app

Pega esa URL en tu archivo `.env`:

```
VITE_NOTIFICACIONES_URL=https://script.google.com/macros/s/AKfycb.../exec
```

Reinicia `npm run dev` (o vuelve a desplegar con `firebase deploy` en
producción) para que tome el nuevo valor.

Si dejas `VITE_NOTIFICACIONES_URL` vacía, la app sigue funcionando
normal — simplemente no se envía ningún correo, sin errores.

## Actualizar el script más adelante

Si cambian de administrador o quieren agregar más correos, entra de
nuevo a [script.google.com](https://script.google.com), abre el
proyecto, edita `CORREOS_ADMIN`, guarda, y en "Implementar" elige
**"Administrar implementaciones" → editar (ícono de lápiz) → Nueva
versión → Implementar**. La URL no cambia.
