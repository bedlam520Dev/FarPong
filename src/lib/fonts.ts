import localFont from 'next/font/local';

export const PressStart2P = localFont({
  src: [
    {
      path: '../assets/fonts/PressStart2P-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--display-family',
  display: 'swap',
});

export const Roboto = localFont({
  src: [
    {
      path: '../assets/fonts/roboto-400.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--text-family',
  display: 'swap',
});

export const MartianMono = localFont({
  src: [
    {
      path: '../assets/fonts/MartianMono-VariableFont_wdth,wght.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--code-family',
  display: 'swap',
});
