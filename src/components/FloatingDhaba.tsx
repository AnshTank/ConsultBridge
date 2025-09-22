"use client";

const FloatingDhaba = () => {
  const gridPositions = [
    { left: 15, top: 20 }, { left: 75, top: 15 }, { left: 25, top: 60 },
    { left: 85, top: 70 }, { left: 60, top: 25 }, { left: 40, top: 80 }
  ];
  
  const dhabaElements = gridPositions.map((pos, i) => {
    // Avoid bright greens (120-180) by using blue-purple-pink range
    const hueRanges = [220, 260, 300, 340, 20, 60]; // Blue to purple to pink to orange
    return {
      ...pos,
      size: 90 + (i % 3) * 20,
      hue: hueRanges[i % hueRanges.length],
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {dhabaElements.map((pos, i) => {
        const moveX = (Math.random() - 0.5) * 60;
        const moveY = (Math.random() - 0.5) * 60;
        const duration = 15 + (i * 2);
        
        return (
          <div
            key={i}
            className="bg-dhaba"
            style={{
              width: `${pos.size}px`,
              height: `${pos.size}px`,
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              background: `radial-gradient(circle, 
                hsla(${pos.hue}, 60%, 65%, 0.3), 
                hsla(${pos.hue + 40}, 60%, 65%, 0.2), 
                transparent)`,
              '--x': `${moveX}px`,
              '--y': `${moveY}px`,
              opacity: 0.4,
              animation: `dhaba-float ${duration}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

export default FloatingDhaba;