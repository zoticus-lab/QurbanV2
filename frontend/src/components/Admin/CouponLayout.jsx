import React from 'react';
import QRCode from 'qrcode.js';

export default function CouponLayout({ coupons, backgroundImage }) {
  const chunkedCoupons = [];
  for (let i = 0; i < coupons.length; i += 10) {
    chunkedCoupons.push(coupons.slice(i, i + 10));
  }

  const today = new Date().toLocaleDateString('id-ID');
  const masjidName = 'Masjid An-Nur'; // Bisa diubah menjadi setting

  return (
    <div className="space-y-8">
      {chunkedCoupons.map((page, pageIndex) => (
        <div
          key={pageIndex}
          className="bg-white p-6 rounded-lg"
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
              backgroundImage={backgroundImage}
              masjidName={masjidName}
              today={today}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CouponCard({ coupon, backgroundImage, masjidName, today }) {
  const formatText = `${coupon.no_urut}/RW${coupon.rw || '-'}/RT${coupon.rt || '-'}/${today}/${masjidName}`;

  return (
    <div
      className="border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center relative overflow-hidden"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f9f9f9',
      }}
    >
      {/* Overlay untuk readability */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-white/70 z-0"></div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* QR Code */}
        <QRCodeComponent qrSecret={coupon.qr_secret} size={80} />

        {/* Nomor Urut */}
        <div className="font-bold text-lg text-gray-900">#{coupon.no_urut}</div>

        {/* Format Text */}
        <div className="text-xs text-gray-700 leading-tight max-w-full break-words">
          <div className="font-semibold text-gray-900">{coupon.no_urut}</div>
          <div>RW {coupon.rw || '-'} | RT {coupon.rt || '-'}</div>
          <div>{today}</div>
          <div className="font-semibold mt-1">{masjidName}</div>
        </div>
      </div>
    </div>
  );
}

function QRCodeComponent({ qrSecret, size }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (canvasRef.current && qrSecret) {
      try {
        new QRCode(canvasRef.current, {
          text: qrSecret,
          width: size,
          height: size,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  }, [qrSecret, size]);

  return <div ref={canvasRef}></div>;
}
