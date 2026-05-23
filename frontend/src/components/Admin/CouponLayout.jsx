import React from 'react';
import QRCode from 'qrcode';

export default function CouponLayout({ 
  coupons, 
  backgroundImage,
  couponTitle = 'KUPON KURBAN',
  titleSize = 24,
  masjidName = 'Masjid An-Nur',
  couponDate = new Date().toLocaleDateString('id-ID'),
  eventTime = '08:00 - Selesai',
  eventAddress = 'Halaman Masjid An-Nur',
  qrSize = 60,
  qrPosition = 'top',
  panitiaRt = '07',
  panitiaRw = '04',
      <div className="relative z-10 w-full flex items-center gap-3 px-2">
        {/* Left: main info (aligned left, vertically centered) */}
        <div className="flex-1 text-left">
          <div className="uppercase" style={{ fontSize: `${Math.min(titleSize, 26)}px`, fontWeight: 900, color: '#000' }}>{couponTitle}</div>
          <div className="mt-1" style={{ fontSize: '12px', fontWeight: 800, color: '#000' }}>{masjidName}</div>
          <div className="mt-1" style={{ fontSize: '11px', fontWeight: 800, color: '#000' }}>RW {panitiaRw} | RT {panitiaRt}</div>
          <div className="mt-1" style={{ fontSize: '10px', color: '#000' }}>{couponDate} • {eventTime}</div>
          <div className="mt-1 break-words" style={{ fontSize: '10px', color: '#000' }}>{eventAddress}</div>
        </div>

        {/* Right: QR / barcode */}
        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: qrSize + 20 }}>
          <QRCodeComponent qrSecret={coupon.qr_secret} size={qrSize} />
        </div>
      </div>
    <div
      className="border border-gray-400 rounded-md p-2 flex flex-col items-center justify-between text-center relative overflow-hidden bg-white"
      style={{
        minHeight: '0',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Image Layer */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: `${bgSize}%`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: bgOpacity / 100
          }}
        ></div>
      )}

<<<<<<< HEAD
      <div className="relative z-10 w-full flex flex-col items-center gap-1.5">
        {/* Render QR di Atas (jika dipilih) */}
        {qrPosition === 'top' && (
          <div className="mt-0.5">
            <QRCodeComponent qrSecret={coupon.qr_secret} size={qrSize} />
          </div>
        )}

        {/* Judul Kupon */}
        <div 
          className="font-black text-gray-900 leading-none tracking-tight text-center px-1 w-full uppercase break-words"
          style={{ fontSize: `${Math.min(titleSize, 22)}px`, wordBreak: 'break-word' }}
        >
          {couponTitle}
        </div>

        {/* Render QR di Bawah (jika dipilih) */}
        {qrPosition === 'bottom' && (
          <div className="my-0.5">
            <QRCodeComponent qrSecret={coupon.qr_secret} size={qrSize} />
          </div>
        )}

        {/* Detail Info */}
        <div className="text-center w-full mt-0.5 space-y-0.5">
          <div className="font-bold text-gray-900 text-[10px] leading-tight px-1 break-words whitespace-normal">{masjidName}</div>
          <div className="text-[9px] text-gray-800 font-medium leading-tight">
            RW {panitiaRw} | RT {panitiaRt}
          </div>
          <div className="text-[8px] text-gray-600 leading-tight">
            {couponDate} • {eventTime}
          </div>
          <div className="text-[8px] text-gray-600 leading-tight px-1 break-words whitespace-normal">
            {eventAddress}
          </div>
=======
      <div className="relative z-10 w-full flex items-center gap-3 px-2">
        {/* Left: main info (aligned left, vertically centered) */}
        <div className="flex-1 text-left">
          <div className="uppercase" style={{ fontSize: `${titleSize}px`, fontWeight: 900, color: '#000' }}>{couponTitle}</div>
          <div className="mt-1" style={{ fontSize: '12px', fontWeight: 800, color: '#000' }}>{masjidName}</div>
          <div className="mt-1" style={{ fontSize: '11px', fontWeight: 800, color: '#000' }}>RW {panitiaRw} | RT {panitiaRt}</div>
          <div className="mt-1" style={{ fontSize: '10px', color: '#000' }}>{couponDate} • {eventTime}</div>
          <div className="mt-1 truncate" style={{ fontSize: '10px', color: '#000' }}>{eventAddress}</div>
        </div>

        {/* Right: QR / barcode */}
        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: qrSize + 20 }}>
          <QRCodeComponent qrSecret={coupon.qr_secret} size={qrSize} />
>>>>>>> 723aceb (feat: ID-card style coupon layout; emphasize text and serial badge)
        </div>
      </div>

      {/* Nomor Urut / Serial ID di Ujung Kanan Bawah */}
  <div className="absolute bottom-2 right-2 font-mono text-[11px] text-black font-extrabold z-20 px-2 py-1 bg-white/95 border border-gray-300 rounded-md shadow-sm">
    {coupon.no_urut}-{panitiaRw}-{panitiaRt}-{new Date().getFullYear()}-{masjidName.replace(/\s+/g, '_').toUpperCase()}
  </div>
    </div>
  );
}

function QRCodeComponent({ qrSecret, size }) {
  const [qrImage, setQrImage] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (qrSecret) {
      try {
        // Use qrcode library's toDataURL method for browser
        QRCode.toDataURL(qrSecret, {
          width: size,
          margin: 0,
          color: { 
            dark: '#000000', 
            light: '#ffffff' 
          },
          errorCorrectionLevel: 'H'
        }).then(dataUrl => {
          setQrImage(dataUrl);
          setLoading(false);
        }).catch(error => {
          console.error('Error generating QR code:', error);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
        setLoading(false);
      }
    }
  }, [qrSecret, size]);

  if (loading || !qrImage) {
    return <div className="w-20 h-20 bg-gray-200 rounded animate-pulse"></div>;
  }

  return <img src={qrImage} alt="QR Code" width={size} height={size} />;
}
