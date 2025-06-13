import { PDFExtract } from 'pdf.js-extract';

export async function extractTextFromPDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfExtract = new PDFExtract();
    const options = {}; // default options

    pdfExtract.extractBuffer(buffer, options, (err, data) => {
      if (err) return reject(err);

      const pages = data.pages.map((page) =>
        page.content.map((c) => c.str).join(' ')
      );
      resolve(pages.join('\n\n'));
    });
  });
}


export default extractTextFromPDF;