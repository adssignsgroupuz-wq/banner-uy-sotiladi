import { create } from 'zustand';

export type TemplateMode = 'yellow-black' | 'red-white' | 'blue-white';

export type FontFamily = 'roboto' | 'impact';

export interface BannerState {
    size: { widthMm: number; heightMm: number; bleedMm: number };
    eyelets: { horizontal: number; vertical: number };
    template: TemplateMode;
    fontFamily: FontFamily;
    mainTitle: string;
    phoneNumber: string;
    phoneNumber2: string;
    rooms: string;
    floor: string;
    customText: string;

    setEyelets: (horizontal: number, vertical: number) => void;
    setSize: (widthMm: number, heightMm: number) => void;
    setTemplate: (template: TemplateMode) => void;
    setFontFamily: (font: FontFamily) => void;
    setMainTitle: (title: string) => void;
    setPhoneNumber: (phone: string) => void;
    setPhoneNumber2: (phone: string) => void;
    setRooms: (rooms: string) => void;
    setFloor: (floor: string) => void;
    setCustomText: (text: string) => void;
}

export const useBannerStore = create<BannerState>((set) => ({
    size: { widthMm: 1200, heightMm: 800, bleedMm: 50 },
    eyelets: { horizontal: 0, vertical: 0 },
    template: 'yellow-black',
    fontFamily: 'impact',
    mainTitle: 'UY SOTILADI',
    phoneNumber: '+998 90 123 45 67',
    phoneNumber2: '',
    rooms: '4 xona',
    floor: '3-qavat',
    customText: '',

    setEyelets: (horizontal, vertical) => set({ eyelets: { horizontal, vertical } }),
    setSize: (widthMm, heightMm) => set((state) => ({ size: { ...state.size, widthMm, heightMm } })),
    setTemplate: (template) => set({ template }),
    setFontFamily: (fontFamily) => set({ fontFamily }),
    setMainTitle: (mainTitle) => set({ mainTitle }),
    setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
    setPhoneNumber2: (phoneNumber2) => set({ phoneNumber2 }),
    setRooms: (rooms) => set({ rooms }),
    setFloor: (floor) => set({ floor }),
    setCustomText: (customText) => set({ customText }),
}));
