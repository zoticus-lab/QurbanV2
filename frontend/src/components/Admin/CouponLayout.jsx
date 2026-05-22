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
          className="bg-white coupon-page"
          style={{
            width: '210mm',
            height: '297mm',
            margin: '0 auto',
            padding: '8mm',
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(5, minmax(0, 1fr))',
            gap: '6px',
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
      className="border border-gray-400 rounded-md p-2 flex flex-col items-center justify-between text-center relative overflow-hidden bg-white"
      style={{
        minHeight: '0',
        height: '100%',
        boxSizing: 'border-box',
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
        </div>
      </div>

      {/* Nomor Urut / Serial ID di Ujung Kanan Bawah */}
      <div className="absolute bottom-1 right-1 font-mono text-[6px] text-gray-500 font-bold opacity-80 z-20 max-w-[70%] text-right break-all">
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
