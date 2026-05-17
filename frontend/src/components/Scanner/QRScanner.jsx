import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess }) {
  const qrReaderRef = useRef(null);
  const html5QrcodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [loadingCameras, setLoadingCameras] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  // Get list of available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices);
        if (devices.length > 0) {
          setSelectedCamera(devices[0].id);
        }
        setLoadingCameras(false);
      } catch (err) {
        console.error('Error getting cameras:', err);
        if (err.name === 'NotAllowedError' || String(err).includes('Permission denied') || String(err).includes('NotAllowedError')) {
          setPermissionError(true);
        }
        setLoadingCameras(false);
      }
    };

    getCameras();
  }, []);

  // Initialize scanner when camera is selected
  useEffect(() => {
    if (!selectedCamera || !qrReaderRef.current) return;

    const initScanner = async () => {
      try {
        // Stop existing scanner if any
        if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }

        const html5QrCode = new Html5Qrcode('qr-reader');
        html5QrcodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        };

        await html5QrCode.start(
          { deviceId: { exact: selectedCamera } },
          config,
          (decodedText) => {
            console.log('QR Code scanned:', decodedText);
            setIsScanning(false);
            onScanSuccess(decodedText);
            
            // Stop scanner after successful scan
            if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
              html5QrcodeRef.current.stop().catch(() => {});
            }
          },
          (error) => {
            // Silent error handling for decode errors
          }
        );
        
        setIsScanning(true);
      } catch (err) {
        console.error('Error starting QR scanner:', err);
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      const stopScanner = async () => {
        if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
          try {
            await html5QrcodeRef.current.stop();
          } catch (err) {
            console.warn('Error stopping scanner:', err);
          }
        }
      };
      
      stopScanner();
    };
  }, [selectedCamera, onScanSuccess]);

  return (
    <div className="space-y-4">
      {/* Camera Selection */}
      {!loadingCameras && cameras.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎥 Pilih Kamera
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id.slice(0, 5)}`}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Total kamera tersedia: {cameras.length}
          </p>
        </div>
      )}

      {loadingCameras && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">⏳ Mencari kamera...</p>
        </div>
      )}

      {permissionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-700">❌ Akses Kamera Ditolak</p>
          <p className="text-xs text-red-600 mt-2">
            Browser memblokir akses ke kamera Anda. Silakan periksa hal berikut:
          </p>
          <ul className="text-xs text-red-600 mt-1 list-disc list-inside pl-4">
            <li>Pastikan Anda menekan <b>Izinkan (Allow)</b> saat browser meminta akses kamera.</li>
            <li>Pastikan Anda mengakses web ini menggunakan <b>HTTPS</b> (jika diakses dari HP).</li>
            <li>Cek pengaturan situs di browser HP Anda lalu ubah izin Kamera menjadi Allow/Izinkan.</li>
          </ul>
        </div>
      )}

      {!loadingCameras && cameras.length === 0 && !permissionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">❌ Tidak ada kamera yang ditemukan</p>
          <p className="text-xs text-red-600 mt-2">
            Pastikan device memiliki kamera dan izin akses sudah diberikan
          </p>
        </div>
      )}

      {/* QR Reader */}
      <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
        <div
          id="qr-reader"
          ref={qrReaderRef}
          style={{
            width: '100%',
            maxWidth: '100%',
          }}
        ></div>
        {!isScanning && selectedCamera && (
          <p className="text-center text-sm text-red-500 mt-4">
            ⚠️ Kamera tidak aktif atau izin ditolak. Cek pengaturan browser.
          </p>
        )}
        {isScanning && selectedCamera && (
          <p className="text-center text-sm text-green-600 mt-4">
            ✅ Kamera aktif - Posisikan QR code di tengah-tengah layar
          </p>
        )}
      </div>
    </div>
  );
}
