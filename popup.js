document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('imageFile');
  const convertButton = document.getElementById('convertButton');
  const resultDiv = document.getElementById('result');
  const statusP = document.getElementById('status');

  // Enable/Disable button when a file is selected
  fileInput.addEventListener('change', () => {
    convertButton.disabled = fileInput.files.length === 0;
    resultDiv.innerHTML = '';
    statusP.textContent = fileInput.files.length ? `Selected: ${fileInput.files[0].name}` : '';
  });

  convertButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) return;

    // UI Feedback
    convertButton.disabled = true;
    convertButton.textContent = 'Processing...';
    resultDiv.innerHTML = '';
    statusP.textContent = 'Reading file...';
    
    // Check file type
    if (!file.type.match('image.*')) {
      statusP.textContent = 'Error: Please select a valid image file.';
      // Reset
      convertButton.disabled = false;
      convertButton.textContent = 'Convert and Download (JPEG Quality 70%)';
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
      statusP.textContent = 'Loading image into memory...';
      const img = new Image();
      
      img.onload = function() {
        statusP.textContent = 'Compressing image...';
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to the image's original dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);

        // --- Core Compression: Export as JPEG with 70% quality ---
        const outputFormat = 'image/jpeg';
        const quality = 0.7; 

        canvas.toBlob((blob) => {
          if (!blob) {
            statusP.textContent = 'Error: Could not process image.';
            convertButton.disabled = false;
            convertButton.textContent = 'Convert and Download (JPEG Quality 70%)';
            return;
          }

          // Calculate sizes
          const originalSizeKB = (file.size / 1024).toFixed(2);
          const newSizeKB = (blob.size / 1024).toFixed(2);
          
          // Create a download link
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          
          let fileName = file.name.replace(/\.(jpeg|jpg|png|webp)$/i, '');
          fileName = `${fileName}_compressed_${newSizeKB}kb.jpg`; 

          downloadLink.href = url;
          downloadLink.download = fileName;
          downloadLink.textContent = `✅ Download Compressed Image (${newSizeKB} KB)`;
          downloadLink.style.cssText = 'display:block; margin-top:10px; color:#107c10; font-weight: bold;';

          // Display results
          statusP.innerHTML = `
            Original Size: <span style="color: #d9534f;">${originalSizeKB} KB</span><br>
            New Size: <strong style="color: ${newSizeKB <= 1024 ? 'green' : 'red'};">${newSizeKB} KB</strong>
          `;
          
          resultDiv.appendChild(downloadLink);

          // Reset button
          convertButton.disabled = false;
          convertButton.textContent = 'Convert and Download (JPEG Quality 70%)';
        }, outputFormat, quality);
      };
      
      img.onerror = () => {
        statusP.textContent = 'Error: Failed to load image.';
        convertButton.disabled = false;
        convertButton.textContent = 'Convert and Download (JPEG Quality 70%)';
      }

      // Set the image source to the data URL
      img.src = e.target.result;
    };

    reader.onerror = function() {
      statusP.textContent = 'Error: Failed to read the file.';
      convertButton.disabled = false;
      convertButton.textContent = 'Convert and Download (JPEG Quality 70%)';
    };

    // Read the file as a Data URL
    reader.readAsDataURL(file);
  });
});