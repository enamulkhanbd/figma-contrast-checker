# WCAG Contrast Checker Figma Plugin

A powerful Figma plugin to ensure your designs meet WCAG 2.1 accessibility standards by checking color contrast for both text and non-text elements in real-time.

---

## How to Use

1.  **Select a Frame**: In your Figma file, select any frame, group, or section you want to check.
2.  **Run the Plugin**: Go to `Plugins` > `WCAG Contrast Checker`.
3.  **Scan Selection**: Click the **"Scan Selection"** button in the plugin window.
4.  **View Results**: The plugin will display a list of all visible text and color layers from your selection.
5.  **Filter & Analyze**:
    - Use the **All**, **Text**, and **Colors** filters to sort the results.
    - Toggle between **AA** and **AAA** standards for text elements.
    - Use the search bar to find specific layers by name.
6.  **Locate Layers**: Click on any item in the results list to select and zoom to that specific layer on your Figma canvas.

---

## Features Explained

- **Comprehensive Scanning**: Checks both text elements and non-text UI elements (like icons and shapes) for WCAG contrast compliance.
- **Dual WCAG Standards**: Easily toggle between **AA** and the stricter **AAA** compliance levels for text contrast. Non-text elements are checked against the required `3:1` ratio.
- **Hidden Layer Detection**: The plugin automatically ignores any hidden layers (`visible: false`) in your selection, so you only get results for what's actually visible in your design.
- **Interactive Results List**:
  - **Two-Way Sync**: Clicking a layer on the canvas highlights it in the plugin, and clicking an item in the plugin selects it on the canvas.
  - **Visual Feedback**: Results are clearly marked with Pass (✅) or Fail (❌) icons.
  - **Color Swatches**: Color results include a visual swatch of the color being checked.
- **Advanced Filtering**: Quickly filter the results by type (All, Text, Color) or search for specific layers by name.
- **Sleek Dark Mode UI**: A clean, dark-themed interface that's easy on the eyes.

---

## How It Works

The plugin recursively scans through all layers within your selected frame.

1.  **Node Traversal**: It identifies all visible `TEXT` nodes and any other visible nodes that have a solid color fill.
2.  **Color Detection**:
    - For any given layer, it identifies its foreground color (the text color or the shape's fill).
    - It then traverses up the layer tree to find the first solid, opaque background color. If no background is found, it defaults to white.
3.  **WCAG Calculation**: It uses the official WCAG 2.1 formula to calculate the relative luminance of the foreground and background colors and determines their contrast ratio.
4.  **Compliance Check**:
    - **Text**: Compares the ratio against `4.5:1` (AA) / `7:1` (AAA) for normal text, and `3:1` (AA) / `4.5:1` (AAA) for large text.
    - **Colors**: Compares the ratio against the standard `3:1` for non-text elements.

---

## Development Setup

To contribute or modify the plugin, follow these steps:

1.  **Clone the Repository**: Get a local copy of the plugin files.
2.  **Install Dependencies**: Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```
3.  **Start the Compiler**: Run the build script in watch mode. This will automatically recompile `code.ts` into `code.js` every time you save a change.
    ```bash
    npm run build
    ```

---

## How to Install in Figma

1.  **Open Figma**: Go to the main menu.
2.  **Navigate to Plugins**: Click `Plugins` > `Development` > `Import plugin from manifest...`.
3.  **Select Manifest File**: Locate the `manifest.json` file in the plugin's directory and open it.
4.  **Run the Plugin**: The WCAG Contrast Checker will now be available in your `Plugins` > `Development` menu.
