import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { usuario, logout } = useAuth();

  const acciones = [
    { label: '📋 Alquileres pendientes', screen: 'Alquileres' },
    { label: '🔍 Buscar activo por código', screen: 'BuscarActivo' },
    { label: '📤 Check-Out', screen: 'Alquileres' },
    { label: '📥 Check-In / Devolución', screen: 'Alquileres' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hola, {(usuario as any)?.nombre ?? 'Operador'}</Text>
          <Text style={styles.role}>{(usuario as any)?.rol ?? ''}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Operaciones rápidas</Text>
      {acciones.map((a) => (
        <TouchableOpacity
          key={a.screen + a.label}
          style={styles.card}
          onPress={() => navigation.navigate(a.screen)}
        >
          <Text style={styles.cardText}>{a.label}</Text>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, marginTop: 16 },
  welcome: { fontSize: 20, fontWeight: '700', color: '#f8fafc' },
  role: { fontSize: 13, color: '#64748b', marginTop: 2 },
  logoutBtn: { backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#f87171', fontWeight: '600' },
  sectionTitle: { fontSize: 14, color: '#64748b', fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardText: { color: '#f8fafc', fontSize: 15, fontWeight: '500' },
  cardArrow: { color: '#3b82f6', fontSize: 22 },
});
