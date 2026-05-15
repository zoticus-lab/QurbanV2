import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess }) {
  const qrReaderRef = useRef(null);
  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    if (!qrReaderRef.current) return;

    const html5QrCode = new Html5Qrcode('qr-reader');
    html5QrcodeRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    html5QrCode
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          console.log('QR Code scanned:', decodedText);
          onScanSuccess(decodedText);
          // Stop scanning after successful scan
          html5QrCode.stop();
        },
        (error) => {
          // Silent error handling
        }
      )
      .catch((err) => {
        console.error('Error starting QR scanner:', err);
      });

    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(() => {});
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
      <div
        id="qr-reader"
        ref={qrReaderRef}
        style={{
          width: '100%',
          maxWidth: '100%',
        }}
      ></div>
      <p className="text-center text-sm text-gray-500 mt-4">
        Posisikan QR code di tengah-tengah layar
      </p>
    </div>
  );
}
