import React from 'react';
import type { TemplateMode } from '../../store/bannerState';
import { useBannerStore } from '../../store/bannerState';
import { exportToPdf } from '../../core/pdfGenerator';

export const Sidebar: React.FC = () => {
    const { 
        size, setSize, 
        eyelets, setEyelets,
        template, setTemplate, 
        fontFamily, setFontFamily,
        mainTitle, setMainTitle,
        phoneNumber, setPhoneNumber,
        phoneNumber2, setPhoneNumber2, 
        rooms, setRooms, 
        floor, setFloor, 
        customText, setCustomText 
    } = useBannerStore();

    const [isExporting, setIsExporting] = React.useState(false);

    const handleExportPdf = async () => {
        const svg = document.getElementById('banner-svg') as unknown as SVGSVGElement;
        if (svg && !isExporting) {
            setIsExporting(true);
            try {
                // Kichik pauza (main threadni bo'shatib, React state ni chizishi u-n)
                await new Promise(res => setTimeout(res, 50)); 
                
                const totalW = (Number(size.widthMm) || 0) + size.bleedMm * 2;
                const totalH = (Number(size.heightMm) || 0) + size.bleedMm * 2;
                const filename = `${totalW}x${totalH}mm.pdf`;
                await exportToPdf(svg, totalW, totalH, filename);
            } catch (e) {
                console.error(e);
                alert("Faylni yuklashda muammo chiqdi. Qaytadan urinib ko'ring.");
            } finally {
                setIsExporting(false);
            }
        }
    };

    return (
        <aside className="sidebar">
            <h1 className="logo">UY SOTILADI<br/><span>Print-Ready Generator</span></h1>
            
            <div className="form-group">
                <label>1. O'lcham (Size / mm)</label>
                <div className="form-row">
                    <div className="form-group">
                        <label>Eni</label>
                        <input 
                            type="number" 
                            value={size.widthMm} 
                            onChange={(e) => setSize(e.target.value === '' ? '' : Number(e.target.value), size.heightMm)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Bo'yi</label>
                        <input 
                            type="number" 
                            value={size.heightMm} 
                            onChange={(e) => setSize(size.widthMm, e.target.value === '' ? '' : Number(e.target.value))} 
                        />
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label>2. Dizayn (Template)</label>
                <div className="template-grid">
                    {(['yellow-black', 'red-white', 'blue-white'] as TemplateMode[]).map((t) => (
                        <button 
                            key={t}
                            className={`template-btn ${t.split('-')[0]} ${template === t ? 'active' : ''}`}
                            onClick={() => setTemplate(t)}
                        />
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label>3. SHRIFT (FONT)</label>
                <select 
                    value={fontFamily} 
                    onChange={(e) => setFontFamily(e.target.value as any)}
                    className="size-select"
                >
                    <option value="roboto">Roboto Black (Qalin & Keng)</option>
                    <option value="impact">Impact (Klassik & Og'ir)</option>
                </select>
            </div>

            <div className="form-divider" />

            <div className="form-group">
                <label>Sarlavha matni</label>
                <input 
                    type="text" 
                    value={mainTitle} 
                    onChange={(e) => setMainTitle(e.target.value)} 
                    placeholder="Masalan: UY SOTILADI"
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                />
            </div>

            <div className="form-group">
                <label>Telefon raqami</label>
                <input 
                    type="text" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="+998 90 123 45 67"
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                />
            </div>
            
            <div className="form-group">
                <label>2 - Qo'shimcha raqam (Ixtiyoriy)</label>
                <input 
                    type="text" 
                    value={phoneNumber2} 
                    onChange={(e) => setPhoneNumber2(e.target.value)} 
                    placeholder="Masalan: +998 93 987 65 43"
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Xonalar soni</label>
                    <input 
                        type="text" 
                        value={rooms} 
                        onChange={(e) => setRooms(e.target.value)} 
                        placeholder="Masalan: 4 xona"
                    />
                </div>
                <div className="form-group">
                    <label>Qavat</label>
                    <input 
                        type="text" 
                        value={floor} 
                        onChange={(e) => setFloor(e.target.value)} 
                        placeholder="Masalan: 3-qavat"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Qo'shimcha matn (M: Maydoni)</label>
                <input 
                    type="text" 
                    value={customText} 
                    onChange={(e) => setCustomText(e.target.value)} 
                    placeholder="Masalan: 80 kv.m"
                />
            </div>

            <div className="form-divider" />

            <div className="form-group">
                <label>Lyuverslash (+)</label>
                <div className="form-row" style={{ alignItems: 'flex-end' }}>
                    <div className="form-group">
                        <label>Eniga (soni)</label>
                        <input 
                            type="number" 
                            min="0"
                            value={eyelets.horizontal} 
                            onChange={(e) => setEyelets(e.target.value === '' ? '' : Number(e.target.value), eyelets.vertical)} 
                            placeholder="M: 5"
                        />
                    </div>
                    <div className="form-group">
                        <label>Bo'yiga (soni)</label>
                        <input 
                            type="number" 
                            min="0"
                            value={eyelets.vertical} 
                            onChange={(e) => setEyelets(eyelets.horizontal, e.target.value === '' ? '' : Number(e.target.value))} 
                            placeholder="M: 3"
                        />
                    </div>
                </div>
            </div>

            <div className="export-actions">
                <button 
                    className="btn-primary" 
                    onClick={handleExportPdf} 
                    disabled={isExporting}
                    style={{ opacity: isExporting ? 0.7 : 1, cursor: isExporting ? 'wait' : 'pointer' }}
                >
                    {isExporting ? 'Fayl tayyorlanmoqda (Kuting)...' : 'Download Print-Ready PDF'}
                </button>
            </div>
            
            <p className="help-text">
                * PDF fayl CMYK maxsus vektor formatda tayyorlanadi.
            </p>
        </aside>
    );
};
