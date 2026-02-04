/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface FileUploadProps {
  onFileLoad: (svgContent: string) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, disabled }) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') onFileLoad(e.target.result);
      };
      reader.readAsText(file);
    } else {
      // Could add a toast/log here
      console.warn("Please upload a valid SVG file.");
    }
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]); e.dataTransfer.clearData();
    }
  }, [disabled, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  }, []);

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && document.getElementById('shift-file-upload')?.click()}
      style={{
        width: '100%',
        minHeight: '180px',
        border: `2px dashed ${isDragging ? theme.Color.Signal.Content[1] : theme.Color.Base.Surface[3]}`,
        borderRadius: theme.radius['Radius.L'],
        backgroundColor: isDragging ? theme.Color.Base.Surface[3] : theme.Color.Base.Surface[2],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: theme.spacing['Space.L'],
        transition: `all ${theme.time['Time.2x']} ease`,
        position: 'relative',
        overflow: 'hidden'
      }}
      animate={{ scale: isDragging ? 1.02 : 1 }}
    >
        <i className="ph-fill ph-upload-simple" style={{ fontSize: '48px', color: disabled ? theme.Color.Base.Content[3] : theme.Color.Signal.Content[1], marginBottom: theme.spacing['Space.M'] }} />
        
        <p style={{ ...theme.Type.Readable.Body.M, color: theme.Color.Signal.Content[1], fontWeight: 600 }}>
            {disabled ? 'Processing...' : 'Upload SVG'}
        </p>
        <p style={{ ...theme.Type.Readable.Body.S, color: theme.Color.Base.Content[2], marginTop: theme.spacing['Space.XS'], textAlign: 'center' }}>
            Click or Drag & Drop<br/>to generate 3D model
        </p>

        <input 
            id="shift-file-upload" 
            type="file" 
            accept=".svg" 
            style={{ display: 'none' }} 
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            disabled={disabled}
        />
    </motion.div>
  );
};

export default FileUpload;