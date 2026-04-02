import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFotos, FotoSeleccionada } from '../../hooks/useFotos';

interface Props {
  label?: string;
  maxFotos?: number;
  onChange: (fotos: FotoSeleccionada[]) => void;
}

export const FotoSelector: React.FC<Props> = ({ label = 'Fotos', maxFotos = 5, onChange }) => {
  const { fotos, tomarFoto, seleccionarDeBiblioteca, eliminarFoto } = useFotos(maxFotos);

  const handleTomarFoto = async () => {
    await tomarFoto();
    onChange(fotos);
  };

  const handleSeleccionar = async () => {
    await seleccionarDeBiblioteca();
    onChange(fotos);
  };

  const handleEliminar = (uri: string) => {
    Alert.alert('Eliminar foto', '¿Querés quitar esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { eliminarFoto(uri); onChange(fotos.filter((f) => f.uri !== uri)); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} ({fotos.length}/{maxFotos})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fotosScroll}>
        {fotos.map((f) => (
          <TouchableOpacity key={f.uri} onLongPress={() => handleEliminar(f.uri)} style={styles.fotoWrap}>
            <Image source={{ uri: f.uri }} style={styles.foto} />
            <TouchableOpacity style={styles.fotoDelete} onPress={() => handleEliminar(f.uri)}>
              <Text style={styles.fotoDeleteText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {fotos.length < maxFotos && (
          <TouchableOpacity style={styles.addBtn} onPress={handleTomarFoto}>
            <Text style={styles.addIcon}>📷</Text>
            <Text style={styles.addText}>Cámara</Text>
          </TouchableOpacity>
        )}
        {fotos.length < maxFotos && (
          <TouchableOpacity style={styles.addBtn} onPress={handleSeleccionar}>
            <Text style={styles.addIcon}>🖼️</Text>
            <Text style={styles.addText}>Galería</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  fotosScroll: { flexDirection: 'row' },
  fotoWrap: { marginRight: 8, position: 'relative' },
  foto: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#1e293b' },
  fotoDelete: { position: 'absolute', top: -6, right: -6, backgroundColor: '#ef4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  fotoDeleteText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  addBtn: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginRight: 8, gap: 4 },
  addIcon: { fontSize: 22 },
  addText: { fontSize: 10, color: '#64748b' },
});
