/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useEffect, useState } from 'react';
import { type MotionValue, animate } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface RangeSliderProps {
  label: string;
  motionValue: MotionValue<number>;
  onCommit: (value: number) => void;
  onChange?: (value: number) => void; // Continuous update
  min?: number;
  max?: number;
  step?: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ 
    label, 
    motionValue, 
    onCommit, 
    onChange,
    min = 0, 
    max = 100,
    step = 1
}) => {
  const { theme } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(motionValue.get());
  const [isDragging, setIsDragging] = useState(false);

  // Sync internal state with external motion value updates
  useEffect(() => {
    const unsubscribe = motionValue.onChange((v) => {
      if (!isDragging) {
        setInternalValue(v);
      }
    });
    return unsubscribe;
  }, [motionValue, isDragging]);

  const updateValueFromPointer = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    
    let newValue = min + percent * (max - min);
    
    // Snap to step
    if (step) {
        newValue = Math.round(newValue / step) * step;
    }
    
    // Clamp
    newValue = Math.max(min, Math.min(max, newValue));

    // Round for clean display if step is integer, else keep decimals
    if (step % 1 !== 0) {
        newValue = parseFloat(newValue.toFixed(2));
    } else {
        newValue = Math.round(newValue);
    }
    
    setInternalValue(newValue);
    motionValue.set(newValue);
    
    // Fire continuous change
    if (onChange) onChange(newValue);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    trackRef.current?.setPointerCapture(e.pointerId);
    updateValueFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateValueFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      trackRef.current?.releasePointerCapture(e.pointerId);
      onCommit(internalValue); // Commit only on release
    }
  };

  const percentage = ((internalValue - min) / (max - min)) * 100;

  const numberInputStyle: React.CSSProperties = {
    width: '60px',
    padding: theme.spacing['Space.XS'],
    borderRadius: theme.radius['Radius.S'],
    border: `1px solid ${theme.Color.Base.Surface[3]}`,
    backgroundColor: theme.Color.Base.Surface[2],
    color: theme.Color.Base.Content[1],
    fontFamily: theme.Type.Readable.Body.M.fontFamily,
    fontSize: '14px',
    textAlign: 'center',
    outline: 'none',
  };

  return (
    <div onPointerDown={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing['Space.S'] }}>
        <label style={{ ...theme.Type.Readable.Label.S, color: theme.Color.Base.Content[2] }}>
            {label}
        </label>
        <span style={{ ...theme.Type.Expressive.Data, fontSize: '10px', color: theme.Color.Base.Content[3] }}>
            {internalValue}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing['Space.S'] }}>
        
        {/* Custom Track */}
        <div 
            ref={trackRef}
            style={{ 
                flex: 1, 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                touchAction: 'none'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '6px', 
                backgroundColor: theme.Color.Base.Surface[3], 
                borderRadius: '3px',
                overflow: 'visible' 
            }}>
                {/* Fill Bar */}
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    height: '100%', 
                    width: `${percentage}%`, 
                    backgroundColor: theme.Color.Accent.Surface[1], 
                    borderRadius: '3px' 
                }} />
                
                {/* Thumb */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${percentage}%`,
                    width: '18px',
                    height: '18px',
                    backgroundColor: theme.Color.Base.Surface[1],
                    border: `2px solid ${theme.Color.Accent.Surface[1]}`,
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: theme.effects['Effect.Shadow.Drop.1'],
                    transition: 'transform 0.1s ease',
                    transformOrigin: 'center'
                }} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;