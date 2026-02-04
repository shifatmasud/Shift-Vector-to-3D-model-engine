/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface FileUploadProps {
  onFileLoad: (svgContent: string) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, disabled }) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          onFileLoad(e.target.result);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid SVG file.");
    }
  }, [onFileLoad]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (!disabled) setIsDragging(true); }, [disabled]);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['Space.XL'],
    border: `2px dashed ${theme.Color.Base.Surface[3]}`,
    borderRadius: theme.radius['Radius.XL'],
    transition: 'all 300ms ease',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: theme.Color.Base.Surface[2],
    minHeight: '240px',
    textAlign: 'center',
    color: theme.Color.Base.Content[2],
  };

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById('file-upload-input')?.click()}
      style={baseStyle}
      // FIX: Cast motion props to `any` to bypass TypeScript errors. This seems to be caused by a type definition issue in the environment.
      {...{
        animate: {
          borderColor: isDragging ? theme.Color.Focus.Content[1] : theme.Color.Base.Surface[3],
          backgroundColor: isDragging ? theme.Color.Focus.Surface[1] : theme.Color.Base.Surface[2]
        }
      } as any}
    >
      <input id="file-upload-input" type="file" style={{ display: 'none' }} accept=".svg" onChange={handleChange} disabled={disabled} />
      <i className="ph-bold ph-upload-simple" style={{ fontSize: '48px', color: isDragging ? theme.Color.Focus.Content[1] : theme.Color.Base.Content[3] }}/>
      <p style={{ ...theme.Type.Readable.Body.L, marginTop: theme.spacing['Space.M'], color: theme.Color.Base.Content[1] }}>
        Drag & drop an SVG file
      </p>
      <p style={{ ...theme.Type.Readable.Body.S, color: theme.Color.Base.Content[2], marginTop: theme.spacing['Space.XS'] }}>
        or click to browse
      </p>
    </motion.div>
  );
};