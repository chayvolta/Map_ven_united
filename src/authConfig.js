/**
 * Configuración de Azure AD (Microsoft Entra ID) para autenticación MSAL
 * Siguiendo las mejores prácticas de Microsoft para App Service Premium
 */

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI || window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Mejor práctica: usar sessionStorage para mayor seguridad
    storeAuthStateInCookie: true, // Mejor práctica: true para compatibilidad con IE11 y Edge
    secureCookies: true, // Solo enviar cookies por HTTPS en producción
  },
  system: {
    loggerOptions: {
      logLevel: import.meta.env.PROD ? 'Error' : 'Info', // Solo errores en producción
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return; // No loguear información personal
        switch (level) {
          case 'Error':
            console.error(message);
            break;
          case 'Info':
            console.info(message);
            break;
          case 'Verbose':
            console.debug(message);
            break;
          case 'Warning':
            console.warn(message);
            break;
        }
      },
      piiLoggingEnabled: false, // Mejor práctica: nunca loguear PII
    },
    allowRedirectInIframe: false, // Mejor práctica: prevenir ataques de clickjacking
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
  },
};

/**
 * Scopes para Microsoft Graph API
 * Solicitar solo los permisos mínimos necesarios (Principle of Least Privilege)
 */
export const loginRequest = {
  scopes: ['User.Read'], // Permiso básico para leer perfil de usuario
  prompt: 'select_account', // Permitir selección de cuenta
};

/**
 * Scopes adicionales si necesitas acceder a más recursos de Microsoft Graph
 */
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphMePhotoEndpoint: 'https://graph.microsoft.com/v1.0/me/photo/$value',
};

/**
 * Configuración de protección de tokens
 */
export const protectedResources = {
  graphMe: {
    endpoint: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['User.Read'],
  },
};
