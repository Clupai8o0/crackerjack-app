import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

export async function uploadKycFile(
  userId: string,
  docType: 'id_front' | 'id_back' | 'selfie',
  fileUri: string,
): Promise<{ path: string }> {
  const ext = fileUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${docType}.${ext}`;
  const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
  const { error } = await supabase.storage.from('artist-kyc').upload(path, decode(base64), {
    upsert: true,
    contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  });
  if (error) throw error;
  return { path };
}
