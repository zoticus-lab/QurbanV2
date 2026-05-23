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
  bgOpacity = 20,
  bgSize = 100,
  watermarkText = 'ASLI'
}) {
  const chunkedCoupons = [];
  for (let i = 0; i < coupons.length; i += 10) {
    chunkedCoupons.push(coupons.slice(i, i + 10));
  }

  return (
    <div className="space-y-8">
      {chunkedCoupons.map((page, pageIndex) => (
        <div
          key={pageIndex}
          className="bg-white p-6 rounded-lg coupon-page"
          style={{
            width: '210mm',
            height: '297mm',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            gap: '12px',
            pageBreakAfter: 'always',
          }}
        >
          {page.map((coupon, idx) => (
            <CouponCard
              key={idx}
              coupon={coupon}
              couponTitle={couponTitle}
              titleSize={titleSize}
              backgroundImage={backgroundImage}
              masjidName={masjidName}
              couponDate={couponDate}
              eventTime={eventTime}
              eventAddress={eventAddress}
              qrSize={qrSize}
              qrPosition={qrPosition}
              panitiaRt={panitiaRt}
              panitiaRw={panitiaRw}
              bgOpacity={bgOpacity}
              bgSize={bgSize}
              watermarkText={watermarkText}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CouponCard({ coupon, backgroundImage, couponTitle, titleSize, masjidName, couponDate, eventTime, eventAddress, qrSize, qrPosition, panitiaRt, panitiaRw, bgOpacity, bgSize, watermarkText }) {
  return (
    <div
      className="border-2 border-gray-400 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden bg-white"
      style={{
        minHeight: '140px',
      }}
    >
      {/* Watermark Text Layer */}
      {watermarkText && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-10 select-none">
          <span className="text-6xl font-black text-gray-900 transform -rotate-45 whitespace-nowrap tracking-widest">
            {watermarkText}
          </span>
        </div>
      )}

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
    return <div style={{ width: size, height: size }} className="bg-gray-200 rounded animate-pulse"></div>;
  }

  return <img src={qrImage} alt="QR Code" width={size} height={size} />;
}
