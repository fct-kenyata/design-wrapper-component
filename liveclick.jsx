import { useEffect, useState } from 'react';

export const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    const updateClock = () => setCurrentTime(new Date().toLocaleTimeString());
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="font-mono text-sm text-foreground">{currentTime}</span>
  );
};

export default LiveClock;
