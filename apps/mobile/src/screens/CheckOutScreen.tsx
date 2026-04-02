import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { alquileresApi } from '../api/endpoints';
import { FotoSelector } from '../components/FotoSelector';
import { FotoSeleccionada } from '../hooks/useFotos';

export const CheckOutScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { alquilerId, items = [] } = route.params;
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState<Record<string, { condicion: string; obs: string; fotos: FotoSeleccionada[] }>>(
    Object.fromEntries(items.map((i: any) => [i.activoId, { condicion: '', obs: '', fotos: [] }]))
  );

  const update = (activoId: string, field: string, value: unknown) =>
    setForms((prev) => ({ ...prev, [activoId]: { ...prev[activoId], [field]: value } }));

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      for (const item of items) {
        const f = forms[item.activoId];
        await alquileresApi.checkOut(alquilerId, {
          activoId: item.activoId,
          condicionSalida: f.condicion,
          observaciones: f.obs,
          fotosSalida: f.fotos.map((foto) => foto.uri),
        });
      }
      Alert.alert('✅ Check-Out completado', 'Los equipos fueron entregados.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo completar el check-out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Check-Out de Equipos</Text>
      {items.map((item: any) => (
        <View key={item.activoId} style={styles.card}>
          <Text style={styles.cardTitle}>Activo: {item.activoId?.slice(0, 8)}...</Text>
          <Text style={styles.label}>Condición de salida</Text>
          <TextInput style={styles.input} placeholder="Sin daños, operativo..." placeholderTextColor="#475569"
            value={forms[item.activoId]?.condicion} onChangeText={(v) => update(item.activoId, 'condicion', v)} />
          <Text style={styles.label}>Observaciones</Text>
          <TextInput style={[styles.input, { minHeight: 60 }]} multiline placeholder="Notas adicionales..."
            placeholderTextColor="#475569" value={forms[item.activoId]?.obs} onChangeText={(v) => update(item.activoId, 'obs', v)} />
          <FotoSelector
            label="Fotos de salida"
            maxFotos={4}
            onChange={(fotos) => update(item.activoId, 'fotos', fotos)}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={handleCheckOut} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ Confirmar Check-Out</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginBottom: 16, marginTop: 8 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12, gap: 10 },
  cardTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  label: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 14, borderWidth: 1, borderColor: '#334155' },
  btn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
