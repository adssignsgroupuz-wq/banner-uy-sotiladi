import * as opentype from 'opentype.js';

let loadedFont: opentype.Font | null = null;

export const loadFont = async (url: string): Promise<opentype.Font> => {
    return new Promise((resolve, reject) => {
        opentype.load(url, (err, font) => {
            if (err) {
                console.error("Font could not be loaded:", err);
                reject(err);
            } else if (font) {
                loadedFont = font;
                resolve(font);
            } else {
                reject(new Error("Font loaded but is undefined"));
            }
        });
    });
};

export const getLoadedFont = () => loadedFont;

export const textToSvgPath = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    align: 'left' | 'center' | 'right' = 'left'
): string | null => {
    if (!loadedFont) return null;

    const path = loadedFont.getPath(text, 0, y, fontSize);
    const box = path.getBoundingBox();

    let targetX = x;
    if (align === 'center') {
        targetX = x - (box.x1 + box.x2) / 2;
    } else if (align === 'right') {
        targetX = x - box.x2;
    } else if (align === 'left') {
        targetX = x - box.x1;
    }

    return loadedFont.getPath(text, targetX, y, fontSize).toPathData(2);
};
