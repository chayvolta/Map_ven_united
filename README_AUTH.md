# Geoportal FONATUR - Autenticación con Azure AD

## 🎉 Implementación Completada

Se ha implementado autenticación empresarial con **Microsoft Azure AD (Entra ID)** siguiendo las **mejores prácticas de Microsoft** para despliegue en **App Service Premium**.

---

## 📦 Archivos creados/modificados

### Configuración Core

- ✅ [`src/authConfig.js`](src/authConfig.js) - Configuración MSAL con mejores prácticas
- ✅ [`src/main.jsx`](src/main.jsx) - Inicialización de MSAL Provider
- ✅ [`src/App.jsx`](src/App.jsx) - Protección de rutas y UI de usuario
- ✅ [`src/components/AzureLogin.jsx`](src/components/AzureLogin.jsx) - Componente de login

### Utilidades

- ✅ [`src/hooks/useUserInfo.js`](src/hooks/useUserInfo.js) - Hooks para Microsoft Graph API

### Variables de entorno

- ✅ [`.env.example`](.env.example) - Template de variables
- ✅ [`.env.local`](.env.local) - Variables locales (configura aquí tus credenciales)
- ✅ [`.gitignore`](.gitignore) - Actualizado para proteger .env

### Deployment

- ✅ [`AZURE_SETUP.md`](AZURE_SETUP.md) - Guía completa de configuración
- ✅ [`.github/workflows/azure-deploy.yml`](.github/workflows/azure-deploy.yml) - CI/CD con GitHub Actions
- ✅ [`public/web.config`](public/web.config) - Configuración IIS con headers de seguridad
- ✅ [`.vscode/launch.json`](.vscode/launch.json) - Debug configuration

---

## 🚀 Próximos pasos

### 1. Configurar Azure AD (15 minutos)

Lee la guía completa en [`AZURE_SETUP.md`](AZURE_SETUP.md)

**Resumen rápido:**

