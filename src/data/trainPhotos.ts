export interface TrainPhoto {
  src: string;
  alt: string;
  credit: string;
}

// Real photographs of Indian Railways, sourced from Wikimedia Commons under
// Creative Commons licenses. Attribution is consolidated into a single
// small credit line on the login page rather than a per-photo caption.
export const trainPhotos: TrainPhoto[] = [
  {
    src: '/images/trains/vande-bharat.jpg',
    alt: 'Vande Bharat Express semi-high-speed train',
    credit: 'Harshul12345, CC BY-SA 4.0',
  },
  {
    src: '/images/trains/wap7-locomotive.jpg',
    alt: 'WAP-7 electric locomotive hauling a passenger train',
    credit: 'Shan.H.Fernandes, CC BY-SA 3.0',
  },
  {
    src: '/images/trains/loco-driver.jpg',
    alt: 'A loco pilot at the controls of a locomotive footplate',
    credit: 'Joost J. Bakker, CC BY 2.0',
  },
  {
    src: '/images/trains/chennai-central.jpg',
    alt: 'Chennai Central railway station clock tower',
    credit: 'Yamuna D., CC BY-SA 4.0',
  },
];
