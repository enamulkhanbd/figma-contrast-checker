# WCAG Contrast Checker Figma Plugin

A powerful Figma plugin to ensure your designs meet WCAG 2.1 accessibility standards by checking color contrast for both text and non-text elements in real-time.

---

## How to Use

1.  **Select a Frame**: In your Figma file, select any frame, group, or section you want to check.
2.  **Run the Plugin**: Go to `Plugins` > `WCAG Contrast Checker`.
3.  **Scan Selection**: Click the **"Scan Selection"** button. The plugin will check the layers against the default WCAG AA standards or your custom-saved ratios.
4.  **View Results**: The plugin will display a list of all visible text and color layers from your selection.
5.  **Filter & Analyze**:
    - Use the **All**, **Text**, and **Colors** filters to sort the results.
    - Use the search bar to find specific layers by name.
6.  **Customize Settings**:
    - Click the **settings icon** (⚙️) in the header to open the settings page.
    - Switch between **Light** and **Dark** themes.
    - Adjust the minimum contrast ratios for different element types.
    - Click **"Reset to WCAG Defaults"** to restore the original ratios. Your settings are saved automatically.
7.  **Locate Layers**: Click on any item in the results list to select and zoom to that specific layer on your Figma canvas.

---

## Features Explained

- **Comprehensive Scanning**: Checks both text elements and non-text UI elements (like icons and shapes) for contrast compliance.
- **Customizable Contrast Ratios**: Go to the settings page to define your own minimum contrast ratios for normal text, large text, and UI/graphic elements. Your preferences are saved for future use.
- **Theme Switcher**: Choose between a light or dark theme from the settings page to match your preference.
- **Hidden Layer Detection**: The plugin automatically ignores any hidden layers (`visible: false`), so you only get results for what's actually visible.
- **Interactive Results List**:
  - **Two-Way Sync**: Clicking a layer on the canvas highlights it in the plugin, and clicking an item in the plugin selects it on the canvas.
  - **Visual Feedback**: Results are clearly marked with Pass (✅) or Fail (❌) icons.
  - **Color Swatches**: Color results include a visual swatch of the color being checked.
- **Advanced Filtering**: Quickly filter the results by type (All, Text, Color) or search for specific layers by name.

---

## How It Works

The plugin recursively scans through all layers within your selected frame.

1.  **Node Traversal**: It identifies all visible `TEXT` nodes and any other visible nodes that have a solid color fill.
2.  **Color Detection**:
    - For any given layer, it identifies its foreground color (the text color or the shape's fill).
    - It then traverses up the layer tree to find the first solid, opaque background color. If no background is found, it defaults to white.
3.  **WCAG Calculation**: It uses the official WCAG 2.1 formula to calculate the relative luminance of the foreground and background colors and determines their contrast ratio.
4.  **Compliance Check**: It compares the calculated ratio against the required minimums. By default, these are the WCAG AA standards, but it will use any custom ratios you have saved in the settings.

---

## Known Issues

- **Multiple Fills**: The plugin currently only checks the top-most solid fill on a layer. It does not analyze layers with gradients or multiple visible fills.

---

## Development Setup

To contribute or modify the plugin, follow these steps:

1.  **Clone the Repository**: Get a local copy of the plugin files.
2.  **Organize Files**: The project uses a `src` directory for source files (`code.ts`, `ui.html`) and a `dist` directory for the compiled output that Figma uses.
3.  **Install Dependencies**: Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```
4.  **Build the Plugin**: To compile your TypeScript and copy the HTML to the `dist` folder, run:
    ```bash
    npm run build
    ```
5.  **Watch for Changes**: For a better development workflow, run the watch script. This will automatically recompile `src/code.ts` into `dist/code.js` every time you save a change.
    ```bash
    npm run watch
    ```
    _Note: If you change `ui.html`, you will need to run `npm run build` again to copy it to the `dist` folder._

---

## How to Install in Figma

1.  **Open Figma**: Go to the main menu.
2.  **Navigate to Plugins**: Click `Plugins` > `Development` > `Import plugin from manifest...`.
3.  **Select Manifest File**: Locate the root `manifest.json` file in the plugin's directory and open it. This file is already configured to point to the compiled code in the `dist` folder.
4.  **Run the Plugin**: The WCAG Contrast Checker will now be available in your `Plugins` > `Development` menu.
