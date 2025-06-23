import { StyleSheet } from 'react-native';
import * as React from 'react';
import * as Location from 'expo-location';
import { Text, View } from '@/components/Themed';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAPS_API_KEY } from '@env';

export default function TabTwoScreen() {
  const [origin, setOrigin] = React.useState({
    latitude: -23.678911,
    longitude: -70.409605,
  });

  const [destination, setDestination] = React.useState({
    latitude: -23.655471,
    longitude: -70.401115,
  });

  /**
   * Solicita permisos de ubicación y obtiene la ubicación actual del usuario.
   * Si el permiso es denegado, muestra una alerta.
   * Luego, actualiza el estado de `origin` con la ubicación obtenida.
   * Se puede añadir un botón para llamar a esta función y obtener la ubicación actual en cada momento, cada minuto, etc.
   */
  async function getLocationPermission() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Permiso de ubicación denegado. Por favor, habilítalo en la configuración.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    
    const current = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    }

    setOrigin(current);
  }

  // Simula el movimiento del usuario actualizando la ubicación cada minuto.
  function simulateUserMovement() {
    setOrigin((prevOrigin) => {
      const randomOffset = () => (Math.random() - 0.5) * 0.0005;

      return {
        latitude: prevOrigin.latitude + randomOffset(),
        longitude: prevOrigin.longitude + randomOffset(),
      };
    });
  }

  React.useEffect(() => {
    getLocationPermission();

    // Actualiza la ubicación cada minuto
    const interval = setInterval(() => {
      simulateUserMovement();
    }, 5000);

    // Limpia el intervalo al desmontar el componente para evitar fugas de memoria
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa Interactivo</Text>
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker 
          draggable
          coordinate={origin}
          image={require('@/assets/images/WalkerAsset.png')}
          title="Origen"
          onDrag={(direction) => {
            setOrigin(direction.nativeEvent.coordinate);
          }}
        />
        <Marker 
          draggable
          coordinate={destination}
          image={require('@/assets/images/DogAsset.png')}
          title="Destino"
          onDrag={(direction) => {
            setDestination(direction.nativeEvent.coordinate);
          }}
        />
        <MapViewDirections 
          origin={origin} 
          destination={destination} 
          apikey={GOOGLE_MAPS_API_KEY}
          strokeColor='#000'
          strokeWidth={5}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  map: {
    marginTop: 20,
    width: '90%',
    height: '80%',
  },
});
