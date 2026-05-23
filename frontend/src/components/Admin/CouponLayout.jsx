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
  bgSize = 100
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
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CouponCard({ coupon, backgroundImage, couponTitle, titleSize, masjidName, couponDate, eventTime, eventAddress, qrSize, qrPosition, panitiaRt, panitiaRw, bgOpacity, bgSize }) {
  return (
    <div
      className="border-2 border-gray-400 rounded-lg p-2.5 flex flex-col relative overflow-hidden bg-white"
      style={{
        minHeight: '138px',
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

      <div className="relative z-10 flex-1 w-full flex items-center justify-center gap-3 px-3 py-2">
        {/* Left: main info (aligned left, vertically centered) */}
        <div className="flex-1 min-w-0 text-left leading-tight pr-1">
          <div className="uppercase truncate" style={{ fontSize: `${Math.min(titleSize, 24)}px`, fontWeight: 900, color: '#000', lineHeight: 1 }}>{couponTitle}</div>
          <div className="mt-1 truncate" style={{ fontSize: '12px', fontWeight: 800, color: '#000', lineHeight: 1.1 }}>{masjidName}</div>
          <div className="mt-1" style={{ fontSize: '11px', fontWeight: 800, color: '#000', lineHeight: 1.1 }}>RW {panitiaRw} | RT {panitiaRt}</div>
          <div className="mt-1 truncate" style={{ fontSize: '9.5px', color: '#000', lineHeight: 1.1 }}>{couponDate} • {eventTime}</div>
          <div className="mt-1 truncate" style={{ fontSize: '9.5px', color: '#000', lineHeight: 1.1 }}>{eventAddress}</div>
        </div>

        {/* Right: QR / barcode */}
        <div className="flex-shrink-0 flex items-center justify-center ml-1" style={{ width: qrSize + 14 }}>
          <QRCodeComponent qrSecret={coupon.qr_secret} size={qrSize} />
        </div>
      </div>

      {/* Nomor Urut / Serial ID di Ujung Kanan Bawah */}
      <div className="absolute bottom-2 right-2 font-mono text-[10px] text-black font-extrabold z-20 px-2 py-0.5 bg-white/95 border border-gray-300 rounded-md shadow-sm tracking-wide">
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
