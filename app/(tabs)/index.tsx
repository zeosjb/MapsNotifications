import * as React from 'react';
import { StyleSheet, TextInput, FlatList, Button, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TabOneScreen() {
  const [walk, setWalk] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [walks, setWalks] = React.useState<string[]>([]);
  const [permissionGranted, setPermissionGranted] = React.useState(false);

  React.useEffect(() => {
    const requestPermissions = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        setPermissionGranted(finalStatus === 'granted');
      } else {
        alert('Notificaciones solo están disponibles en dispositivos físicos.');
      }
    };
    requestPermissions();
  }, []);

  const addWalk = async () => {
    if (!permissionGranted) {
      alert('Permiso de notificaciones no concedido. Por favor, habilítalo en la configuración.');
      return;
    }

    if (walk.trim() === '') return;
    setWalks([...walks, walk]);
    setWalk('');
    scheduleWalkNotification(date);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  const scheduleWalkNotification = async (value) => {
    const trigger = {
      type: 'date',
      date: new Date(value)
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Hora de tu paseo!",
          body: `Es hora de tu paseo: ${walk}`,
        },
        trigger
      });
    } catch (error) {
      alert('Error al programar la notificación. Asegúrate de que la hora es valida.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asignar Paseos</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese el nombre del paseo"
        value={walk}
        onChangeText={setWalk}
      />
      <Pressable onPress={() => setShowDatePicker(true)} style={styles.button}>
        <Text style={styles.dateText}>
          {`Hora seleccionada: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        </Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePickerAndroid
          value={date}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeDate}
        />
      )}
      <Button title="Agregar Paseo" onPress={addWalk} />
      <FlatList
        data={walks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.walk}>{index + 1}. {item}</Text>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dateButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
  },
  button: {
    marginBottom: 20,
  },
  list: {
    marginTop: 10,
  },
  walk: {
    paddingVertical: 8,
    fontSize: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
});
