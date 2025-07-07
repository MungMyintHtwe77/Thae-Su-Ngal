// Lightbox functionality for product images

// Lightbox state
let isLightboxOpen = false;
let currentImageIndex = 0;
let lightboxImages = [];

// Initialize lightbox
function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    // Close lightbox when clicking outside image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (isLightboxOpen) {
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    previousImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        }
    });
    
    // Prevent body scroll when lightbox is open
    lightbox.addEventListener('wheel', function(e) {
        e.preventDefault();
    });
    
    // Touch/swipe support for mobile
    initializeTouchSupport();
}

// Open lightbox with image
function openLightbox(imageSrc, caption) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    // Set image and caption
    lightboxImage.src = imageSrc;
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
    
    // Show lightbox
    lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');
    isLightboxOpen = true;
    
    // Focus on lightbox for keyboard navigation
    lightbox.focus();
    
    // Preload adjacent images
    preloadAdjacentImages();
    
    // Add loading state
    lightboxImage.classList.add('loading');
    
    // Remove loading state when image loads
    lightboxImage.onload = function() {
        this.classList.remove('loading');
    };
    
    // Handle image load error
    lightboxImage.onerror = function() {
        this.classList.remove('loading');
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTE5LjMzIDUwIDEzNS4zNiA2Ni4wNCAxMzUuMzYgODUuMzZWMTE0LjY0QzEzNS4zNiAxMzMuOTYgMTE5LjMzIDE1MCAyMDAiIHN0cm9rZT0iI0NDQ0NDQyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
        lightboxCaption.textContent = 'Failed to load image';
    };
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    isLightboxOpen = false;
    
    // Clear image src to stop loading
    const lightboxImage = document.getElementById('lightbox-image');
    lightboxImage.src = '';
}

// Get all product images for navigation
function getAllProductImages() {
    const productImages = document.querySelectorAll('.product-img');
    return Array.from(productImages).map(img => ({
        src: img.src,
        alt: img.alt
    }));
}

// Navigate to previous image
function previousImage() {
    lightboxImages = getAllProductImages();
    if (lightboxImages.length > 1) {
        currentImageIndex = (currentImageIndex - 1 + lightboxImages.length) % lightboxImages.length;
        const prevImage = lightboxImages[currentImageIndex];
        openLightbox(prevImage.src, prevImage.alt);
    }
}

// Navigate to next image
function nextImage() {
    lightboxImages = getAllProductImages();
    if (lightboxImages.length > 1) {
        currentImageIndex = (currentImageIndex + 1) % lightboxImages.length;
        const nextImage = lightboxImages[currentImageIndex];
        openLightbox(nextImage.src, nextImage.alt);
    }
}

// Preload adjacent images for better performance
function preloadAdjacentImages() {
    lightboxImages = getAllProductImages();
    const prevIndex = (currentImageIndex - 1 + lightboxImages.length) % lightboxImages.length;
    const nextIndex = (currentImageIndex + 1) % lightboxImages.length;
    
    // Preload previous image
    if (lightboxImages[prevIndex]) {
        const prevImg = new Image();
        prevImg.src = lightboxImages[prevIndex].src;
    }
    
    // Preload next image
    if (lightboxImages[nextIndex]) {
        const nextImg = new Image();
        nextImg.src = lightboxImages[nextIndex].src;
    }
}

// Initialize touch support for mobile devices
function initializeTouchSupport() {
    const lightbox = document.getElementById('lightbox');
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 50;
        
        // Horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    previousImage();
                } else {
                    nextImage();
                }
            }
        }
        // Vertical swipe down to close
        else if (deltaY > minSwipeDistance) {
            closeLightbox();
        }
    }
}

// Zoom functionality
function initializeZoom() {
    const lightboxImage = document.getElementById('lightbox-image');
    let isZoomed = false;
    let zoomLevel = 1;
    
    lightboxImage.addEventListener('click', function(e) {
        if (!isZoomed) {
            zoomLevel = 2;
            this.style.transform = `scale(${zoomLevel})`;
            this.style.cursor = 'zoom-out';
            isZoomed = true;
        } else {
            zoomLevel = 1;
            this.style.transform = `scale(${zoomLevel})`;
            this.style.cursor = 'zoom-in';
            isZoomed = false;
        }
    });
    
    // Double tap to zoom on mobile
    let lastTap = 0;
    lightboxImage.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 500 && tapLength > 0) {
            e.preventDefault();
            if (!isZoomed) {
                zoomLevel = 2;
                this.style.transform = `scale(${zoomLevel})`;
                isZoomed = true;
            } else {
                zoomLevel = 1;
                this.style.transform = `scale(${zoomLevel})`;
                isZoomed = false;
            }
        }
        lastTap = currentTime;
    });
}

// Add navigation arrows to lightbox
function addLightboxNavigation() {
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = lightbox.querySelector('.lightbox-content');
    
    // Create navigation arrows
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-nav lightbox-prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.onclick = previousImage;
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-nav lightbox-next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.onclick = nextImage;
    
    lightboxContent.appendChild(prevBtn);
    lightboxContent.appendChild(nextBtn);
    
    // Show/hide navigation based on number of images
    function updateNavigation() {
        const imageCount = getAllProductImages().length;
        if (imageCount > 1) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }
    
    // Update navigation when lightbox opens
    const originalOpenLightbox = window.openLightbox;
    window.openLightbox = function(imageSrc, caption) {
        originalOpenLightbox(imageSrc, caption);
        updateNavigation();
    };
}

// Initialize lightbox when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLightbox();
    initializeZoom();
    addLightboxNavigation();
});

// Add CSS for lightbox if not already present
function addLightboxStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .lightbox.active {
            opacity: 1;
            visibility: visible;
        }
        
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            text-align: center;
        }
        
        .lightbox-image {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 8px;
            transition: transform 0.3s ease;
            cursor: zoom-in;
        }
        
        .lightbox-image.loading {
            filter: blur(2px);
        }
        
        .lightbox-caption {
            color: white;
            font-size: 1.1rem;
            margin-top: 1rem;
            padding: 0 1rem;
        }
        
        .lightbox-close {
            position: absolute;
            top: -40px;
            right: -40px;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            padding: 10px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            transition: background 0.3s ease;
        }
        
        .lightbox-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .lightbox-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            font-size: 1.5rem;
            padding: 1rem;
            cursor: pointer;
            border-radius: 50%;
            transition: background 0.3s ease;
        }
        
        .lightbox-nav:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .lightbox-prev {
            left: -60px;
        }
        
        .lightbox-next {
            right: -60px;
        }
        
        .lightbox-open {
            overflow: hidden;
        }
        
        .no-results-message {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-light);
        }
        
        .no-results-content i {
            font-size: 3rem;
            color: var(--gray-medium);
            margin-bottom: 1rem;
        }
        
        .no-results-content h3 {
            font-size: 1.5rem;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
        }
        
        .no-results-content p {
            color: var(--text-light);
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: var(--text-dark);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        }
        
        .notification.success {
            border-left: 4px solid var(--primary-green);
        }
        
        .notification.error {
            border-left: 4px solid var(--primary-red);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-light);
            cursor: pointer;
            font-size: 1rem;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @media (max-width: 768px) {
            .lightbox-close {
                top: -30px;
                right: -30px;
                font-size: 1.5rem;
            }
            
            .lightbox-nav {
                font-size: 1.2rem;
                padding: 0.75rem;
            }
            
            .lightbox-prev {
                left: -50px;
            }
            
            .lightbox-next {
                right: -50px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Add styles when script loads
addLightboxStyles();
