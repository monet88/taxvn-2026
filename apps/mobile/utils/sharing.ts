import * as Linking from 'expo-linking';
import { Share } from 'react-native';

export interface SharePayload {
  slug: string;
  values: Record<string, string | undefined>;
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

// Simple JS btoa
function btoa(input: string = '')  {
  let str = input;
  let output = '';
  for (let block = 0, charCode, i = 0, map = chars;
  str.charAt(i | 0) || (map = '=', i % 1);
  output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3/4);
    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    block = block << 8 | charCode;
  }
  return output;
}

// Simple JS atob
function atob(input: string = '') {
  let str = input.replace(/=+$/, '');
  let output = '';
  if (str.length % 4 == 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (let bc = 0, bs = 0, buffer, i = 0;
    buffer = str.charAt(i++);
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

function utf8_to_b64(str: string) {
  return btoa(encodeURIComponent(str));
}

function b64_to_utf8(str: string) {
  return decodeURIComponent(atob(str));
}

export function generateShareToken(payload: SharePayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    return utf8_to_b64(jsonStr);
  } catch (e) {
    console.error('generateShareToken error', e);
    return '';
  }
}

export function parseShareToken(token: string): SharePayload | null {
  try {
    const jsonStr = b64_to_utf8(token);
    return JSON.parse(jsonStr) as SharePayload;
  } catch (e) {
    console.error('parseShareToken error', e);
    return null;
  }
}

export async function shareToolState(slug: string, values: Record<string, string | undefined>, title: string) {
  const token = generateShareToken({ slug, values });
  if (!token) return;

  const url = Linking.createURL(`share/${token}`, { scheme: 'taxvn' });

  try {
    await Share.share({
      message: `Xem kết quả ${title} trên TaxVN: ${url}`,
      url: url, // iOS only
    });
  } catch (error) {
    console.error('Error sharing', error);
  }
}
