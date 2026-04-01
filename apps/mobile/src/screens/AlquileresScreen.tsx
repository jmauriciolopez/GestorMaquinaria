import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { alquileresApi } from '../api/endpoints';

interface Alquiler {
  id: string;
  estado: string;
  cliente: { nombre: string };
  fechaFinPrevista: string;
  items: { activoId: string }[];
}

export const AlquileresScreen = () => {
  const navigation = useNavigation<any>();
  const [alquileres, setAlquileres] = useState<Alquiler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alquileresApi.findAll({ estado: 'entregado' })
      .then((r) => setAlquileres(r.data?.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const estadoColor: Record<string, string> = {
    entregado: '#f59e0b',
    confirmado: '#3b82f6',
    devuelto: '#22c55e',
    vencido: '#ef4444',
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#3b82f6" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alquileres activos</Text>
      <FlatList
        data={alquileres}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AlquilerDetail', { id: item.id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.cliente}>{item.cliente?.nombre ?? '—'}</Text>
              <View style={[styles.badge, { backgroundColor: estadoColor[item.estado] ?? '#64748b' }]}>
                <Text style={styles.badgeText}>{item.estado.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.meta}>Vence: {new Date(item.fechaFinPrevista).toLocaleDateString('es-AR')}</Text>
            <Text style={styles.meta}>{item.items?.length ?? 0} equipo(s)</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay alquileres activos</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginBottom: 16, marginTop: 8 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cliente: { color: '#f8fafc', fontWeight: '600', fontSize: 15 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  meta: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40 },
});
