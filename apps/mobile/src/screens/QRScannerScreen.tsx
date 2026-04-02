import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

export const QRScannerScreen = () => {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleScan = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    // El QR debe contener el código interno del activo o su ID
    navigation.navigate('BuscarActivo', { codigoEscaneado: data });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Sin acceso a la cámara.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => Camera.requestCameraPermissionsAsync()}>
          <Text style={styles.btnText}>Solicitar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleScan}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39'] }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.hint}>Apuntá la cámara al código QR del equipo</Text>
        {scanned && (
          <TouchableOpacity style={styles.btn} onPress={() => setScanned(false)}>
            <Text style={styles.btnText}>Escanear de nuevo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { color: '#f8fafc', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
  scanArea: {
    width: 240, height: 240,
    borderWidth: 3, borderColor: '#3b82f6', borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: { color: '#f8fafc', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  btn: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
