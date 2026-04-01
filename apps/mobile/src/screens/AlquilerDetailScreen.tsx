import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { alquileresApi } from '../api/endpoints';

export const AlquilerDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const [alquiler, setAlquiler] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alquileresApi.findOne(id)
      .then((r) => setAlquiler(r.data?.data ?? r.data))
      .catch(() => Alert.alert('Error', 'No se pudo cargar el alquiler'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#3b82f6" />;
  if (!alquiler) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Alquiler #{alquiler.id?.slice(0, 8)}</Text>
      <View style={styles.card}>
        <Row label="Cliente" value={alquiler.cliente?.nombre} />
        <Row label="Estado" value={alquiler.estado?.toUpperCase()} />
        <Row label="Inicio" value={new Date(alquiler.fechaInicio).toLocaleDateString('es-AR')} />
        <Row label="Vence" value={new Date(alquiler.fechaFinPrevista).toLocaleDateString('es-AR')} />
        <Row label="Total" value={`$${Number(alquiler.subtotal).toFixed(2)}`} />
      </View>

      <Text style={styles.sectionTitle}>Equipos</Text>
      {alquiler.items?.map((item: any) => (
        <View key={item.id} style={styles.itemCard}>
          <Text style={styles.itemText}>Activo: {item.activoId?.slice(0, 8)}...</Text>
          <Text style={styles.itemMeta}>${Number(item.precioUnitario).toFixed(2)}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.btnCheckout}
        onPress={() => navigation.navigate('CheckOut', { alquilerId: id, items: alquiler.items })}
      >
        <Text style={styles.btnText}>📤 Realizar Check-Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btnCheckin}
        onPress={() => navigation.navigate('CheckIn', { alquilerId: id, items: alquiler.items })}
      >
        <Text style={styles.btnText}>📥 Realizar Check-In</Text>
      </TouchableOpacity>
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
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  rowLabel: { color: '#94a3b8', fontSize: 14 },
  rowValue: { color: '#f8fafc', fontSize: 14, fontWeight: '500' },
  sectionTitle: { color: '#64748b', fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  itemCard: { backgroundColor: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  itemText: { color: '#f8fafc', fontSize: 14 },
  itemMeta: { color: '#94a3b8', fontSize: 13 },
  btnCheckout: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnCheckin: { backgroundColor: '#22c55e', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 32 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
