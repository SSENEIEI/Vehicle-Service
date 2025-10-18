'use client';

import { useRef } from 'react';

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CargoAttachmentsInput({
  files = [],
  onChange,
  buttonStyle,
  helperStyle,
  accept = 'image/*',
  maxFiles = 5,
}) {
  const inputRef = useRef(null);
  const summaryStyle = helperStyle || { color: '#5c6f9c', fontSize: '14px' };
  const triggerStyle =
    buttonStyle ||
    {
      padding: '10px 16px',
      borderRadius: '14px',
      border: '1.5px solid #0c4aa1',
      backgroundColor: '#ffffff',
      color: '#0c4aa1',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
    };

  function handleSelectClick(event) {
    event.preventDefault();
    inputRef.current?.click();
  }

  function handleFilesSelected(event) {
    const selections = Array.from(event.target.files || []);
    if (!selections.length) {
      return;
    }
    const merged = [...files, ...selections].slice(0, maxFiles);
    onChange?.(merged);
    event.target.value = '';
  }

  function handleRemove(index) {
    const next = files.filter((_, idx) => idx !== index);
    onChange?.(next);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#0f274f' }}>ไฟล์ภาพ</span>
        <button type="button" style={triggerStyle} onClick={handleSelectClick}>
          Choose Files
        </button>
        <span style={summaryStyle}>
          {files.length ? `${files.length} ไฟล์ที่เลือก` : 'No file chosen'}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        style={{ display: 'none' }}
        onChange={handleFilesSelected}
      />

      {files.length ? (
        <ul style={{ margin: 0, paddingLeft: '18px', color: '#0f274f' }}>
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ flex: 1 }}>
                {file.name} {file.size ? `(${formatBytes(file.size)})` : ''}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                style={{
                  border: '1px solid #c0392b',
                  backgroundColor: '#fff4f4',
                  color: '#c0392b',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p style={summaryStyle}>
        รองรับไฟล์ภาพสูงสุด {maxFiles} ไฟล์ (jpeg, png)
      </p>
    </div>
  );
}
