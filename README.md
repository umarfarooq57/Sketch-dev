# Sketchify – AI Sketch Studio 🎨

A professional web application that transforms your photos into stunning hand-drawn sketches using advanced image processing algorithms.

![Sketchify Preview](assets/preview.png)

## ✨ Features

### Sketch Styles
- **Soft Pencil** - Classic light pencil sketch with subtle shading
- **Dark Pencil** - Bold pencil strokes with enhanced contrast
- **Charcoal** - Dramatic charcoal effect with rich textures
- **Ink Drawing** - Clean, high-contrast ink-style outlines

### Adjustments
- **Intensity Slider** - Control the strength of the sketch effect
- **Contrast Slider** - Adjust the contrast levels
- **Brightness Slider** - Fine-tune the overall brightness
- **Invert Colors** - Toggle between normal and inverted colors

### User Experience
- 🖼️ Drag & drop image upload
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🌓 Dark/Light mode toggle
- 🔍 Zoom controls for detailed viewing
- ⬇️ Download sketch in high-quality PNG format
- 👁️ Split view, original only, or sketch only viewing modes
- ⚡ Real-time sketch processing

## 🚀 Getting Started

### Quick Start
1. Clone or download the project
2. Open `index.html` in a modern web browser
3. Click "Launch App" or navigate to `app.html`
4. Upload an image and start creating!

### Folder Structure
```
Sketch/
├── index.html          # Landing page
├── app.html            # Main application
├── css/
│   └── styles.css      # All styles with dark/light mode
├── js/
│   ├── landing.js      # Landing page scripts
│   ├── app.js          # Application controller
│   └── sketch.js       # Sketch processing engine
├── assets/             # Images and icons
└── README.md           # Documentation
```

## 💻 Technology Stack

- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Modern styling with CSS Grid, Flexbox, CSS Variables
- **Vanilla JavaScript** - No dependencies, pure ES6+
- **Canvas API** - Image processing and rendering

## 🎯 How It Works

### Sketch Algorithm
1. **Grayscale Conversion** - Convert image to grayscale using luminosity formula
2. **Invert & Blur** - Create an inverted, blurred copy
3. **Color Dodge Blend** - Apply color dodge blending between original and blurred
4. **Edge Enhancement** - Apply Sobel edge detection for detail
5. **Post-Processing** - Adjust brightness, contrast, and apply effects

### Supported Formats
- JPEG/JPG
- PNG
- Maximum file size: 10MB

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `1` | Split view |
| `2` | Original view |
| `3` | Sketch view |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |
| `Ctrl/Cmd + D` | Download sketch |
| `Ctrl/Cmd + R` | Reset settings |

## 🎨 Style Presets

### Soft Pencil
- Intensity: 40%
- Contrast: 45%
- Brightness: 55%
- Best for: Portraits, soft subjects

### Dark Pencil
- Intensity: 70%
- Contrast: 60%
- Brightness: 45%
- Best for: Dramatic portraits, high contrast images

### Charcoal
- Intensity: 65%
- Contrast: 70%
- Brightness: 40%
- Best for: Artistic renderings, landscapes

### Ink
- Intensity: 80%
- Contrast: 85%
- Brightness: 50%
- Best for: Line art, comic style, logos

## 📱 Responsive Breakpoints

| Breakpoint | Description |
|------------|-------------|
| > 1200px | Full 3-panel layout |
| 1024px - 1200px | Compact panels |
| 768px - 1024px | Stacked layout |
| < 768px | Mobile optimized |

## 🌙 Dark Mode

Dark mode is automatically saved to localStorage and persists across sessions. Toggle using the sun/moon icon in the navigation bar.

## 🔧 Customization

### Adding New Presets
Edit `js/sketch.js` and add to the `presets` object:

```javascript
this.presets = {
    'custom-preset': {
        type: 'pencil',
        intensity: 50,
        contrast: 50,
        brightness: 50,
        invertColors: false
    }
};
```

### Modifying Colors
Edit CSS variables in `css/styles.css`:

```css
:root {
    --color-primary: #6366f1;
    --color-secondary: #ec4899;
    /* ... */
}
```

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- Fonts: [Inter](https://fonts.google.com/specimen/Inter) & [Playfair Display](https://fonts.google.com/specimen/Playfair+Display)
- Icons: Custom SVG icons

---

Made with ❤️ for artists everywhere

**Sketchify © 2026**
"# Sketch-dev" 
