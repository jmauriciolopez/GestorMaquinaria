import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AlquileresScreen } from '../screens/AlquileresScreen';
import { AlquilerDetailScreen } from '../screens/AlquilerDetailScreen';
import { CheckOutScreen } from '../screens/CheckOutScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { BuscarActivoScreen } from '../screens/BuscarActivoScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#1e293b' },
  headerTintColor: '#f8fafc',
  headerTitleStyle: { fontWeight: '700' as const },
};

export const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Operaciones', headerLeft: () => null }} />
            <Stack.Screen name="Alquileres" component={AlquileresScreen} options={{ title: 'Alquileres activos' }} />
            <Stack.Screen name="AlquilerDetail" component={AlquilerDetailScreen} options={{ title: 'Detalle de alquiler' }} />
            <Stack.Screen name="CheckOut" component={CheckOutScreen} options={{ title: 'Check-Out' }} />
            <Stack.Screen name="CheckIn" component={CheckInScreen} options={{ title: 'Check-In / Devolución' }} />
            <Stack.Screen name="BuscarActivo" component={BuscarActivoScreen} options={{ title: 'Buscar Activo' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
