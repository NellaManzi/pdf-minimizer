import { PDFDocument } from 'pdf-lib';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [minimizedFile, setMinimizedFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber] = useState(1);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);

    // Load PDF file as a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      setUploadedFile(dataUrl);
      setMinimizedFile(null); // Reset minimized file when a new file is uploaded
    };
    reader.readAsDataURL(file);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const minimizePdf = async () => {
    try {
      const loadedPdf = await PDFDocument.load(uploadedFile);
      const newPdf = await PDFDocument.create();

      // Copy pages from the original PDF to the new PDF
      const pages = await newPdf.copyPages(loadedPdf, loadedPdf.getPageIndices());
      pages.forEach((page) => newPdf.addPage(page));

      // Save the minimized PDF as a base64 string
      const minimizedContent = await newPdf.saveAsBase64();
      setMinimizedFile(`data:application/pdf;base64,${minimizedContent}`);
    } catch (error) {
      console.error('Error while minimizing PDF:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800 p-4 text-white">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">PDF Minimizer</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-100">

        <div className="p-6 bg-white rounded-lg shadow-md">
          <label className="mb-4 text-xl font-bold text-gray-800">Upload PDF</label>
          <div className="mt-3 border-dashed border-2 border-gray-400 p-4 mb-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-2 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                {/* SVG path data */}
              </svg>
              <p className="text-lg">Drag and drop your PDF file here or click to browse.</p>
            </label>
          </div>
          {uploadedFile && typeof uploadedFile === 'string' && !minimizedFile && (
            <button
              className="mt-4 bg-blue-500 text-white p-2 rounded-md"
              onClick={minimizePdf}
            >
              Minimize PDF
            </button>
          )}

          {uploadedFile && typeof uploadedFile === 'string' && (
            <div className="text-gray-800">
              <p className="mb-2">Uploaded File:{uploadedFile.name}</p>
              <p className="font-bold"></p>
              <p>{(uploadedFile.length / 1024).toFixed(2)} KB</p>
            </div>
          )}

          {uploadedFile && typeof uploadedFile === 'string' && !minimizedFile && (
            <div className="mt-4">
              <p className="mb-2 text-xl font-bold text-gray-800">PDF Preview</p>
              <Document
                file={uploadedFile}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page pageNumber={pageNumber} />
              </Document>
              <p className="text-gray-800 text-sm">
                Page {pageNumber} of {numPages}
              </p>
            </div>
          )}

          {minimizedFile && (
            <div className="mt-4">
              <p className="mb-2 text-xl font-bold text-gray-800">Minimized PDF Preview</p>
              <Document
                file={minimizedFile}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page pageNumber={pageNumber} />
              </Document>
              <p className="text-gray-800 text-sm">
                Page {pageNumber} of {numPages}
              </p>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}

export default App;
