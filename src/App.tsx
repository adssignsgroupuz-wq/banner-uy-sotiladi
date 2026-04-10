import { useEffect, useState } from 'react';
import { Sidebar } from './components/Editor/Sidebar';
import { SvgCanvas } from './components/Preview/SvgCanvas';
import { loadFont } from './core/fontProcessor';
import { useBannerStore } from './store/bannerState';
import './index.css';

const FONT_URLS = {
    'roboto': 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf',
    'impact': '/impact.ttf'
};

function App() {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fontError, setFontError] = useState(false);
  const { fontFamily } = useBannerStore();

  useEffect(() => {
    // When fontFamily changes, reset loaded state and fetch new font
    setFontLoaded(false);
    const url = FONT_URLS[fontFamily] || FONT_URLS['roboto'];
    
    loadFont(url).then(() => {
        setFontLoaded(true);
        setFontError(false);
    }).catch(err => {
        console.error("Font loading error:", err);
        setFontError(true);
    });
  }, [fontFamily]);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="preview-area">
        <div className="preview-wrapper">
            {fontError ? (
                <div className="loader error">Shrift yuklashda xatolik yuz berdi. (Font load error)</div>
            ) : fontLoaded ? (
                <SvgCanvas />
            ) : (
                <div className="loader">Shrift va interfeys yuklanmoqda...<br/><span>Loading premium assets</span></div>
            )}
        </div>
      </main>
    </div>
  );
}

export default App;
