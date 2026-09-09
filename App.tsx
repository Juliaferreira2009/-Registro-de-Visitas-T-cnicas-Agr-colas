import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ContactsScreen from './ContactsScreen';
import VisitScreen from './VisitScreen';
import HistoryScreen from './HistoryScreen';

type Contact = {
  id: number;
  name: string;
  farm: string;
  city: string;
};

type Screen =
  | 'home'
  | 'contacts'
  | 'visit'
  | 'history';

const VISITS_STORAGE_KEY = '@registro_visitas';

export default function App() {
  const [screen, setScreen] =
    useState<Screen>('home');

  const [selectedContact, setSelectedContact] =
    useState<Contact | null>(null);

  const [visitCount, setVisitCount] =
    useState(0);

  const loadVisitCount = async () => {
    try {
      const storedVisits =
        await AsyncStorage.getItem(
          VISITS_STORAGE_KEY
        );

      if (!storedVisits) {
        setVisitCount(0);
        return;
      }

      const visits = JSON.parse(storedVisits);

      if (Array.isArray(visits)) {
        setVisitCount(visits.length);
      } else {
        setVisitCount(0);
      }
    } catch (error) {
      console.error(
        'Erro ao carregar quantidade de visitas:',
        error
      );

      setVisitCount(0);
    }
  };

  useEffect(() => {
    loadVisitCount();
  }, []);

  const handleSelectContact = (
    contact: Contact
  ) => {
    console.log(
      'Contato selecionado:',
      contact
    );

    setSelectedContact(contact);
    setScreen('visit');
  };

  const handleBackHome = async () => {
    await loadVisitCount();

    setSelectedContact(null);
    setScreen('home');
  };

  const handleBackToContacts = () => {
    setSelectedContact(null);
    setScreen('contacts');
  };

  if (screen === 'contacts') {
    return (
      <View style={styles.fullScreen}>
        <ContactsScreen
          onSelectContact={handleSelectContact}
        />

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={handleBackHome}
        >
          <Text style={styles.backButtonText}>
            ← Voltar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'visit') {
    if (!selectedContact) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>
              Nenhum contato selecionado
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                setScreen('contacts')
              }
              activeOpacity={0.8}
            >
              <Text
                style={styles.primaryButtonText}
              >
                VOLTAR PARA CONTATOS
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <VisitScreen
        contact={selectedContact}
        onBack={handleBackHome}
      />
    );
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        onBack={handleBackHome}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>
          Registro de Visitas
        </Text>

        <Text style={styles.subtitle}>
          Gestão de visitas técnicas agrícolas
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              5.248
            </Text>

            <Text style={styles.statLabel}>
              Contatos
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {visitCount}
            </Text>

            <Text style={styles.statLabel}>
              Visitas
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() =>
            setScreen('contacts')
          }
        >
          <Text style={styles.primaryButtonText}>
            + NOVA VISITA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() =>
            setScreen('history')
          }
        >
          <Text
            style={styles.secondaryButtonText}
          >
            HISTÓRICO DE VISITAS
          </Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Sistema operacional
          </Text>

          <Text style={styles.infoText}>
            GPS, câmera e armazenamento local
            serão utilizados durante a visita
            técnica.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },

  fullScreen: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17211B',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#68736C',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '700',
    color: '#1B6B45',
  },

  statLabel: {
    marginTop: 4,
    fontSize: 14,
    color: '#68736C',
  },

  primaryButton: {
    backgroundColor: '#1B6B45',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E0DB',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#1B6B45',
    fontSize: 15,
    fontWeight: '700',
  },

  infoCard: {
    marginTop: 24,
    backgroundColor: '#EAF3ED',
    borderRadius: 16,
    padding: 18,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B6B45',
  },

  infoText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#536158',
  },

  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1B6B45',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});