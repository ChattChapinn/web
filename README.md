# ManiaChat 💬

Aplicación moderna de chat en tiempo real desarrollada con **Node.js, Express, Socket.IO y TypeScript**.

---

## 🚀 Características principales

- **Salas Temáticas**: Salas predefinidas como *Amistad* y *Ligue*.
- **Avatares de Género**: Selector de avatares masculinos (👦) y femeninos (👩).
- **Envío de Fotos e Imágenes**: Con compresión automática en cliente y visor a pantalla completa (Lightbox).
- **Mensajes Privados y Menciones**: Susurros directos entre usuarios con candado (`🔒`) y menciones con alertas (`@nombre`).
- **Selector de Emojis**: Catálogo clasificado por categorías (Caras, Gestos, Reacciones, Objetos).
- **Sonidos de Notificación**: Alertas de sonido generadas nativamente con Web Audio API (burbuja suave y doble campanita para privados) con botón de silenciar (`🔊 / 🔇`).
- **Logo Neón Giratorio**: Icono animado con rotación fluida y resplandor neón cian.
- **100% Responsivo**: Adaptado perfectamente para celulares, tablets y computadoras de escritorio.

---

## 🛠️ Comandos de Desarrollo y Producción

```bash
# Instalar dependencias
npm install

# Iniciar servidor en modo desarrollo
npm run dev

# Compilar proyecto para producción
npm run build

# Iniciar en producción
npm start
```

---

## 📦 Cómo subir el proyecto a GitHub

1. En tu computadora o terminal, inicializa el repositorio Git (si aún no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ManiaChat"
   ```
2. Crea un nuevo repositorio en [GitHub](https://github.com/new).
3. Conecta y sube tus cambios:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```

---

## 🌐 Cómo desplegar en Render (render.com)

El repositorio incluye el archivo `render.yaml` para despliegue automático en 1 clic.

### Opción 1: Despliegue con Blueprint (Recomendada)
1. Inicia sesión en [Render.com](https://render.com).
2. Haz clic en **New +** y selecciona **Blueprint**.
3. Selecciona tu repositorio de GitHub.
4. Render detectará automáticamente el archivo `render.yaml` y configurará todo.
5. Haz clic en **Apply** y tu chat estará en línea con HTTPS gratis.

### Opción 2: Despliegue Manual como Web Service
Si prefieres crearlo manualmente:
1. En Render, haz clic en **New +** > **Web Service**.
2. Conecta tu repositorio de GitHub.
3. Configura los siguientes campos:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. En **Advanced** (Opcional):
   - **Health Check Path**: `/health`
5. Haz clic en **Deploy Web Service**.

¡Listo! Render te proporcionará una URL pública (ejemplo: `https://maniachat.onrender.com`) lista para compartir.
