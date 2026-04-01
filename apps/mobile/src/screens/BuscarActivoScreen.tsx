import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { activosApi, movimientosApi } from '../api/endpoints';

export const BuscarActivoScreen = () => {
  const navigation = useNavigation<any>();
  const [codigo, setCodigo] = useState('');
  const [activo, setActivo] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    try {
      const res = await activosApi.buscar(codigo.trim());
      const items = res.data?.data ?? res.data ?? [];
      const found = Array.isArray(items) ? items[0] : items;
      setActivo(found ?? null);
      if (found) {
        const hist = await movimientosApi.historial(found.id);
        setHistorial(hist.data?.data ?? hist.data ?? []);
      }
    } catch {
      Alert.alert('Error', 'No se encontró el activo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Buscar Activo</Text>
      {/* Placeholder QR — interfaz preparada para futura integración */}
      <TouchableOpacity style={styles.qrPlaceholder}>
        <Text style={styles.qrIcon}>📷</Text>
        <Text style={styles.qrText}>Escanear QR (próximamente)</Text>
      </TouchableOpacity>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Código interno o serie..."
          placeholderTextColor="#475569"
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={buscar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.searchBtnText}>Buscar</Text>}
        </TouchableOpacity>
      </View>

      {activo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{activo.codigoInterno}</Text>
          <Row label="Modelo" value={activo.modelo?.nombre ?? '—'} />
          <Row label="Serie" value={activo.numeroSerie ?? '—'} />
          <Row label="Estado" value={activo.estado?.toUpperCase()} />
          <Row label="Ubicación" value={activo.ubicacionActual ?? '—'} />
        </View>
      )}

      {historial.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Últimos movimientos</Text>
          {historial.slice(0, 5).map((m: any) => (
            <View key={m.id} style={styles.historialItem}>
              <Text style={styles.historialTipo}>{m.tipo?.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.historialFecha}>{new Date(m.createdAt).toLocaleDateString('es-AR')}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginBottom: 16, marginTop: 8 },
  qrPlaceholder: { borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 16, borderStyle: 'dashed' },
  qrIcon: { fontSize: 36, marginBottom: 6 },
  qrText: { color: '#64748b', fontSize: 13 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#1e293b', color: '#f8fafc', padding: 12, borderRadius: 10, fontSize: 14 },
  searchBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { color: '#f8fafc', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  rowLabel: { color: '#94a3b8', fontSize: 13 },
  rowValue: { color: '#f8fafc', fontSize: 13, fontWeight: '500' },
  sectionTitle: { color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  historialItem: { backgroundColor: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  historialTipo: { color: '#f8fafc', fontSize: 13, fontWeight: '500' },
  historialFecha: { color: '#94a3b8', fontSize: 12 },
});
