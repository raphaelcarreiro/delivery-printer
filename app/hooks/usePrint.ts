import { remote } from 'electron';
import { useCallback } from 'react';

interface UsePrintProps {
  print(deviceName?: string): Promise<boolean>;
}

export function usePrint(): UsePrintProps {
  const print = useCallback((deviceName?: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const [win] = remote.BrowserWindow.getAllWindows();

      if (!win) {
        reject(Error('Browser window not found'));
      }

      win?.webContents.print(
        {
          deviceName,
          color: false,
          collate: false,
          copies: 1,
          silent: true,
          margins: {
            marginType: 'none',
          },
        },
        (success, reason) => {
          if (success) {
            resolve(true);
            return;
          }

          reject(reason);
        },
      );
    });
  }, []);

  return {
    print,
  };
}
