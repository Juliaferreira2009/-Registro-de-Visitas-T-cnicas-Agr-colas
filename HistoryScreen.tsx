import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const VISITS_STORAGE_KEY = '@registro_visitas';

type Props = {
  onBack: () => void;
};

export default function HistoryScreen({
  onBack,
}: Props) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVisits = async () => {
    try {
      const storedVisits =
        await AsyncStorage.getItem(
          VISITS_STORAGE_KEY
        );

      if (!storedVisits) {
        setVisits([]);
        return;
      }

      const parsedVisits = JSON.parse(
        storedVisits
      );

      if (Array.isArray(parsedVisits)) {
        setVisits(parsedVisits);
      } else {
        setVisits([]);
      }
    } catch (error) {
      console.error(
        'Erro ao carregar histórico:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível carregar o histórico de visitas.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}min ${remainingSeconds}s`;
  };

  const getGpsColor = (precision: number) => {
    if (precision < 10) {
      return '#2E9B62';
    }

    if (precision <= 30) {
      return '#D6A82F';
    }

    return '#D94A4A';
  };

  const renderVisit = ({
    item,
  }: {
    item: Visit;
  }) => {
    return (
      <View style={styles.visitCard}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.contactName.charAt(0)}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.name}>
              {item.contactName}
            </Text>

            <Text style={styles.farm}>
              {item.farm}
            </Text>

            <Text style={styles.city}>
              {item.city}
            </Text>
          </View>

          <View style={styles.visitNumber}>
            <Text style={styles.visitNumberText}>
              #{item.id.slice(-4)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              DATA
            </Text>

            <Text style={styles.infoValue}>
              {formatDate(item.finishedAt)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              HORÁRIO
            </Text>

            <Text style={styles.infoValue}>
              {formatTime(item.finishedAt)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              DURAÇÃO
            </Text>

            <Text style={styles.infoValue}>
              {formatDuration(
                item.durationSeconds
              )}
            </Text>
          </View>
        </View>

        <View style={styles.locationBox}>
          <View
            style={[
              styles.gpsDot,
              {
                backgroundColor:
                  getGpsColor(item.accuracy),
              },
            ]}
          />

          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>
              Localização registrada
            </Text>

            <Text style={styles.locationText}>
              {item.latitude.toFixed(6)},{' '}
              {item.longitude.toFixed(6)}
            </Text>
          </View>

          <Text style={styles.accuracy}>
            ±{item.accuracy.toFixed(1)} m
          </Text>
        </View>

        {item.photoUri ? (
          <View style={styles.photoContainer}>
            <Text style={styles.photoLabel}>
              FOTO DA VISITA
            </Text>

            <Image
              source={{ uri: item.photoUri }}
              style={styles.visitPhoto}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View style={styles.noPhotoContainer}>
            <Text style={styles.noPhotoText}>
              Nenhuma foto registrada
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator
            size="large"
            color="#1B6B45"
          />

          <Text style={styles.loadingText}>
            Carregando histórico...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>
            ← Voltar
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Histórico
        </Text>

        <Text style={styles.subtitle}>
          Visitas registradas neste dispositivo
        </Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Text style={styles.summaryIconText}>
            ✓
          </Text>
        </View>

        <View style={styles.summaryInfo}>
          <Text style={styles.summaryNumber}>
            {visits.length}
          </Text>

          <Text style={styles.summaryLabel}>
            {visits.length === 1
              ? 'visita registrada'
              : 'visitas registradas'}
          </Text>
        </View>
      </View>

      {visits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>
              ✓
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            Nenhuma visita ainda
          </Text>

          <Text style={styles.emptyText}>
            As visitas finalizadas aparecerão
            aqui automaticamente.
          </Text>

          <TouchableOpacity
            style={styles.emptyButton}
            onPress={onBack}
          >
            <Text style={styles.emptyButtonText}>
              VOLTAR
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={renderVisit}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#1B6B45"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },

  back: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B6B45',
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17211B',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#68736C',
  },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#EAF3ED',
    borderRadius: 16,
    padding: 17,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1B6B45',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryIconText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },

  summaryInfo: {
    marginLeft: 13,
  },

  summaryNumber: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1B6B45',
  },

  summaryLabel: {
    marginTop: 1,
    fontSize: 13,
    color: '#536158',
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  visitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF3ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B6B45',
  },

  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17211B',
  },

  farm: {
    marginTop: 3,
    fontSize: 13,
    color: '#68736C',
  },

  city: {
    marginTop: 2,
    fontSize: 12,
    color: '#8A948D',
  },

  visitNumber: {
    backgroundColor: '#F5F7F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  visitNumberText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#68736C',
  },

  divider: {
    height: 1,
    backgroundColor: '#EDF0EE',
    marginVertical: 14,
  },

  infoGrid: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A948D',
    letterSpacing: 0.5,
  },

  infoValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#17211B',
  },

  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderRadius: 12,
    padding: 11,
  },

  gpsDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  locationInfo: {
    flex: 1,
    marginLeft: 9,
  },

  locationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#536158',
  },

  locationText: {
    marginTop: 2,
    fontSize: 10,
    color: '#8A948D',
  },

  accuracy: {
    fontSize: 11,
    fontWeight: '700',
    color: '#536158',
  },

  photoContainer: {
    marginTop: 14,
  },

  photoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A958E',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  visitPhoto: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#E8ECE9',
  },

  noPhotoContainer: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F7F6',
  },

  noPhotoText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8A958E',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B6B45',
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#17211B',
  },

  emptyText: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#68736C',
  },

  emptyButton: {
    marginTop: 22,
    backgroundColor: '#1B6B45',
    borderRadius: 13,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#68736C',
  },
});