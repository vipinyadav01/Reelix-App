import { useEffect, useRef } from 'react';

export function useInitializationDebugger(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    console.log(`🔍 ${componentName} - Render #${renderCount.current} - Mount time: ${Date.now() - mountTime.current}ms`);
  });

  useEffect(() => {
    console.log(`🎬 ${componentName} - Mounted`);
    return () => {
      console.log(`🎬 ${componentName} - Unmounted after ${renderCount.current} renders`);
    };
  }, [componentName]);
}


