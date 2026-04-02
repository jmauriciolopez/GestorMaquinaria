import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface FotoSeleccionada {
  uri: string;
  base64?: string;
  fileName?: string;
  mimeType?: string;
}

export function useFotos(maxFotos = 5) {
  const [fotos, setFotos] = useState<FotoSeleccionada[]>([]);

  const solicitarPermiso = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir fotos.');
      return false;
    }
    return true;
  }, []);

  const tomarFoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara.');
      return;
    }
    if (fotos.length >= maxFotos) {
      Alert.alert('Límite alcanzado', `Máximo ${maxFotos} fotos.`);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFotos((prev) => [...prev, { uri: asset.uri, base64: asset.base64 ?? undefined, mimeType: asset.mimeType ?? 'image/jpeg' }]);
    }
  }, [fotos, maxFotos]);

  const seleccionarDeBiblioteca = useCallback(async () => {
    const ok = await solicitarPermiso();
    if (!ok) return;
    if (fotos.length >= maxFotos) {
      Alert.alert('Límite alcanzado', `Máximo ${maxFotos} fotos.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFotos((prev) => [...prev, { uri: asset.uri, base64: asset.base64 ?? undefined, mimeType: asset.mimeType ?? 'image/jpeg' }]);
    }
  }, [fotos, maxFotos, solicitarPermiso]);

  const eliminarFoto = useCallback((uri: string) => {
    setFotos((prev) => prev.filter((f) => f.uri !== uri));
  }, []);

  // Devuelve las fotos como array de URIs (para enviar al backend)
  const fotosUri = fotos.map((f) => f.uri);

  return { fotos, fotosUri, tomarFoto, seleccionarDeBiblioteca, eliminarFoto };
}
