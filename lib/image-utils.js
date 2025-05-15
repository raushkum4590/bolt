// Image utility functions for CodeView component

/**
 * Validates an image file based on type and size
 * @param {File} file - The image file to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns {boolean} - Whether the file is valid
 */
export const validateImage = (file, maxSizeMB = 5) => {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    console.error('Not an image file');
    return false;
  }
  
  // Check file size (default: 5MB)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    console.error(`Image too large (max: ${maxSizeMB}MB)`);
    return false;
  }
  
  return true;
};

/**
 * Converts an image file to a base64 data URL
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} - A promise that resolves to the base64 data URL
 */
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Optimizes an image by reducing its quality or size if needed
 * @param {string} base64 - The base64 data URL of the image
 * @param {Object} options - Optimization options
 * @returns {Promise<string>} - A promise that resolves to the optimized base64 data URL
 */
export const optimizeImage = (base64, options = { maxWidth: 1200, quality: 0.8 }) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { maxWidth, quality } = options;
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Resize if wider than maxWidth
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get the optimized data URL
      const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(optimizedBase64);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
};

/**
 * Generates image markup for React components
 * @param {string} imagePath - The path to the image
 * @param {string} altText - Alt text for the image
 * @param {string} className - CSS classes for styling
 * @returns {string} - JSX markup for the image
 */
export const generateImageMarkup = (imagePath, altText = "", className = "max-w-full h-auto") => {
  return `<img src="${imagePath}" alt="${altText}" className="${className}" />`;
};

/**
 * Inserts image references into the AI generated code
 * @param {Object} files - Object containing all file contents
 * @param {Array} imagePaths - Array of image paths
 * @returns {Object} - Updated files object with image references
 */
export const insertImageReferences = (files, imagePaths) => {
  if (!imagePaths || imagePaths.length === 0) return files;
  
  // Make a copy of the files object
  const updatedFiles = { ...files };
  
  // Look for App.js or index.js to insert image references
  const targetFile = updatedFiles['/App.js'] || updatedFiles['/src/App.js'] || 
                     updatedFiles['/index.js'] || updatedFiles['/src/index.js'];
  
  if (targetFile) {
    // Create an import statement or example usage for the images
    let exampleUsage = '\n// Example of using the uploaded images:\n';
    exampleUsage += '// You can use these images in your components like this:\n';
    
    imagePaths.forEach((path, index) => {
      const fileName = path.split('/').pop();
      exampleUsage += `// <img src="${path.replace('/public', '')}" alt="${fileName}" className="max-w-full h-auto" />\n`;
    });
    
    // Add the example usage as a comment in the file
    targetFile.code = targetFile.code + '\n' + exampleUsage;
  }
  
  return updatedFiles;
};
