import { useEffect, useState } from 'react';

/** Buat object URL untuk Blob (mis. foto resep) dan cabut saat tak dipakai. */
export function useObjectUrl(blob?: Blob | null): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!blob) {
      setUrl(undefined);
      return;
    }
    const dibuat = URL.createObjectURL(blob);
    setUrl(dibuat);
    return () => URL.revokeObjectURL(dibuat);
  }, [blob]);

  return url;
}
