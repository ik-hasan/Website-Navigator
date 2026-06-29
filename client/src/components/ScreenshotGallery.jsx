import React, { useState } from "react";

function ScreenshotGallery({ screenshots }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((screenshot, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setSelectedImage(screenshot)}
          >
            <div className="bg-primary-600 text-white px-3 py-2 text-sm font-medium">
              Step {screenshot.step}
            </div>
            <img
              src={screenshot.url}
              alt={`Screenshot step ${screenshot.step}`}
              className="w-full h-48 object-cover hover:scale-105 transition-transform"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
            <img
              src={selectedImage.url}
              alt={`Screenshot step ${selectedImage.step}`}
              className="max-w-full max-h-screen rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
              <p className="font-medium">Step {selectedImage.step}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ScreenshotGallery;
