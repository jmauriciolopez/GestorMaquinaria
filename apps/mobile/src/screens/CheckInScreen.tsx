import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { devolucionesApi } from '../api/endpoints';

export const CheckInScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { alquilerId, items = [] } = route.params;
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState<Record<string, any>>(
    Object.fromEntries(items.map((i: any) => [
      i.activoId,
      { condicion: '', obs: '', tieneDanios: false, tieneRetraso: false, horasRetraso: '' },
    ])),
  );

  const updateForm = (activoId: string, field: string, value: unknown) => {
    setForms((prev) => ({ ...prev, [activoId]: { ...prev[activoId], [field]: value } }));
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      for (const item of items) {
        const f = forms[item.activoId];
        await devolucionesApi.checkIn(alquilerId, {
          activoId: item.activoId,
          condicionRetorno: f.condicion,
          observaciones: f.obs,
          tieneDanios: f.tieneDanios,
          tieneRetraso: f.tieneRetraso,
          horasRetraso: f.tieneRetraso ? Number(f.horasRetraso) : 0,
        });
      }
      Alert.alert('✅ Check-In completado', 'Los equipos fueron recibidos correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo completar el check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Check-In / Devolución</Text>
      {items.map((item: any) => {
        const f = forms[item.activoId] ?? {};
        return (
          <View key={item.activoId} style={styles.card}>
            <Text style={styles.cardTitle}>Activo: {item.activoId?.slice(0, 8)}...</Text>
            <TextInput style={styles.input} placeholder="Condición de retorno" placeholderTextColor="#475569"
              value={f.condicion} onChangeText={(v) => updateForm(item.activoId, 'condicion', v)} />
            <TextInput style={styles.input} placeholder="Observaciones" placeholderTextColor="#475569"
              value={f.obs} onChangeText={(v) => updateForm(item.activoId, 'obs', v)} />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>¿Tiene daños?</Text>
              <Switch value={f.tieneDanios} onValueChange={(v) => updateForm(item.activoId, 'tieneDanios', v)} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>¿Tiene retraso?</Text>
              <Switch value={f.tieneRetraso} onValueChange={(v) => updateForm(item.activoId, 'tieneRetraso', v)} />
            </View>
            {f.tieneRetraso && (
              <TextInput style={styles.input} placeholder="Horas de retraso" placeholderTextColor="#475569"
                keyboardType="numeric" value={f.horasRetraso}
                onChangeText={(v) => updateForm(item.activoId, 'horasRetraso', v)} />
            )}
          </View>
        );
      })}
      <TouchableOpacity style={styles.btn} onPress={handleCheckIn} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirmar Devolución</Text>}
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
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  switchLabel: { color: '#f8fafc', fontSize: 14 },
  btn: { backgroundColor: '#22c55e', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