1. Ve a [Azure Portal](https://portal.azure.com)
2. **Azure Active Directory** → **App registrations** → **New registration**
3. Nombre: `Geoportal FONATUR`
4. Redirect URI (SPA):
   - `http://localhost:5173` (desarrollo)
   - `https://tu-app.azurewebsites.net` (producción)
5. Copia **Application ID** y **Tenant ID**

### 2. Configurar variables locales

Edita [`.env.local`](.env.local):

```bash
VITE_AZURE_CLIENT_ID=tu_client_id_aqui
VITE_AZURE_TENANT_ID=tu_tenant_id_aqui
VITE_REDIRECT_URI=http://localhost:5173
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_ENVIRONMENT=development
```

### 3. Probar localmente

```bash
npm run dev
```

Abre http://localhost:5173 y prueba el login con tu cuenta Microsoft de FONATUR.

### 4. Configurar App Service (producción)

En Azure Portal, tu **App Service** → **Configuration** → **Application settings**:

```
VITE_AZURE_CLIENT_ID = [tu_client_id]
VITE_AZURE_TENANT_ID = [tu_tenant_id]
VITE_REDIRECT_URI = https://tu-app.azurewebsites.net
VITE_POST_LOGOUT_REDIRECT_URI = https://tu-app.azurewebsites.net
VITE_ENVIRONMENT = production
```

### 5. Deploy a Azure

**Opción A - Azure CLI:**

```bash
npm run build
az webapp deployment source config-zip \
  --resource-group rg-geoportal-fonatur \
  --name geoportal-fonatur \
  --src dist.zip
```

**Opción B - VS Code:**

1. Instala extensión Azure App Service
2. Clic derecho en `dist/`
3. Deploy to Web App

**Opción C - GitHub Actions:**
Ya configurado en [`.github/workflows/azure-deploy.yml`](.github/workflows/azure-deploy.yml)

---

## 🔒 Mejores prácticas implementadas

### Seguridad

✅ **sessionStorage** en lugar de localStorage (más seguro)
✅ **Cookies seguras** habilitadas
✅ **No logging de PII** (información personal identificable)
✅ **Principle of Least Privilege** - Solo permisos User.Read
✅ **HTTPS obligatorio** con Strict-Transport-Security
✅ **CSP headers** para prevenir XSS
✅ **X-Frame-Options** para prevenir clickjacking

### Autenticación

✅ **Popup login** con fallback a redirect automático
✅ **Silent token refresh** para UX sin interrupciones
✅ **Manejo de errores** robusto
✅ **Event callbacks** para gestión de sesión
✅ **Multi-account support** preparado

### Performance

✅ **Code splitting** preparado
✅ **Compresión gzip** en web.config
✅ **Caching de recursos estáticos**
✅ **Lazy loading** de componentes posible

### DevOps

✅ **Variables de entorno** separadas por ambiente
✅ **GitHub Actions** para CI/CD
✅ **Debug configuration** para VS Code
✅ **Key Vault** ready para secretos empresariales

---

## 📱 Funcionalidades

### Para usuarios

- 🔐 Login con cuenta Microsoft corporativa
- 👤 Información de usuario visible (nombre, email)
- 🚪 Logout seguro (local o completo)
- 🔄 Sesión persistente entre recargas
- 📱 Responsive en todos los dispositivos

### Para administradores

- 👥 Gestión centralizada en Azure AD
- 🛡️ MFA (Multi-Factor Authentication) si está habilitado
- 📊 Logs de acceso en Azure Portal
- 🔑 Revocación de acceso instantánea
- 📧 Invitación de usuarios por email

---

## 🧪 Testing

### Probar autenticación localmente:

```bash
npm run dev
```

### Probar build de producción:

```bash
npm run build
npm run preview
```

---

## 🆘 Solución de problemas comunes

### ❌ "Redirect URI mismatch"

**Solución:** Verifica que la URL en Azure Portal coincida exactamente con tu VITE_REDIRECT_URI

### ❌ "Application not found"

**Solución:** Verifica VITE_AZURE_CLIENT_ID y que estés en el tenant correcto

### ❌ Popup bloqueado

**Solución:** El componente tiene fallback automático, o usa "método alternativo"

### ❌ Variables no se cargan

**Solución:**

- Deben empezar con `VITE_`
- Reinicia el servidor
- En producción, configúralas en App Service

### ❌ CORS errors

**Solución:** No debería haber - MSAL maneja CORS automáticamente. Verifica que uses las URLs correctas de Azure.

---

## 📚 Documentación adicional

- 📖 [Guía completa de configuración](AZURE_SETUP.md)
- 🔧 [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- 🏢 [Azure AD Best Practices](https://learn.microsoft.com/azure/active-directory/develop/identity-platform-integration-checklist)
- ☁️ [App Service Documentation](https://learn.microsoft.com/azure/app-service/)

---

## 🎯 Siguiente nivel (opcional)

### Implementar funcionalidades adicionales:

- [ ] **Roles y permisos** con Azure AD Groups
- [ ] **Conditional Access** policies
- [ ] **B2B Collaboration** para usuarios externos
- [ ] **Application Insights** para monitoreo
- [ ] **Azure Key Vault** para secretos
- [ ] **Custom branding** en login screen

---

## 💡 Tips importantes

1. **Nunca** subas `.env.local` a git (ya está en .gitignore)
2. Usa **Azure Key Vault** en producción para máxima seguridad
3. Habilita **MFA** en Azure AD para todos los usuarios
4. Revisa **sign-in logs** regularmente en Azure Portal
5. Mantén **MSAL libraries** actualizadas

---

**¿Necesitas ayuda?**

- 📧 Contacta al administrador de Azure AD de FONATUR
- 🎫 Abre un ticket con Azure Support
- 📞 Llama al soporte técnico de Microsoft

---

✨ **¡Implementación completa y lista para producción!**
