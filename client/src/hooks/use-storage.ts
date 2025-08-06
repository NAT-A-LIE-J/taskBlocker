import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { AppData } from '@shared/schema';

export function useStorage() {
  const [data, setData] = useState<AppData>(storage.getAllData());

  const refreshData = () => {
    setData(storage.getAllData());
  };

  useEffect(() => {
    // Set up periodic backups (weekly)
    const backupInterval = setInterval(() => {
      storage.createBackup();
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    return () => clearInterval(backupInterval);
  }, []);

  return {
    data,
    refreshData,
    storage,
  };
}
