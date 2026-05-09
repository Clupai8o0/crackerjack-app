import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { useUploadKycDocument } from '@/features/artist/mutations';
import type { KycDocType } from '@/features/artist/schema';
import { DEMO_MODE } from '@/lib/demo';
import { T } from '@/lib/theme';

type UploadStatus = 'idle' | 'uploading' | 'done';

type DocState = {
  uri: string | null;
  status: UploadStatus;
  error: string | null;
};

const INITIAL_DOC: DocState = { uri: null, status: 'idle', error: null };

export default function ArtistId() {
  const router = useRouter();
  const uploadKyc = useUploadKycDocument();

  const [idFront, setIdFront] = useState<DocState>(INITIAL_DOC);
  const [idBack, setIdBack] = useState<DocState>(INITIAL_DOC);
  const [selfie, setSelfie] = useState<DocState>(INITIAL_DOC);

  function getSetterFor(docType: KycDocType) {
    if (docType === 'id_front') return setIdFront;
    if (docType === 'id_back') return setIdBack;
    return setSelfie;
  }

  async function pickAndUpload(docType: KycDocType) {
    const setter = getSetterFor(docType);
    setter((s) => ({ ...s, error: null }));

    let result: ImagePicker.ImagePickerResult;

    if (docType === 'selfie') {
      result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      });
    }

    if (result.canceled || !result.assets?.[0]) return;

    const fileUri = result.assets[0].uri;
    setter((s) => ({ ...s, uri: fileUri, status: 'uploading' }));

    if (DEMO_MODE) {
      setter((s) => ({ ...s, status: 'done' }));
      return;
    }

    try {
      await uploadKyc.mutateAsync({ docType, fileUri });
      setter((s) => ({ ...s, status: 'done' }));
    } catch {
      setter((s) => ({ ...s, status: 'idle', error: 'Upload failed. Tap to retry.' }));
    }
  }

  const allDone = idFront.status === 'done' && idBack.status === 'done' && selfie.status === 'done';
  const continueDisabled = DEMO_MODE ? false : !allDone;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: T.sp7, paddingBottom: T.sp9 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: T.sp6, gap: T.sp8 }}>
          <View style={{ gap: T.sp2 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Text variant="display-m">Photo </Text>
              <Text variant="display-italic-m">ID</Text>
            </View>
            <Text variant="body" color={T.ink2}>
              We need a clear photo of a government ID and a quick selfie. Stays private — only
              admins see this.
            </Text>
          </View>

          <View style={{ gap: T.sp4 }}>
            <UploadTile
              label="ID Front"
              docState={idFront}
              onPress={() => pickAndUpload('id_front')}
            />
            <UploadTile
              label="ID Back"
              docState={idBack}
              onPress={() => pickAndUpload('id_back')}
            />
            <UploadTile
              label="Selfie with ID"
              docState={selfie}
              onPress={() => pickAndUpload('selfie')}
            />
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: T.sp7, paddingBottom: T.sp9 }}>
        <Button
          label="Continue"
          disabled={continueDisabled}
          onPress={() => router.push('/(auth)/setup/artist/bank')}
        />
      </View>
    </SafeAreaView>
  );
}

function UploadTile({
  label,
  docState,
  onPress,
}: {
  label: string;
  docState: DocState;
  onPress: () => void;
}) {
  const isDone = docState.status === 'done';
  const isUploading = docState.status === 'uploading';

  return (
    <Pressable
      onPress={onPress}
      disabled={isUploading}
      style={{
        height: 100,
        borderRadius: T.rPill,
        borderWidth: 1.5,
        borderColor: isDone ? T.accentSoftBorder : T.line,
        borderStyle: isDone ? 'solid' : 'dashed',
        backgroundColor: isDone ? T.accentSoftFill : T.surface,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isDone && docState.uri ? (
        <>
          <Image
            source={{ uri: docState.uri }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              paddingVertical: T.sp2,
              paddingHorizontal: T.sp4,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="caption" color={T.ink}>
              {label}
            </Text>
            <Text variant="caption" color={T.accent}>
              Replace
            </Text>
          </View>
        </>
      ) : isUploading ? (
        <View style={{ alignItems: 'center', gap: T.sp2 }}>
          <ActivityIndicator color={T.accent} size="small" />
          <Text variant="caption" color={T.ink3}>
            Uploading…
          </Text>
        </View>
      ) : (
        <View style={{ alignItems: 'center', gap: T.sp2 }}>
          <Text variant="body-strong" color={T.ink3}>
            Tap to upload {label}
          </Text>
          {docState.error && (
            <Text variant="caption" color={T.accent}>
              {docState.error}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
