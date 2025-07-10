interface Window {
  VANTA: {
    CLOUDS: (options: {
      el: HTMLElement | null;
      mouseControls: boolean;
      touchControls: boolean;
      gyroControls: boolean;
      minHeight: number;
      minWidth: number;
      sunlightColor: number;
      skyColor?: number;
      cloudColor?: number;
      speed: number;
    }) => any;
  };
}