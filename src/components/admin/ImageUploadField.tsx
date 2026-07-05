'use client';

import { useId, useRef, useState } from 'react';
import MediaImage from '@/components/common/MediaImage';
import FootballUploadProgress from '@/components/admin/FootballUploadProgress';
import { uploadMediaFile } from '@/lib/storage/upload-client';

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  hint?: string;
}

export default function ImageUploadField({ label, value, onChange, folder = 'media', hint }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  async function handleFile(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WebP, or GIF)');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const publicUrl = await uploadMediaFile(file, {
        folder,
        onProgress: setProgress,
      });
      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (uploading) return;
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }

  return (
    <div className="form__group image-upload">
      <span className="form__label">{label}</span>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="image-upload__input"
        onChange={handleInputChange}
        disabled={uploading}
      />

      {uploading && (
        <FootballUploadProgress
          progress={progress}
          label={value ? 'Replacing image…' : 'Kicking off upload…'}
        />
      )}

      {value ? (
        <div className={`image-upload__preview ${uploading ? 'image-upload__preview--busy' : ''}`}>
          <div className="image-upload__preview-img">
            <MediaImage src={value} alt="" fill sizes="160px" />
          </div>
          <div className="image-upload__preview-actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="btn btn--outline btn--sm image-upload__remove"
              disabled={uploading}
              onClick={() => onChange('')}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`image-upload__dropzone ${uploading ? 'image-upload__dropzone--busy' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <span className="image-upload__icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 16V4m0 0L8 8m4-4 4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="image-upload__title">
            {uploading ? 'Upload in progress' : 'Tap to upload'}
          </span>
          <span className="image-upload__hint">
            {hint ?? 'JPG, PNG, WebP or GIF · Max 10MB'}
          </span>
        </label>
      )}

      {error && <p className="image-upload__error">{error}</p>}
    </div>
  );
}
