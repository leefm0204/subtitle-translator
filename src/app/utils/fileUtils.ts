import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';

export const downloadFile = async (
  content: string,
  fileName: string,
  mimeType = 'text/plain;charset=utf-8'
): Promise<string> => {
  if (typeof window === 'undefined') return fileName;

  try {
    if (!window.Capacitor || Capacitor.getPlatform() === 'web') {
      // Web branch
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return fileName;
    } else {
      // Native branch
      const filePath = `Download/${fileName}`;
      await Filesystem.writeFile({
        path: filePath,
        data: content,
        encoding: Encoding.UTF8,
        directory: Directory.ExternalStorage, // direct usage
      });

      await Toast.show({ text: `Saved to ${filePath}`, duration: 'long' });
      return filePath;
    }
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Download failed:', error);
    }
    await Toast.show({ text: `Download failed: ${error.message}`, duration: 'long' });
    throw error;
  }
};
