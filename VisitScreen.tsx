import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CameraScreen from './CameraScreen';

type Contact = {
  id: number;
  name: string;
  farm: string;
  city: string;
};

type Visit = {
  id: string;
  contactId: number;
  contactName: string;
  farm: string;
  city: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  photoUri?: string;
};

type Props = {
  contact: Contact;
  onBack: () => void;
};

const VISITS_STORAGE_KEY = '@registro_visitas';

export default function VisitScreen({
  contact,
  onBack,
}: Props) {
  const [visitStarted, setVisitStarted] =
    useState(false);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [photoUri, setPhotoUri] =
    useState<string | null>(null);

  const [gpsStatus, setGpsStatus] = useState(
    'Aguardando início da visita'
  );

  const [accuracy, setAccuracy] =
    useState<number | null>(null);

  const [coordinates, setCoordinates] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  const [gpsColor, setGpsColor] =
    useState('#9AA39D');

  const [startedAt, setStartedAt] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const getGpsColor = (value: number) => {
    if (value < 10) {
      return '#2E9B62';
    }

    if (value <= 30) {
      return '#D6A82F';
    }

    return '#D94A4A';
  };

  const getPrecisionText = (
    value: number
  ) => {
    if (value < 10) {
      return 'Alta precisão';
    }

    if (value <= 30) {
      return 'Precisão moderada';
    }

    return 'Baixa precisão';
  };

  const handleStartVisit = async () => {
    try {
      setGpsStatus(
        'Obtendo localização...'
      );

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setGpsStatus('GPS indisponível');
        setGpsColor('#D94A4A');

        Alert.alert(
          'GPS indisponível',
          'Não foi possível acessar sua localização. Verifique as permissões do aplicativo e tente novamente.'
        );

        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const latitude =
        location.coords.latitude;

      const longitude =
        location.coords.longitude;

      const currentAccuracy =
        location.coords.accuracy ?? 999;

      setCoordinates({
        latitude,
        longitude,
      });

      setAccuracy(currentAccuracy);

      setGpsColor(
        getGpsColor(currentAccuracy)
      );

      setGpsStatus(
        getPrecisionText(currentAccuracy)
      );

      setStartedAt(
        new Date().toISOString()
      );

      setVisitStarted(true);
    } catch (error) {
      console.error(
        'Erro ao obter localização:',
        error
      );

      setGpsStatus('GPS indisponível');
      setGpsColor('#D94A4A');

      Alert.alert(
        'GPS indisponível',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.'
      );
    }
  };

  const handlePhotoTaken = (
    uri: string
  ) => {
    setPhotoUri(uri);
    setCameraOpen(false);

    Alert.alert(
      'Foto registrada',
      'A foto foi associada à visita.'
    );
  };

  const handleFinishVisit = async () => {
    if (
      !coordinates ||
      accuracy === null ||
      !startedAt
    ) {
      Alert.alert(
        'Dados incompletos',
        'Não foi possível finalizar a visita porque os dados de localização não estão disponíveis.'
      );

      return;
    }

    try {
      setSaving(true);

      const finishedAt = new Date();

      const startedDate =
        new Date(startedAt);

      const durationSeconds = Math.max(
        0,
        Math.floor(
          (finishedAt.getTime() -
            startedDate.getTime()) /
            1000
        )
      );

      const newVisit: Visit = {
        id: `${Date.now()}-${contact.id}`,
        contactId: contact.id,
        contactName: contact.name,
        farm: contact.farm,
        city: contact.city,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy,
        startedAt,
        finishedAt:
          finishedAt.toISOString(),
        durationSeconds,
        photoUri:
          photoUri ?? undefined,
      };

      const storedVisits =
        await AsyncStorage.getItem(
          VISITS_STORAGE_KEY
        );

      let visits: Visit[] = [];

      if (storedVisits) {
        try {
          const parsed =
            JSON.parse(storedVisits);

          if (Array.isArray(parsed)) {
            visits = parsed;
          }
        } catch {
          visits = [];
        }
      }

      visits.unshift(newVisit);

      await AsyncStorage.setItem(
        VISITS_STORAGE_KEY,
        JSON.stringify(visits)
      );

      Alert.alert(
        'Visita salva',
        photoUri
          ? 'A visita, localização e foto foram salvas com sucesso.'
          : 'A visita e a localização foram salvas com sucesso.',
        [
          {
            text: 'OK',
            onPress: onBack,
          },
        ]
      );
    } catch (error) {
      console.error(
        'Erro ao salvar visita:',
        error
      );

      Alert.alert(
        'Erro ao salvar',
        'Não foi possível salvar a visita. Tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (cameraOpen) {
    return (
      <CameraScreen
        onBack={() => setCameraOpen(false)}
        onPhotoTaken={handlePhotoTaken}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>
            ← Voltar
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Nova visita
        </Text>

        <Text style={styles.subtitle}>
          Registro de visita técnica
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.contactCard}>
          <Text style={styles.cardLabel}>
            PRODUTOR
          </Text>

          <Text style={styles.contactName}>
            {contact.name}
          </Text>

          <Text style={styles.contactInfo}>
            {contact.farm}
          </Text>

          <Text style={styles.contactInfo}>
            {contact.city}
          </Text>
        </View>

        <View style={styles.gpsCard}>
          <View style={styles.gpsHeader}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: gpsColor,
                },
              ]}
            />

            <View style={styles.gpsTexts}>
              <Text style={styles.gpsTitle}>
                Localização GPS
              </Text>

              <Text style={styles.gpsStatus}>
                {gpsStatus}
              </Text>
            </View>
          </View>

          {accuracy !== null && (
            <Text style={styles.accuracy}>
              Precisão: {accuracy.toFixed(1)} m
            </Text>
          )}
        </View>

        {coordinates && (
          <View style={styles.coordinatesCard}>
            <Text style={styles.cardLabel}>
              COORDENADAS
            </Text>

            <Text style={styles.coordinateText}>
              Latitude:{' '}
              {coordinates.latitude.toFixed(6)}
            </Text>

            <Text style={styles.coordinateText}>
              Longitude:{' '}
              {coordinates.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {visitStarted && (
          <View style={styles.visitCard}>
            <Text style={styles.visitCardTitle}>
              Visita em andamento
            </Text>

            <Text style={styles.visitCardText}>
              O registro da visita está ativo.
            </Text>
          </View>
        )}

        {visitStarted && (
          <TouchableOpacity
            style={[
              styles.cameraButton,
              photoUri
                ? styles.cameraButtonCompleted
                : null,
            ]}
            activeOpacity={0.8}
            onPress={() =>
              setCameraOpen(true)
            }
          >
            <Text style={styles.cameraIcon}>
              📷
            </Text>

            <View style={styles.cameraTexts}>
              <Text style={styles.cameraButtonTitle}>
                {photoUri
                  ? 'FOTO REGISTRADA'
                  : 'REGISTRAR FOTO'}
              </Text>

              <Text style={styles.cameraButtonSubtitle}>
                {photoUri
                  ? 'Foto associada à visita'
                  : 'Registrar evidência da visita técnica'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {!visitStarted ? (
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.8}
            onPress={handleStartVisit}
          >
            <Text style={styles.startButtonText}>
              INICIAR VISITA
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.finishButton}
            activeOpacity={0.8}
            onPress={handleFinishVisit}
            disabled={saving}
          >
            <Text style={styles.finishButtonText}>
              {saving
                ? 'SALVANDO...'
                : 'FINALIZAR VISITA'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 20,
  },

  backText: {
    color: '#1B6B45',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 15,
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#17211B',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#68736C',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },

  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A958E',
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  contactName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#17211B',
  },

  contactInfo: {
    marginTop: 4,
    fontSize: 14,
    color: '#68736C',
  },

  gpsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },

  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginRight: 11,
  },

  gpsTexts: {
    flex: 1,
  },

  gpsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17211B',
  },

  gpsStatus: {
    marginTop: 3,
    fontSize: 13,
    color: '#68736C',
  },

  accuracy: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#536158',
  },

  coordinatesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },

  coordinateText: {
    marginTop: 4,
    fontSize: 13,
    color: '#536158',
  },

  visitCard: {
    backgroundColor: '#EAF3ED',
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
  },

  visitCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B6B45',
  },

  visitCardText: {
    marginTop: 4,
    fontSize: 13,
    color: '#536158',
  },

  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9DED0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  cameraButtonCompleted: {
    borderColor: '#2E9B62',
    backgroundColor: '#F1F8F4',
  },

  cameraIcon: {
    fontSize: 27,
    marginRight: 13,
  },

  cameraTexts: {
    flex: 1,
  },

  cameraButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B6B45',
  },

  cameraButtonSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#68736C',
  },

  startButton: {
    backgroundColor: '#1B6B45',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  finishButton: {
    backgroundColor: '#1B6B45',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },

  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});