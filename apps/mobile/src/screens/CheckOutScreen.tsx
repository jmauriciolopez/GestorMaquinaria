import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { alquileresApi } from '../api/endpoints';

export const CheckOutScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { alquilerId, items = [] } = route.params;
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState<Record<string, { condicion: string; obs: string }>>(
    Object.fromEntries(items.map((i: any) => [i.activoId, { condicion: '', obs: '' }])),
  );

  const updateForm = (activoId: string, field: string, value: string) => {
    setForms((prev) => ({ ...prev, [activoId]: { ...prev[activoId], [field]: value } }));
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      for (const item of items) {
        const f = forms[item.activoId];
        await alquileresApi.checkOut(alquilerId, {
          activoId: item.activoId,
          condicionSalida: f?.condicion,
          observaciones: f?.obs,
        });
      }
      Alert.alert('✅ Check-Out completado', 'Los equipos fueron entregados correctamente.', [
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
          <TextInput
            style={styles.input}
            placeholder="Condición de salida"
            placeholderTextColor="#475569"
            value={forms[item.activoId]?.condicion}
            onChangeText={(v) => updateForm(item.activoId, 'condicion', v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Observaciones"
            placeholderTextColor="#475569"
            value={forms[item.activoId]?.obs}
            onChangeText={(v) => updateForm(item.activoId, 'obs', v)}
          />
          {/* Placeholder para futura integración de fotos */}
          <TouchableOpacity style={styles.photoBtn}>
            <Text style={styles.photoBtnText}>📷 Agregar fotos (próximamente)</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={handleCheckOut} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirmar Check-Out</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginBottom: 16, marginTop: 8 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: '#94a3b8', fontSize: 13, marginBottom: 10, fontWeight: '600' },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 8, fontSize: 14 },
  photoBtn: { borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 10, alignItems: 'center', borderStyle: 'dashed' },
  photoBtnText: { color: '#64748b', fontSize: 13 },
  btn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
