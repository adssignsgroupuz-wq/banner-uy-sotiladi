import { jsPDF } from 'jspdf';
import 'svg2pdf.js';

export const exportToPdf = async (svgElement: SVGSVGElement, widthMm: number, heightMm: number, filename = 'uy-sotiladi-banner.pdf') => {
    const orientation = widthMm > heightMm ? 'l' : 'p';

    const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: [widthMm, heightMm],
        compress: true
    });

    // -------------------------------------------------------------
    // INTERCEPT jsPDF colors to FORCE CMYK for Print
    // jsPDF uses RGB by default from svg2pdf.js
    // We map our exact banner colors to exact CMYK proportions
    // -------------------------------------------------------------
    // jsPDF writes DeviceCMYK values directly into the PDF which requires floats 0.0 to 1.0.
    const cmykMap = [
        { h: '#ffe600', rgb: [255, 230, 0], cmyk: [0, 0.06, 1.0, 0] },     // Yellow: M=6%, Y=100%
        { h: '#e31837', rgb: [227, 24, 55], cmyk: [0, 1.0, 1.0, 0] },      // Red: M=100%, Y=100%
        { h: '#0033a0', rgb: [0, 51, 160], cmyk: [1.0, 0.8, 0, 0] },       // Blue: C=100%, M=80%
        { h: '#000000', rgb: [0, 0, 0], cmyk: [0.95, 0.95, 0.45, 0.95] }, // Rich Black: C=95 M=95 Y=45 K=95
        { h: '#ffffff', rgb: [255, 255, 255], cmyk: [0, 0, 0, 0] },     // White
        { h: '#808080', rgb: [128, 128, 128], cmyk: [0, 0, 0, 0.5] }     // Gray
    ];

    const convertToCMYK = (args: any[], origFunc: any) => {
        if (args.length === 4) return origFunc(...args); // Zotan CMYK bo'lsa

        let matched = false;
        if (typeof args[0] === 'string') {
            const hex = args[0].toLowerCase();
            const hit = cmykMap.find(c => c.h === hex);
            if (hit) {
                matched = true;
                return origFunc(hit.cmyk[0], hit.cmyk[1], hit.cmyk[2], hit.cmyk[3]);
            }
        } else if (args.length >= 3) {
            const r = Math.round(args[0]), g = Math.round(args[1]), b = Math.round(args[2]);
            const hit = cmykMap.find(c => c.rgb[0] === r && c.rgb[1] === g && c.rgb[2] === b);
            if (hit) {
                matched = true;
                return origFunc(hit.cmyk[0], hit.cmyk[1], hit.cmyk[2], hit.cmyk[3]);
            }
        }

        if (!matched) return origFunc(...args);
    };

    const origFill = doc.setFillColor.bind(doc);
    doc.setFillColor = (...args: any[]) => convertToCMYK(args, origFill)!;

    const origStroke = doc.setDrawColor.bind(doc);
    doc.setDrawColor = (...args: any[]) => convertToCMYK(args, origStroke)!;

    const origText = doc.setTextColor.bind(doc);
    doc.setTextColor = (...args: any[]) => convertToCMYK(args, origText)!;
    // -------------------------------------------------------------

    // The svg element has viewBox with total size (including bleeds).
    // We want the whole thing in the PDF.
    await doc.svg(svgElement, {
        x: 0,
        y: 0,
        width: widthMm,
        height: heightMm
    });

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = pdfUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(pdfUrl);
    }, 200);
};

export const exportToSvg = (svgElement: SVGSVGElement, filename = 'uy-sotiladi-banner.svg') => {
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // Add required namespaces
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, source], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};
