/**
 * ============================================
 * SKETCHIFY - Sketch Conversion Engine
 * Core image processing and sketch generation
 * ============================================
 */

class SketchEngine {
    constructor() {
        // Default settings
        this.settings = {
            type: 'pencil',
            intensity: 50,
            contrast: 50,
            brightness: 50,
            invertColors: false
        };
        
        // Preset configurations
        this.presets = {
            'soft-pencil': {
                type: 'pencil',
                intensity: 40,
                contrast: 45,
                brightness: 55,
                invertColors: false
            },
            'dark-pencil': {
                type: 'pencil',
                intensity: 70,
                contrast: 60,
                brightness: 45,
                invertColors: false
            },
            'charcoal': {
                type: 'charcoal',
                intensity: 65,
                contrast: 70,
                brightness: 40,
                invertColors: false
            },
            'ink': {
                type: 'ink',
                intensity: 80,
                contrast: 85,
                brightness: 50,
                invertColors: false
            }
        };
        
        // Canvas elements
        this.originalCanvas = null;
        this.sketchCanvas = null;
        this.originalCtx = null;
        this.sketchCtx = null;
        
        // Image data
        this.originalImage = null;
        this.originalImageData = null;
    }

    /**
     * Initialize the engine with canvas elements
     */
    init(originalCanvas, sketchCanvas) {
        this.originalCanvas = originalCanvas;
        this.sketchCanvas = sketchCanvas;
        this.originalCtx = originalCanvas.getContext('2d', { willReadFrequently: true });
        this.sketchCtx = sketchCanvas.getContext('2d', { willReadFrequently: true });
    }

