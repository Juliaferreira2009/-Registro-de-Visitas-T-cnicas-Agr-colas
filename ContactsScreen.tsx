import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  countContacts,
  initializeDatabase,
  searchContacts,
} from './database/database';

type Contact = {
  id: number;
  name: string;
  farm: string;
  city: string;
};

type Props = {
  onSelectContact: (contact: Contact) => void;
};

const PAGE_SIZE = 25;

export default function ContactsScreen({
  onSelectContact,
}: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [totalContacts, setTotalContacts] = useState(0);
  const [offset, setOffset] = useState(0);

  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = useCallback(
    async (
      currentSearch: string,
      currentOffset: number,
      append: boolean
    ) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [results, total] = await Promise.all([
          searchContacts(
            currentSearch,
            PAGE_SIZE,
            currentOffset
          ),
          countContacts(currentSearch),
        ]);

        const typedResults = results as Contact[];

        setContacts((currentContacts) =>
          append
            ? [...currentContacts, ...typedResults]
            : typedResults
        );

        setTotalContacts(total);
        setOffset(currentOffset);
      } catch (error) {
        console.error(
          'Erro ao carregar contatos:',
          error
        );

        setError(
          'Não foi possível carregar os produtores. Tente novamente.'
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const initialize = useCallback(async () => {
    try {
      setInitializing(true);
      setError(null);

      await initializeDatabase();

      await loadContacts('', 0, false);
    } catch (error) {
      console.error(
        'Erro ao inicializar banco de dados:',
        error
      );

      setError(
        'Não foi possível preparar o banco de dados.'
      );
    } finally {
      setInitializing(false);
    }
  }, [loadContacts]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSearch = async (text: string) => {
    setSearch(text);

    await loadContacts(text, 0, false);
  };

  const loadMore = async () => {
    if (
      loading ||
      loadingMore ||
      contacts.length >= totalContacts
    ) {
      return;
    }

    const nextOffset = offset + PAGE_SIZE;

    await loadContacts(
      search,
      nextOffset,
      true
    );
  };

  const renderContact = ({
    item,
  }: {
    item: Contact;
  }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onSelectContact(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0)}
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.farm}>
            {item.farm}
          </Text>

          <Text style={styles.city}>
            {item.city}
          </Text>
        </View>

        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    );
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator
            size="large"
            color="#1B6B45"
          />

          <Text style={styles.loadingTitle}>
            Preparando produtores
          </Text>

          <Text style={styles.loadingText}>
            Organizando o banco de dados local...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Selecionar produtor
        </Text>

        <Text style={styles.subtitle}>
          Escolha o produtor para iniciar uma visita
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
          placeholder="Buscar produtor..."
          placeholderTextColor="#8A948D"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultText}>
          {totalContacts.toLocaleString('pt-BR')}{' '}
          {totalContacts === 1
            ? 'produtor'
            : 'produtores'}
        </Text>

        {search.trim().length > 0 && (
          <Text style={styles.searchResult}>
            Busca: "{search}"
          </Text>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            Algo deu errado
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.8}
            onPress={() =>
              loadContacts(search, 0, false)
            }
          >
            <Text style={styles.retryButtonText}>
              TENTAR NOVAMENTE
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderContact}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          windowSize={7}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator
                  size="small"
                  color="#1B6B45"
                />

                <Text style={styles.emptyText}>
                  Buscando produtores...
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                  Nenhum produtor encontrado
                </Text>

                <Text style={styles.emptyText}>
                  Tente buscar por outro nome.
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator
                  size="small"
                  color="#1B6B45"
                />

                <Text style={styles.footerText}>
                  Carregando mais produtores...
                </Text>
              </View>
            ) : contacts.length > 0 &&
              contacts.length >= totalContacts ? (
              <View style={styles.footer}>
                <Text style={styles.endText}>
                  Todos os produtores foram carregados
                </Text>
              </View>
            ) : null
          }
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
    paddingBottom: 16,
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#17211B',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#68736C',
  },

  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  searchInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E0DB',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#17211B',
  },

  resultHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  resultText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#68736C',
  },

  searchResult: {
    marginTop: 3,
    fontSize: 12,
    color: '#1B6B45',
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
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

  contactInfo: {
    flex: 1,
    marginLeft: 13,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17211B',
  },

  farm: {
    marginTop: 4,
    fontSize: 13,
    color: '#536158',
  },

  city: {
    marginTop: 2,
    fontSize: 12,
    color: '#8A948D',
  },

  arrow: {
    fontSize: 22,
    color: '#1B6B45',
    marginLeft: 8,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#17211B',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#68736C',
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  footerText: {
    marginTop: 7,
    fontSize: 13,
    color: '#68736C',
  },

  endText: {
    fontSize: 12,
    color: '#8A948D',
  },

  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#17211B',
  },

  loadingText: {
    marginTop: 6,
    fontSize: 14,
    color: '#68736C',
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17211B',
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#68736C',
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: '#1B6B45',
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});