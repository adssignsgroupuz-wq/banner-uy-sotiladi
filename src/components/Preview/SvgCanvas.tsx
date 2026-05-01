import React from 'react';
import { useBannerStore } from '../../store/bannerState';
import { getLoadedFont, textToSvgPath } from '../../core/fontProcessor';

export const SvgCanvas: React.FC<{ id?: string }> = ({ id = 'banner-svg' }) => {
    const { size, eyelets, template, mainTitle, phoneNumber, phoneNumber2, rooms, floor, customText } = useBannerStore();
    const font = getLoadedFont();

    // Calculate dimensions
    const totalW = (Number(size.widthMm) || 0) + size.bleedMm * 2;
    const totalH = (Number(size.heightMm) || 0) + size.bleedMm * 2;
    const cx = totalW / 2;

    const getColors = () => {
        switch (template) {
            case 'red-white': return { bg: '#e31837', fg: '#ffffff' };
            case 'blue-white': return { bg: '#0033a0', fg: '#ffffff' };
            case 'white-red': return { bg: '#ffffff', fg: '#e31837' };
            case 'yellow-black':
            default: return { bg: '#ffe600', fg: '#000000' };
        }
    };
    const colors = getColors();

    const detailsStr = [rooms, floor, customText].filter(Boolean).join(' • ');

    const lines: { text: string; type: string }[] = [];
    if (mainTitle) lines.push({ text: mainTitle, type: 'title' });
    if (phoneNumber) lines.push({ text: phoneNumber, type: 'phone' });
    if (phoneNumber2) lines.push({ text: phoneNumber2, type: 'phone' });
    if (detailsStr) lines.push({ text: detailsStr, type: 'details' });

    const totalLines = lines.length;

    const renderText = (
        text: string,
        yOffset: number,
        fontSize: number
    ) => {
        if (!font || !text) return null;
        try {
            const pathData = textToSvgPath(text, cx, yOffset, fontSize, 'center');
            return <path d={pathData || ''} fill={colors.fg} />;
        } catch (e) {
            return null;
        }
    };

    const renderEyelets = () => {
        const eyeletRadius = 5; // qisman 10mm diametrli xoch (cross) bo'lishi uchun radiusi 5
        const gap = 30; // Chetidan 30mm ichkarida!
        
        const safeL = size.bleedMm + gap;
        const safeR = size.bleedMm + (Number(size.widthMm) || 0) - gap;
        const safeT = size.bleedMm + gap;
        const safeB = size.bleedMm + (Number(size.heightMm) || 0) - gap;

        const marks: {x: number, y: number}[] = [];

        // Yuzaga kelishi mumkin bo'lgan takroriy o'qiyotgan burchaklarni g'alvoga aylanmasligi u-n Set ham ishlatsak bo'lardi,
        // Lekin SVGda ustma-ust chizish muammo emas.
        const hCount = Number(eyelets.horizontal) || 0;
        if (hCount > 0) {
            if (hCount === 1) {
                marks.push({ x: cx, y: safeT });
                marks.push({ x: cx, y: safeB });
            } else {
                for (let i = 0; i < hCount; i++) {
                    const x = safeL + (i * ((safeR - safeL) / (hCount - 1)));
                    marks.push({ x, y: safeT });
                    marks.push({ x, y: safeB });
                }
            }
        }

        const vCount = Number(eyelets.vertical) || 0;
        if (vCount > 0) {
            if (vCount === 1) {
                marks.push({ x: safeL, y: totalH / 2 });
                marks.push({ x: safeR, y: totalH / 2 });
            } else {
                for (let i = 0; i < vCount; i++) {
                    const y = safeT + (i * ((safeB - safeT) / (vCount - 1)));
                    marks.push({ x: safeL, y });
                    marks.push({ x: safeR, y });
                }
            }
        }

        return marks.map((m, i) => (
            <g key={`eyelet-${i}`} stroke={colors.fg} strokeWidth="1.5">
                <line x1={m.x - eyeletRadius} y1={m.y} x2={m.x + eyeletRadius} y2={m.y} />
                <line x1={m.x} y1={m.y - eyeletRadius} x2={m.x} y2={m.y + eyeletRadius} />
            </g>
        ));
    };

    const renderContent = () => {
        if (totalLines === 0) return null;

        const targetW = totalW * 0.85;
        const maxTotalHeight = (Number(size.heightMm) || 0) * 0.75; 

        // 1. Dastlab barcha qatorlarning "targetW" kenglikka yoyuvchi mukammal font o'lchamini topamiz.
        let rawMeasurements = lines.map(line => {
            if (!font || !line.text) return { ...line, rawSize: 10, rawHeight: 0 };
            
            try {
                const baseSize = 100;
                const path = font.getPath(line.text, 0, 0, baseSize);
                const bbox = path.getBoundingBox();
                const textW = bbox.x2 - bbox.x1;
                
                const rawSize = baseSize * (targetW / Math.max(1, textW));
                const rawHeight = (bbox.y2 - bbox.y1) * (rawSize / baseSize);
                
                return { ...line, rawSize, rawHeight };
            } catch (e) {
                return { ...line, rawSize: 10, rawHeight: 0 };
            }
        });

        // 2. Agar barcha matnlar 85% lari jamlanganda banner balandligidan oshib ketsa, hammalarini BITA XIL foizda kichraytiramiz ki,
        // ularning eni garchan 85% dan kichrayib ketsa ham BIR BIRIGA mutlaqo yuz foiz teng bo'lib qoladi. Proporsiya buzilmaydi!
        const sumRawHeight = rawMeasurements.reduce((acc, curr) => acc + curr.rawHeight, 0);

        let unifiedScale = 1;
        if (sumRawHeight > maxTotalHeight) {
            unifiedScale = maxTotalHeight / sumRawHeight;
        }

        // Qayta hisoblash
        let totalVisualHeight = 0;
        const finalMeasurements = rawMeasurements.map(line => {
             const finalSize = line.rawSize * unifiedScale;
             if (font && line.text) {
                 const fPath = font.getPath(line.text, 0, 0, finalSize);
                 const fBbox = fPath.getBoundingBox();
                 const fh = fBbox.y2 - fBbox.y1;
                 totalVisualHeight += fh;
                 return { ...line, size: finalSize, bbox: fBbox, visualHeight: fh };
             }
             return { ...line, size: 10, bbox: { y1: 0, y2: 0, x1: 0, x2: 0 }, visualHeight: 0 };
        });

        const remainingSpace = (Number(size.heightMm) || 0) - totalVisualHeight;
        const gap = remainingSpace / (totalLines + 1);

        let currentY = size.bleedMm;

        return finalMeasurements.map((line, index) => {
            const topOfTextY = currentY + gap;
            
            const baselineY = topOfTextY - line.bbox.y1;
            
            currentY = topOfTextY + line.visualHeight;

            return (
                <g key={`${line.type}-${index}`}>
                    {renderText(line.text, baselineY, line.size)}
                </g>
            );
        });
    };

    return (
        <svg
            id={id}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${totalW} ${totalH}`}
            width="100%"
            height="100%"
            style={{
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                borderRadius: '8px', 
                backgroundColor: '#fff',
                aspectRatio: `${totalW} / ${totalH}`
            }}
        >
            <rect 
                x="0" 
                y="0" 
                width={totalW} 
                height={totalH} 
                fill={colors.bg} 
                stroke={template === 'white-red' ? '#000000' : 'none'}
                strokeWidth={template === 'white-red' ? 0.025 : 0}
            />

            {font ? (
                <>
                    {renderContent()}

                    {renderEyelets()}

                    {/* Print Bleed Marks - Endi Hairline (1px yoki uskunaga xos nozik qalinlik) */}
                    {size.bleedMm > 0 && (
                        <rect 
                            x={size.bleedMm} 
                            y={size.bleedMm} 
                            width={Number(size.widthMm) || 0} 
                            height={Number(size.heightMm) || 0} 
                            fill="none" 
                            stroke="rgba(128,128,128,0.5)" 
                            strokeWidth="0.25"
                            strokeDasharray="30, 30"
                        />
                    )}
                </>
            ) : (
                <text x={cx} y={totalH / 2} fill={colors.fg} fontSize={totalW * 0.05} textAnchor="middle">
                    Shrift tayyorlanmoqda...
                </text>
            )}
        </svg>
    );
};
