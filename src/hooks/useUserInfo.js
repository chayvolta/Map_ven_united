/**
 * Hook personalizado para obtener información del usuario autenticado
 * usando Microsoft Graph API
 */
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest, graphConfig } from '../authConfig';

export function useUserInfo() {
  const { instance, accounts } = useMsal();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!accounts || accounts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Obtener token de acceso
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });

        // Llamar a Microsoft Graph API
        const graphResponse = await fetch(graphConfig.graphMeEndpoint, {
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        });

        if (!graphResponse.ok) {
          throw new Error('Error al obtener información del usuario');
        }

        const userData = await graphResponse.json();
        setUserInfo(userData);
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [accounts, instance]);

  return { userInfo, loading, error };
}

/**
 * Hook para obtener foto de perfil del usuario
 */
export function useUserPhoto() {
  const { instance, accounts } = useMsal();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (!accounts || accounts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });

        const photoResponse = await fetch(graphConfig.graphMePhotoEndpoint, {
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        });

        if (photoResponse.ok) {
          const blob = await photoResponse.blob();
          const url = URL.createObjectURL(blob);
          setPhotoUrl(url);
        }
      } catch (err) {
        console.error('Error fetching user photo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPhoto();

    // Cleanup
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [accounts, instance]);

  return { photoUrl, loading };
}
