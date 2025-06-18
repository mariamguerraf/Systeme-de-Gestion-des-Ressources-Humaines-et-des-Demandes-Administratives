import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string) => void;
  className?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  currentPhoto, 
  onPhotoChange, 
  className = "" 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux. Taille maximale: 5MB.');
      return;
    }

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const result = await apiService.uploadPhoto(file);
      
      if (result.success) {
        onPhotoChange(result.photo_url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(result.message || 'Erreur lors de l\'upload');
      }

    } catch (err: any) {
      console.error('Erreur upload:', err);
      setError(err.message || 'Erreur lors de l\'upload');
      setPreview(currentPhoto || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    onPhotoChange('');
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Camera className="w-4 h-4 inline mr-1" />
        Photo de profil
      </label>

      <div className="flex items-start space-x-4">
        {/* Photo Preview */}
        <div className="relative">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Aperçu"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="Supprimer la photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {preview ? 'Changer la photo' : 'Choisir une photo'}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, GIF ou WebP. Max 5MB.
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Photo uploadée avec succès!</span>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
