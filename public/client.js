document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
  
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
  
    // Define canvas dimensions and pixel size
    const canvasWidth = 1000;
    const canvasHeight = 500;
    const pixelSize = 10; // Change pixel size as needed
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  
    // Request pixel data from the server when the page loads
    socket.emit('requestPixelData');
  
    // Handle received pixel data from the server
    socket.on('updateAllPixels', (data) => {
      // Redraw all pixels received from the server
      data.forEach(pixel => {
        drawPixel(pixel.x, pixel.y, pixel.color);
      });
    });
  
    // Define color palette
    const palette = document.querySelector('.palette');
    const colors = palette.querySelectorAll('.color');
    colors.forEach(color => {
      color.addEventListener('click', handleColorChange);
    });
  
    function handleColorChange(event) {
      // Remove 'selected' class from all colors
      colors.forEach(color => {
        color.classList.remove('selected');
      });
      // Add 'selected' class to the clicked color
      const selectedColor = event.target;
      selectedColor.classList.add('selected');
      currentColor = selectedColor.dataset.color;
      // Update selected color indicator
      const colorIndicator = document.getElementById('selectedColorIndicator');
      colorIndicator.style.backgroundColor = currentColor;
    }
  
    // Set default color
    let currentColor = '#FF0000';
    // Set initial selected color indicator
    const colorIndicator = document.getElementById('selectedColorIndicator');
    colorIndicator.style.backgroundColor = currentColor;
  
    // Handle click events on the canvas
    let canPlaceBlock = true;
    canvas.addEventListener('click', handleClick);
  
    function handleClick(event) {
      if (!canPlaceBlock) return;
  
      const x = Math.floor(event.offsetX / pixelSize) * pixelSize;
      const y = Math.floor(event.offsetY / pixelSize) * pixelSize;
  
      // Draw the pixel locally
      drawPixel(x, y, currentColor);
  
      // Send pixel placement to the server
      socket.emit('placePixel', { x, y, color: currentColor });
  
      // Set block placement cooldown
      canPlaceBlock = false;
      const cooldownDiv = document.querySelector('.cooldown');
      cooldownDiv.style.display = 'block';
      let remainingTime = 5;
  
      const cooldownInterval = setInterval(() => {
        document.getElementById('cooldownTimer').textContent = remainingTime;
        remainingTime--;
        if (remainingTime < 0) {
          clearInterval(cooldownInterval);
          cooldownDiv.style.display = 'none';
          canPlaceBlock = true;
        }
      }, 1000);
    }
  
    socket.on('updatePixel', (data) => {
      // Draw the pixel received from the server
      drawPixel(data.x, data.y, data.color);
    });
  
    function drawPixel(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  });
  