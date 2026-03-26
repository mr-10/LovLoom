import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import { generateCoupleImages } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { LoadingSpinner, SparklesIcon } from './components/icons';

interface GeneratedImage {
  src: string;
  caption: string;
}

interface ImageData {
  base64: string;
  mimeType: string;
}

const App: React.FC = () => {
  const [husbandFile, setHusbandFile] = useState<File | null>(null);
  const [wifeFile, setWifeFile] = useState<File | null>(null);
  const [childFile, setChildFile] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
    if (!husbandFile || !wifeFile) {
      setError('Please upload photos for the husband and wife.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const husbandBase64 = await fileToBase64(husbandFile);
      const wifeBase64 = await fileToBase64(wifeFile);
      
      const husbandImageData: ImageData = {
        base64: husbandBase64,
        mimeType: husbandFile.type,
      };

      const wifeImageData: ImageData = {
        base64: wifeBase64,
        mimeType: wifeFile.type,
      };

      let childImageData: ImageData | undefined = undefined;
      if (childFile) {
        const childBase64 = await fileToBase64(childFile);
        childImageData = {
          base64: childBase64,
          mimeType: childFile.type,
        };
      }

      const images = await generateCoupleImages(husbandImageData, wifeImageData, childImageData);

      const captions = [
        'Celebrating a milestone anniversary',
        'Enjoying an adventurous hike together',
        childFile ? 'Happily posing with their child' : 'Enjoying a quiet moment in their golden years'
      ];

      setGeneratedImages(images.map((src, index) => ({
        src: `data:image/png;base64,${src}`,
        caption: captions[index]
      })));

    } catch (err) {
      console.error(err);
      setError('Failed to generate images. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [husbandFile, wifeFile, childFile]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-grow">
        <header className="text-center mb-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto mb-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
             <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
             <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008v-.008z" />
          </svg>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            LovLoom
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-500">
            Weave your love story into beautiful images. Upload photos of you and your partner to see photorealistic glimpses of your future together.
          </p>
        </header>

        <main className="flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <ImageUploader title="Partner 1 Photo" onImageUpload={setHusbandFile} />
            <ImageUploader title="Partner 2 Photo" onImageUpload={setWifeFile} />
            <ImageUploader title="Child's Photo (Optional)" onImageUpload={setChildFile} />
          </div>

          <div className="text-center mb-10">
            <button
              onClick={handleGenerateClick}
              disabled={isLoading || !husbandFile || !wifeFile}
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  <span className="ml-2">Generate Future Photos</span>
                </>
              )}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>

          {generatedImages.length > 0 && (
            <section aria-labelledby="gallery-heading">
              <h2 id="gallery-heading" className="text-3xl font-bold text-center text-gray-800 mb-8">Your Future Moments</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {generatedImages.map((image, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    <img src={image.src} alt={image.caption} className="w-full h-80 object-cover" />
                    <div className="p-4">
                      <p className="text-center font-medium text-gray-600">{image.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      
      <footer className="w-full text-center p-4 mt-10">
        <p className="text-gray-500 text-sm">
          Credit: <a href="https://www.facebook.com/youcancallmeRakib" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Rakibul Hasan</a>
        </p>
      </footer>
    </div>
  );
};

export default App;