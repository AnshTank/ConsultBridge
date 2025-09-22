"use client";

const FloatingParticles = () => {
  const particlePositions = [
    { left: 10, top: 15 }, { left: 90, top: 20 }, { left: 20, top: 80 },
    { left: 80, top: 85 }, { left: 50, top: 10 }, { left: 15, top: 50 },
    { left: 85, top: 60 }, { left: 40, top: 90 }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particlePositions.map((pos, i) => {
        const moveX = (i % 2 === 0 ? 1 : -1) * (100 + i * 30);
        const moveY = (i % 3 === 0 ? 1 : -1) * (80 + i * 20);
        const duration = 20 + (i * 2);
        
        return (
          <div
            key={i}
            className="bg-particle"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              '--x': `${moveX}px`,
              '--y': `${moveY}px`,
              animation: `particle-float ${duration}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

export default FloatingParticles;