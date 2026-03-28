
// This assumes pdfjsLib is available globally from the CDN script in index.html
declare const pdfjsLib: any;

export const extractTextFromPDF = async (pdfData: Uint8Array): Promise<string> => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Could not process the PDF file.');
  }
};
