/**
 * Adds a semi-transparent security watermark to an image file.
 * Returns a Promise that resolves to a Blob representing the watermarked image.
 * 
 * @param {File|string} imageSource - A File object or a base64 string
 * @param {string} [watermarkText] - Custom watermark text
 * @returns {Promise<Blob>}
 */
export const addWatermarkToImage = (imageSource, watermarkText = 'RENTUN GROUP - USO EXCLUSIVO CONTRATO') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Load image
    if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    } else if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      reject(new Error('Invalid image source. Must be File or Base64 string.'));
    }

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions equal to image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Configure watermark styling based on image size
      const maxDim = Math.max(canvas.width, canvas.height);
      const fontSize = Math.max(14, Math.round(maxDim / 20)); // Scale font size dynamically
      
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'; // White semi-transparent
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'; // Dark border for readability on light areas
      ctx.lineWidth = Math.max(1, fontSize / 15);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Translate to center and rotate 30 degrees (looks cleaner)
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-30 * Math.PI / 180);
      
      // Draw grid of watermark text
      const stepX = fontSize * 9;
      const stepY = fontSize * 3;
      
      // Draw multiple lines to cover the entire image
      for (let x = -maxDim; x < maxDim; x += stepX) {
        for (let y = -maxDim; y < maxDim; y += stepY) {
          // Add slight offset for staggered grid look
          const offsetX = (Math.abs(y) / stepY) % 2 === 0 ? stepX / 2 : 0;
          ctx.fillText(watermarkText, x + offsetX, y);
          ctx.strokeText(watermarkText, x + offsetX, y);
        }
      }
      
      ctx.restore();
      
      // Convert canvas to Blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/jpeg', 0.85); // High quality JPEG
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for watermarking'));
    };
  });
};
