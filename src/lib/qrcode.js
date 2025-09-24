import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    const qrCodeString = await QRCode.toString(data, {
      type: 'svg',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeString;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateQRCodeDataURL = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    throw error;
  }
};