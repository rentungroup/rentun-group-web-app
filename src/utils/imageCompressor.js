/**
 * Comprime una imagen del lado del cliente usando HTML5 Canvas
 * para que quepa perfectamente en el límite de localStorage (5MB).
 * 
 * @param {File} file - El archivo de imagen a comprimir.
 * @param {number} maxWidth - Ancho máximo de la imagen resultante (default: 800).
 * @param {number} maxHeight - Alto máximo de la imagen resultante (default: 800).
 * @param {number} quality - Calidad de la compresión JPEG (0.1 a 1.0, default: 0.7).
 * @returns {Promise<string>} Promesa que resuelve a un DataURL en base64 de la imagen comprimida.
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo el aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG y comprimir
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
