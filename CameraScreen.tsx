import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

type Props = {
  onBack: () => void;
  onPhotoTaken: (uri: string) => void;
};

export default function CameraScreen({
  onBack,
  onPhotoTaken,
}: Props) {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [cameraError, setCameraError] =
    useState(false);

  const [takingPhoto, setTakingPhoto] =
    useState(false);

  const cameraRef =
    useRef<CameraView>(null);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>
            Verificando câmera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.icon}>
            📷
          </Text>

          <Text style={styles.title}>
            Câmera indisponível
          </Text>

          <Text style={styles.message}>
            Não foi possível acessar a câmera
            deste dispositivo. Verifique as
            permissões e tente novamente.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              PERMITIR CÂMERA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              ← VOLTAR
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (cameraError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.icon}>
            ⚠️
          </Text>

          <Text style={styles.title}>
            Câmera indisponível
          </Text>

          <Text style={styles.message}>
            Não foi possível acessar a câmera
            deste dispositivo. Verifique se ela
            está disponível e tente novamente.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              setCameraError(false)
            }
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              TENTAR NOVAMENTE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              ← VOLTAR
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleTakePhoto = async () => {
    if (
      !cameraRef.current ||
      takingPhoto
    ) {
      return;
    }

    try {
      setTakingPhoto(true);

      const photo =
        await cameraRef.current.takePictureAsync();

      if (photo?.uri) {
        onPhotoTaken(photo.uri);
      }
    } catch (error) {
      console.error(
        'Erro ao tirar foto:',
        error
      );

      setCameraError(true);
    } finally {
      setTakingPhoto(false);
    }
  };

  return (
    <SafeAreaView style={styles.cameraContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>
            ← Voltar
          </Text>
        </TouchableOpacity>

        <Text style={styles.cameraTitle}>
          Registro fotográfico
        </Text>

        <Text style={styles.cameraSubtitle}>
          Registre uma evidência da visita
          técnica
        </Text>
      </View>

      <View style={styles.previewContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onMountError={() =>
            setCameraError(true)
          }
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Câmera disponível
        </Text>

        <View style={styles.statusIndicator} />

        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleTakePhoto}
          disabled={takingPhoto}
          activeOpacity={0.8}
        >
          <View
            style={styles.captureInner}
          />
        </TouchableOpacity>

        <Text style={styles.captureText}>
          {takingPhoto
            ? 'REGISTRANDO...'
            : 'TOQUE PARA FOTOGRAFAR'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: '#111814',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  icon: {
    fontSize: 50,
    marginBottom: 20,
  },

  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#17211B',
    textAlign: 'center',
  },

  message: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#68736C',
    textAlign: 'center',
  },

  primaryButton: {
    width: '100%',
    marginTop: 25,
    backgroundColor: '#1B6B45',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryButton: {
    width: '100%',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E0DB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#1B6B45',
    fontSize: 14,
    fontWeight: '700',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },

  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },

  cameraSubtitle: {
    marginTop: 4,
    color: '#AEB9B2',
    fontSize: 13,
  },

  previewContainer: {
    flex: 1,
    marginHorizontal: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },

  camera: {
    flex: 1,
  },

  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },

  footerText: {
    color: '#D5DDD8',
    fontSize: 13,
    fontWeight: '600',
  },

  statusIndicator: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2E9B62',
    marginTop: 5,
  },

  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: '#1B6B45',
  },

  captureText: {
    marginTop: 8,
    color: '#D5DDD8',
    fontSize: 11,
    fontWeight: '700',
  },
});