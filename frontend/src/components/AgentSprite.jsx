import React from 'react';

// Pixel art walking character — 16x20 pixel grid displayed at 2x (32x40px)
// Walks back and forth, speeds up when agent is running, X eyes on error

export default function AgentSprite({ color, status }) {
  const isRunning = status === 'active' || status === 'running';
  const isError   = status === 'error';

  const walkSpeed = isRunning ? '1.5s' : '3.8s';
  const limbSpeed = isRunning ? '0.25s' : '0.52s';

  const legL = { animation: `pixelLimbL ${limbSpeed} ease-in-out infinite` };
  const legR = { animation: `pixelLimbR ${limbSpeed} ease-in-out infinite` };
  const armL = { animation: `pixelLimbR ${limbSpeed} ease-in-out infinite` };
  const armR = { animation: `pixelLimbL ${limbSpeed} ease-in-out infinite` };

  return (
    <div style={{
      position: 'relative',
      height: 44,
      overflow: 'hidden',
      marginTop: 10,
      borderTop: `1px solid ${color}20`,
    }}>
      {/* Pixel ground dots */}
      <div style={{
        position: 'absolute',
        bottom: 2,
        left: 0,
        right: 0,
        height: 1,
        backgroundImage: `repeating-linear-gradient(to right, ${color}30 0px, ${color}30 3px, transparent 3px, transparent 8px)`,
      }}/>

      {/* Walking character */}
      <div style={{
        position: 'absolute',
        bottom: 3,
        animation: `spriteWalk ${walkSpeed} linear infinite`,
        willChange: 'transform',
      }}>
        <svg
          width="32"
          height="40"
          viewBox="0 0 16 20"
          style={{ imageRendering: 'pixelated', display: 'block' }}
          shapeRendering="crispEdges"
        >
          {/* Body */}
          <rect x="2" y="7" width="12" height="6" fill={color} opacity="0.8"/>

          {/* Head */}
          <rect x="3" y="0" width="10" height="7" fill={color} opacity="0.95"/>

          {/* Eyes — normal */}
          {!isError && <>
            <rect x="5" y="2" width="2" height="2" fill="rgba(0,0,0,0.55)"/>
            <rect x="9" y="2" width="2" height="2" fill="rgba(0,0,0,0.55)"/>
          </>}

          {/* Eyes — X (error) */}
          {isError && <>
            <rect x="5" y="2" width="1" height="1" fill="rgba(0,0,0,0.7)"/>
            <rect x="6" y="3" width="1" height="1" fill="rgba(0,0,0,0.7)"/>
            <rect x="6" y="2" width="1" height="1" fill="rgba(0,0,0,0.7)"/>
            <rect x="5" y="3" width="1" height="1" fill="rgba(0,0,0,0.7)"/>
            <rect x="9" y="2" width="1" height="1" fill="rgba(0,0,0,0.7)"/>
            <rect x="10" y="3" width="1" height="1" fill="rgba(0,0,0,0.7)"/>
            <rect x="10" y="2" width="1" height="1" fill="rgba(0,0,0,0.7)"/>
            <rect x="9" y="3" width="1" height="1" fill="rgba(0,0,0,0.7)"/>
          </>}

          {/* Left arm */}
          <rect x="0" y="8" width="2" height="4" fill={color} opacity="0.7" style={armL}/>

          {/* Right arm */}
          <rect x="14" y="8" width="2" height="4" fill={color} opacity="0.7" style={armR}/>

          {/* Left leg */}
          <rect x="3" y="13" width="4" height="7" fill={color} opacity="0.75" style={legL}/>

          {/* Right leg */}
          <rect x="9" y="13" width="4" height="7" fill={color} opacity="0.75" style={legR}/>
        </svg>
      </div>
    </div>
  );
}
