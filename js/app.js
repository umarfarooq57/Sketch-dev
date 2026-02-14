/**
 * ============================================
 * SKETCHIFY - Main Application Controller
 * UI interactions and state management
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // Initialize Application
    // ============================================
    
    const app = new SketchifyApp();
    app.init();
});

class SketchifyApp {
    constructor() {
        // Core elements
        this.elements = {};
        
        // Sketch engine instance
        this.engine = null;
        
        // App state
        this.state = {
            imageLoaded: false,
            isProcessing: false,
            currentView: 'split',
            zoom: 100,
            activePreset: 'soft-pencil'
        };
    }

    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        this.initSketchEngine();
        this.bindEvents();
        this.loadTheme();
        this.updateUIState();
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            // Theme
            themeToggle: document.getElementById('themeToggle'),
            
            // Upload
            uploadZone: document.getElementById('uploadZone'),
            imageInput: document.getElementById('imageInput'),
            fileInfo: document.getElementById('fileInfo'),
            fileName: document.getElementById('fileName'),
            removeFile: document.getElementById('removeFile'),
            emptyUploadBtn: document.getElementById('emptyUploadBtn'),
            
            // Controls
            sketchType: document.getElementById('sketchType'),
            intensitySlider: document.getElementById('intensitySlider'),
            intensityValue: document.getElementById('intensityValue'),
            contrastSlider: document.getElementById('contrastSlider'),
            contrastValue: document.getElementById('contrastValue'),
            brightnessSlider: document.getElementById('brightnessSlider'),
            brightnessValue: document.getElementById('brightnessValue'),
            invertColors: document.getElementById('invertColors'),
            
            // Canvas
            canvasContainer: document.getElementById('canvasContainer'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            emptyState: document.getElementById('emptyState'),
            canvasDisplay: document.getElementById('canvasDisplay'),
            imageWrapper: document.getElementById('imageWrapper'),
            originalCanvas: document.getElementById('originalCanvas'),
            sketchCanvas: document.getElementById('sketchCanvas'),
            imageDimensions: document.getElementById('imageDimensions'),
            
            // View controls
            viewSplit: document.getElementById('viewSplit'),
            viewOriginal: document.getElementById('viewOriginal'),
            viewSketch: document.getElementById('viewSketch'),
            
            // Zoom controls
            zoomIn: document.getElementById('zoomIn'),
            zoomOut: document.getElementById('zoomOut'),
            zoomReset: document.getElementById('zoomReset'),
            zoomLevel: document.getElementById('zoomLevel'),
            
            // Presets
            presetBtns: document.querySelectorAll('.preset-btn'),
            
            // Actions
            downloadBtn: document.getElementById('downloadBtn'),
            resetBtn: document.getElementById('resetBtn'),
            newImageBtn: document.getElementById('newImageBtn'),
            
            // Toast
            toastContainer: document.getElementById('toastContainer')
        };
    }

    /**
     * Initialize the sketch engine
     */
    initSketchEngine() {
        this.engine = new SketchEngine();
        this.engine.init(
            this.elements.originalCanvas,
            this.elements.sketchCanvas
        );
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Theme toggle
        this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
        
        // Upload events
        this.elements.uploadZone?.addEventListener('click', () => this.elements.imageInput.click());
        this.elements.uploadZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.uploadZone?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.elements.uploadZone?.addEventListener('drop', (e) => this.handleDrop(e));
        this.elements.imageInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        this.elements.removeFile?.addEventListener('click', () => this.removeImage());
        this.elements.emptyUploadBtn?.addEventListener('click', () => this.elements.imageInput.click());
        
        // Control events
        this.elements.sketchType?.addEventListener('change', () => this.handleSketchTypeChange());
        this.elements.intensitySlider?.addEventListener('input', () => this.handleIntensityChange());
        this.elements.contrastSlider?.addEventListener('input', () => this.handleContrastChange());
        this.elements.brightnessSlider?.addEventListener('input', () => this.handleBrightnessChange());
        this.elements.invertColors?.addEventListener('change', () => this.handleInvertChange());
        
        // View controls
        this.elements.viewSplit?.addEventListener('click', () => this.setView('split'));
        this.elements.viewOriginal?.addEventListener('click', () => this.setView('original'));
        this.elements.viewSketch?.addEventListener('click', () => this.setView('sketch'));
        
        // Zoom controls
        this.elements.zoomIn?.addEventListener('click', () => this.zoom(10));
        this.elements.zoomOut?.addEventListener('click', () => this.zoom(-10));
        this.elements.zoomReset?.addEventListener('click', () => this.resetZoom());
        
        // Preset buttons
        this.elements.presetBtns?.forEach(btn => {
            btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
        });
        
        // Action buttons
        this.elements.downloadBtn?.addEventListener('click', () => this.downloadSketch());
        this.elements.resetBtn?.addEventListener('click', () => this.resetSettings());
        this.elements.newImageBtn?.addEventListener('click', () => this.newImage());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // ============================================
    // Theme Management
    // ============================================
    
    loadTheme() {
        const savedTheme = localStorage.getItem('sketchify-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sketchify-theme', newTheme);
    }

    // ============================================
    // File Upload Handling
    // ============================================
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.elements.uploadZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.elements.uploadZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.elements.uploadZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    async processFile(file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            this.showToast('Please upload a JPG or PNG image', 'error');
            return;
        }
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showToast('Image size must be less than 10MB', 'error');
            return;
        }
        
        // Show loading state
        this.showLoading(true);
        
        try {
            const result = await this.engine.loadImage(file);
            
            // Update UI
            this.state.imageLoaded = true;
            this.elements.fileName.textContent = result.name;
            this.elements.fileInfo.style.display = 'flex';
            this.elements.imageDimensions.textContent = `${result.width} × ${result.height}px`;
            
            this.updateUIState();
            this.showLoading(false);
            this.showToast('Image loaded successfully', 'success');
            
        } catch (error) {
            console.error('Error loading image:', error);
            this.showLoading(false);
            this.showToast('Failed to load image', 'error');
        }
    }

    removeImage() {
        this.engine.clear();
        this.state.imageLoaded = false;
        
        this.elements.fileInfo.style.display = 'none';
        this.elements.fileName.textContent = '';
        this.elements.imageInput.value = '';
        this.elements.imageDimensions.textContent = '';
        
        this.updateUIState();
    }

    newImage() {
        this.removeImage();
        this.elements.imageInput.click();
    }

    // ============================================
    // Control Handlers
    // ============================================
    
    handleSketchTypeChange() {
        const type = this.elements.sketchType.value;
        this.engine.updateSetting('type', type);
        this.regenerateSketch();
    }

    handleIntensityChange() {
        const value = parseInt(this.elements.intensitySlider.value);
        this.elements.intensityValue.textContent = `${value}%`;
        this.engine.updateSetting('intensity', value);
        this.regenerateSketch();
    }

    handleContrastChange() {
        const value = parseInt(this.elements.contrastSlider.value);
        this.elements.contrastValue.textContent = `${value}%`;
        this.engine.updateSetting('contrast', value);
        this.regenerateSketch();
    }

    handleBrightnessChange() {
        const value = parseInt(this.elements.brightnessSlider.value);
        this.elements.brightnessValue.textContent = `${value}%`;
        this.engine.updateSetting('brightness', value);
        this.regenerateSketch();
    }

    handleInvertChange() {
        const checked = this.elements.invertColors.checked;
        this.engine.updateSetting('invertColors', checked);
        this.regenerateSketch();
    }

    regenerateSketch() {
        if (!this.state.imageLoaded) return;
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            this.engine.generateSketch();
        });
    }

    // ============================================
    // View Management
    // ============================================
    
    setView(view) {
        this.state.currentView = view;
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update image wrapper class
        this.elements.imageWrapper.className = 'image-wrapper';
        this.elements.imageWrapper.classList.add(`${view}-view`);
    }

    // ============================================
    // Zoom Management
    // ============================================
    
    zoom(delta) {
        this.state.zoom = Math.max(25, Math.min(200, this.state.zoom + delta));
        this.applyZoom();
    }

    resetZoom() {
        this.state.zoom = 100;
        this.applyZoom();
    }

    applyZoom() {
        this.elements.zoomLevel.textContent = `${this.state.zoom}%`;
        
        const scale = this.state.zoom / 100;
        this.elements.imageWrapper.style.transform = `scale(${scale})`;
    }

    // ============================================
    // Preset Management
    // ============================================
    
    applyPreset(presetName) {
        const settings = this.engine.applyPreset(presetName);
        
        if (!settings) return;
        
        // Update active preset button
        this.elements.presetBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === presetName);
        });
        
        this.state.activePreset = presetName;
        
        // Update UI controls
        this.updateControlsFromSettings(settings);
        
        // Regenerate sketch
        this.regenerateSketch();
    }

    updateControlsFromSettings(settings) {
        // Update sketch type dropdown
        this.elements.sketchType.value = settings.type;
        
        // Update sliders
        this.elements.intensitySlider.value = settings.intensity;
        this.elements.intensityValue.textContent = `${settings.intensity}%`;
        
        this.elements.contrastSlider.value = settings.contrast;
        this.elements.contrastValue.textContent = `${settings.contrast}%`;
        
        this.elements.brightnessSlider.value = settings.brightness;
        this.elements.brightnessValue.textContent = `${settings.brightness}%`;
        
        // Update checkbox
        this.elements.invertColors.checked = settings.invertColors;
    }

    // ============================================
    // Action Handlers
    // ============================================
    
    downloadSketch() {
        if (!this.state.imageLoaded) return;
        
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `sketchify-${timestamp}`;
        
        this.engine.downloadSketch(filename, 'png');
        this.showToast('Sketch downloaded successfully!', 'success');
    }

    resetSettings() {
        const settings = this.engine.reset();
        this.updateControlsFromSettings(settings);
        
        // Reset active preset
        this.elements.presetBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === 'soft-pencil');
        });
        this.state.activePreset = 'soft-pencil';
        
        this.showToast('Settings reset to default', 'info');
    }

    // ============================================
    // UI State Management
    // ============================================
    
    updateUIState() {
        const hasImage = this.state.imageLoaded;
        
        // Toggle empty state vs canvas display
        this.elements.emptyState.style.display = hasImage ? 'none' : 'block';
        this.elements.canvasDisplay.style.display = hasImage ? 'flex' : 'none';
        
        // Enable/disable action buttons
        this.elements.downloadBtn.disabled = !hasImage;
        this.elements.resetBtn.disabled = !hasImage;
    }

    showLoading(show) {
        this.state.isProcessing = show;
        this.elements.loadingOverlay.classList.toggle('active', show);
    }

    // ============================================
    // Toast Notifications
    // ============================================
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                ${this.getToastIcon(type)}
            </svg>
            <span>${message}</span>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getToastIcon(type) {
        switch (type) {
            case 'success':
                return '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
            case 'error':
                return '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
            case 'info':
            default:
                return '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>';
        }
    }

    // ============================================
    // Keyboard Shortcuts
    // ============================================
    
    handleKeyboard(e) {
        // Only handle if not in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch (e.key) {
            case 'd':
            case 'D':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.downloadSketch();
                }
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.resetSettings();
                }
                break;
            case '1':
                this.setView('split');
                break;
            case '2':
                this.setView('original');
                break;
            case '3':
                this.setView('sketch');
                break;
            case '+':
            case '=':
                this.zoom(10);
                break;
            case '-':
                this.zoom(-10);
                break;
            case '0':
                this.resetZoom();
                break;
        }
    }
}

// Export for potential external use
window.SketchifyApp = SketchifyApp;
