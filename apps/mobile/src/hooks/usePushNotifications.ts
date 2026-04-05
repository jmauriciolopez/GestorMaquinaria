import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';

// Configurar cómo se muestra la notificación cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Hook que:
 * 1. Pide permiso de notificaciones push
 * 2. Obtiene el Expo Push Token y lo registra en el backend
 * 3. Configura listeners para notificaciones recibidas y tapeadas
 *
 * Usar en el componente raíz de la app (App.tsx o _layout.tsx).
 */
export function usePushNotifications() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener     = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    void registerForPushNotifications();

    // Notificación recibida con la app abierta
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Push] Recibida:', notification.request.content.title);
    });

    // Usuario tapó la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as {
        screen?: string;
        alquilerId?: string;
      };
      console.log('[Push] Tapeada, navegar a:', data.screen, data.alquilerId);
      // TODO: usar el navigation ref global para navegar
      // navigationRef.navigate(data.screen, { id: data.alquilerId });
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}

async function registerForPushNotifications(): Promise<void> {
  // Las push notifications solo funcionan en dispositivo físico
  if (!Device.isDevice) {
    console.warn('[Push] Se requiere dispositivo físico para push notifications');
    return;
  }

  // Verificar/pedir permisos
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Permiso denegado por el usuario');
    return;
  }

  // Canal Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'GestorMaquinaria',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Obtener token y registrarlo en el backend
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await apiClient.post('/notificaciones/token', {
      expoPushToken: tokenData.data,
    });
    console.log('[Push] Token registrado:', tokenData.data);
  } catch (err) {
    console.error('[Push] Error registrando token:', err);
  }
}
