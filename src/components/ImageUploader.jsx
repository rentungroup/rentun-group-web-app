import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Edit2 } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

export default function ImageUploader({ id, label, currentImage, onImageSelected, onImageRemoved }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const base64Image = await compressImage(file);
      onImageSelected(base64Image);
    } catch (error) {
      console.error("Error compressing image", error);
      alert("No se pudo procesar la imagen. Asegúrate de subir un archivo de imagen válido.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', width:'100%', fontFamily:'Outfit, sans-serif' }}>
      {label && <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</label>}
      
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {currentImage ? (
        <div style={{
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1.5px solid #E6E7E8',
          height: 160,
          background: '#f8fafc',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <img 
            src={currentImage} 
            alt="Uploader preview" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            opacity: 1,
            transition: 'opacity 0.2s'
          }}>
            <button
              type="button"
              onClick={onButtonClick}
              style={{
                width: 40, height: 40,
                background: 'white',
                color: '#0F4C81',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s'
              }}
              title="Cambiar imagen"
            >
              <Edit2 size={16} />
            </button>
            {onImageRemoved && (
              <button
                type="button"
                onClick={onImageRemoved}
                style={{
                  width: 40, height: 40,
                  background: '#FF385C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s'
                }}
                title="Eliminar imagen"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <span style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontSize: '0.62rem',
            textTransform: 'uppercase',
            fontWeight: 800,
            padding: '0.2rem 0.5rem',
            borderRadius: 4
          }}>Imagen Cargada</span>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          style={{
            height: 160,
            border: isDragActive ? '2px dashed #0F4C81' : '2px dashed #E6E7E8',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragActive ? 'rgba(15,76,129,0.04)' : '#f8fafc',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div className="uploader-spinner" style={{
                width: 24, height: 24,
                borderRadius: '50%',
                border: '3px solid #0F4C81',
                borderTopColor: 'transparent'
              }}></div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F4C81' }}>Procesando...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDragActive ? 'rgba(15,76,129,0.15)' : '#e2e8f0',
                color: isDragActive ? '#0F4C81' : '#64748b'
              }}>
                <UploadCloud size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Sube o arrastra una foto aquí</p>
                <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '0.1rem 0 0' }}>JPEG, PNG (máx. 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