    /**
     * Load and process an image
     */
    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    this.originalImage = img;
                    this.setupCanvases(img);
                    this.drawOriginal();
                    this.generateSketch();
                    resolve({
                        width: img.width,
                        height: img.height,
                        name: file.name
                    });
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Setup canvas dimensions based on image size
     */
    setupCanvases(img) {
        // Calculate optimal size while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        
        let width = img.width;
        let height = img.height;
        
        // Scale down if necessary
        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }
        
        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }
        
        // Set canvas dimensions
        this.originalCanvas.width = width;
        this.originalCanvas.height = height;
        this.sketchCanvas.width = width;
        this.sketchCanvas.height = height;
    }

    /**
     * Draw the original image on canvas
     */
    drawOriginal() {
        if (!this.originalImage) return;
        
        this.originalCtx.drawImage(
            this.originalImage,
            0, 0,
            this.originalCanvas.width,
            this.originalCanvas.height
        );
        
        // Store original image data for processing
        this.originalImageData = this.originalCtx.getImageData(
            0, 0,
            this.originalCanvas.width,
            this.originalCanvas.height
        );
    }

    /**
     * Apply settings and update the preset
     */
    applyPreset(presetName) {
        if (this.presets[presetName]) {
            this.settings = { ...this.presets[presetName] };
            return this.settings;
        }
        return null;
    }

    /**
     * Update a single setting
     */
    updateSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
        }
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Main sketch generation function
     */
    generateSketch() {
        if (!this.originalImageData) return;
        
        const width = this.originalCanvas.width;
        const height = this.originalCanvas.height;
        
        // Create a copy of the original image data
        const imageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            width,
            height
        );
        
        // Apply processing based on sketch type
        switch (this.settings.type) {
            case 'pencil':
                this.applyPencilSketch(imageData);
                break;
            case 'charcoal':
                this.applyCharcoalSketch(imageData);
                break;
            case 'ink':
                this.applyInkSketch(imageData);
                break;
            case 'detailed':
                this.applyDetailedPencilSketch(imageData);
                break;
            default:
                this.applyPencilSketch(imageData);
        }
        
        // Apply brightness and contrast adjustments
        this.applyBrightnessContrast(imageData);
        
        // Invert colors if enabled
        if (this.settings.invertColors) {
            this.invertColors(imageData);
        }
        
        // Draw the result
        this.sketchCtx.putImageData(imageData, 0, 0);
    }

    /**
     * Convert to grayscale
     */
    toGrayscale(imageData) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Use luminosity formula for natural grayscale
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
            // Alpha stays the same
        }
    }

    /**
     * Apply Gaussian blur (simplified 3x3)
     */
    applyBlur(imageData, radius = 1) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const copy = new Uint8ClampedArray(data);
        
        const kernelSize = radius * 2 + 1;
        const kernel = this.createGaussianKernel(kernelSize);
        
        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                let r = 0, g = 0, b = 0;
                let kernelIndex = 0;
                
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const weight = kernel[kernelIndex++];
                        
                        r += copy[idx] * weight;
                        g += copy[idx + 1] * weight;
                        b += copy[idx + 2] * weight;
                    }
                }
                
                const idx = (y * width + x) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
            }
        }
    }

    /**
     * Create Gaussian kernel
     */
    createGaussianKernel(size) {
        const kernel = [];
        const sigma = size / 3;
        let sum = 0;
        const half = Math.floor(size / 2);
        
        for (let y = -half; y <= half; y++) {
            for (let x = -half; x <= half; x++) {
                const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                kernel.push(value);
                sum += value;
            }
        }
        
        // Normalize
        return kernel.map(v => v / sum);
    }

    /**
     * Invert image colors
     */
    invertImageData(imageData) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }

    /**
     * Color dodge blend mode
     */
    colorDodgeBlend(base, blend) {
        if (blend === 255) return 255;
        return Math.min(255, Math.floor((base * 256) / (255 - blend)));
    }

    /**
     * Apply color dodge blending between two image data
     */
    applyColorDodge(baseData, blendData) {
        const base = baseData.data;
        const blend = blendData.data;
        
        for (let i = 0; i < base.length; i += 4) {
            base[i] = this.colorDodgeBlend(base[i], blend[i]);
            base[i + 1] = this.colorDodgeBlend(base[i + 1], blend[i + 1]);
            base[i + 2] = this.colorDodgeBlend(base[i + 2], blend[i + 2]);
        }
    }

    /**
     * Edge detection using Sobel operator
     */
    detectEdges(imageData, threshold = 30) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const output = new Uint8ClampedArray(data.length);
        
        // Sobel kernels
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;
                let kernelIndex = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const gray = data[idx];
                        
                        gx += gray * sobelX[kernelIndex];
                        gy += gray * sobelY[kernelIndex];
                        kernelIndex++;
                    }
                }
                
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                const idx = (y * width + x) * 4;
                
                // Threshold and invert for sketch effect (white background, dark lines)
                const edge = magnitude > threshold ? 0 : 255;
                output[idx] = edge;
                output[idx + 1] = edge;
                output[idx + 2] = edge;
                output[idx + 3] = 255;
            }
        }
        
        // Copy output back to imageData
        for (let i = 0; i < data.length; i++) {
            data[i] = output[i];
        }
    }

    /**
     * Apply pencil sketch effect
     */
    applyPencilSketch(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        
        // Step 1: Convert to grayscale
        this.toGrayscale(imageData);
        
        // Step 2: Create inverted blurred copy
        const blurredData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            width,
            height
        );
        
        this.invertImageData(blurredData);
        
        // Apply blur based on intensity
        const blurRadius = Math.max(1, Math.floor(this.settings.intensity / 15));
        for (let i = 0; i < blurRadius; i++) {
            this.applyBlur(blurredData, 2);
        }
        
        // Step 3: Color dodge blend
        this.applyColorDodge(imageData, blurredData);
        
        // Step 4: Enhance with intensity
        this.enhanceSketch(imageData, this.settings.intensity);
    }

    /**
     * Apply charcoal sketch effect
     */
    applyCharcoalSketch(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        
        // Convert to grayscale
        this.toGrayscale(imageData);
        
        // Apply stronger edge detection
        const edgeData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            width,
            height
        );
        
        const threshold = 100 - this.settings.intensity;
        this.detectEdges(edgeData, threshold);
        
        // Blend original grayscale with edges
        const data = imageData.data;
        const edges = edgeData.data;
        const blendFactor = this.settings.intensity / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            // Darken and add texture
            const gray = data[i] * 0.7;
            const edge = edges[i];
            
            // Blend
            const result = gray * (1 - blendFactor * 0.5) + edge * blendFactor * 0.5;
            data[i] = result;
            data[i + 1] = result;
            data[i + 2] = result;
        }
        
        // Add noise for charcoal texture
        this.addNoise(imageData, 15);
    }

    /**
     * Apply ink drawing effect
     */
    applyInkSketch(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        
        // Convert to grayscale
        this.toGrayscale(imageData);
        
        // Apply edge detection with high contrast
        const threshold = Math.max(10, 80 - this.settings.intensity);
        this.detectEdges(imageData, threshold);
        
        // Apply threshold for pure black and white
        const data = imageData.data;
        const thresholdValue = 255 - (this.settings.intensity * 2);
        
        for (let i = 0; i < data.length; i += 4) {
            const value = data[i] > thresholdValue ? 255 : 0;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
        }
    }

    /**
     * Apply detailed pencil sketch effect
     */
    applyDetailedPencilSketch(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        
        // Step 1: Convert to grayscale
        this.toGrayscale(imageData);
        
        // Step 2: Create inverted blurred copy (less blur for more detail)
        const blurredData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            width,
            height
        );
        
        this.invertImageData(blurredData);
        this.applyBlur(blurredData, 1);
        
        // Step 3: Color dodge blend
        this.applyColorDodge(imageData, blurredData);
        
        // Step 4: Enhance edges for more detail
        const edgeData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            width,
            height
        );
        this.toGrayscale(edgeData);
        this.detectEdges(edgeData, 40);
        
        // Blend edges with the sketch
        const data = imageData.data;
        const edges = edgeData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Multiply blend for darker lines
            const sketch = data[i];
            const edge = edges[i];
            const result = (sketch * edge) / 255;
            
            data[i] = result;
            data[i + 1] = result;
            data[i + 2] = result;
        }
        
        // Enhance sketch
        this.enhanceSketch(imageData, this.settings.intensity);
    }

    /**
     * Enhance sketch by adjusting levels
     */
    enhanceSketch(imageData, intensity) {
        const data = imageData.data;
        const factor = 1 + (intensity - 50) / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            // Adjust levels
            let value = data[i];
            
            // Apply curve adjustment
            value = 255 * Math.pow(value / 255, 1 / factor);
            
            data[i] = Math.min(255, Math.max(0, value));
            data[i + 1] = data[i];
            data[i + 2] = data[i];
        }
    }

    /**
     * Add noise texture
     */
    addNoise(imageData, amount) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * amount;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = data[i];
            data[i + 2] = data[i];
        }
    }

    /**
     * Apply brightness and contrast adjustments
     */
    applyBrightnessContrast(imageData) {
        const data = imageData.data;
        
        // Calculate brightness and contrast factors
        const brightness = (this.settings.brightness - 50) * 2.55; // -127.5 to 127.5
        const contrast = (this.settings.contrast - 50) / 50 + 1; // 0 to 2
        
        for (let i = 0; i < data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                let value = data[i + j];
                
                // Apply contrast (centered at 128)
                value = ((value - 128) * contrast) + 128;
                
                // Apply brightness
                value += brightness;
                
                // Clamp
                data[i + j] = Math.min(255, Math.max(0, value));
            }
        }
    }

    /**
     * Invert final colors
     */
    invertColors(imageData) {
        this.invertImageData(imageData);
    }

    /**
     * Get the sketch as a data URL for download
     */
    getSketchDataURL(format = 'png', quality = 1.0) {
        return this.sketchCanvas.toDataURL(`image/${format}`, quality);
    }

    /**
     * Download the sketch
     */
    downloadSketch(filename = 'sketchify-artwork', format = 'png') {
        const dataURL = this.getSketchDataURL(format);
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = dataURL;
        link.click();
    }

    /**
     * Reset to default settings
     */
    reset() {
        this.settings = {
            type: 'pencil',
            intensity: 50,
            contrast: 50,
            brightness: 50,
            invertColors: false
        };
        
        if (this.originalImageData) {
            this.generateSketch();
        }
        
        return this.settings;
    }

    /**
     * Check if an image is loaded
     */
    hasImage() {
        return this.originalImage !== null;
    }

    /**
     * Get image dimensions
     */
    getImageDimensions() {
        if (!this.originalImage) return null;
        
        return {
            width: this.originalCanvas.width,
            height: this.originalCanvas.height,
            originalWidth: this.originalImage.width,
            originalHeight: this.originalImage.height
        };
    }

    /**
     * Clear all data
     */
    clear() {
        this.originalImage = null;
        this.originalImageData = null;
        
        if (this.originalCtx) {
            this.originalCtx.clearRect(0, 0, this.originalCanvas.width, this.originalCanvas.height);
        }
        
        if (this.sketchCtx) {
            this.sketchCtx.clearRect(0, 0, this.sketchCanvas.width, this.sketchCanvas.height);
        }
    }
}

// Export for use in app.js
window.SketchEngine = SketchEngine;
