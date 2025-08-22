// This plugin scans the user's selection for text and solid color nodes,
// calculates their color contrast against their background, and reports
// whether they meet WCAG 2.1 AA standards.

figma.showUI(__html__, { width: 400, height: 700 });

// Listen for selection changes on the Figma canvas and notify the UI
figma.on("selectionchange", () => {
  const selectedIds = figma.currentPage.selection.map((node) => node.id);
  figma.ui.postMessage({ type: "selection-changed", ids: selectedIds });
});

figma.ui.onmessage = async (msg) => {
  if (msg.type === "scan-selection") {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({
        type: "scan-results",
        results: [],
        error: "Please select a frame, group, or section to scan.",
      });
      return;
    }

    // Get custom ratios from settings, with fallbacks to WCAG defaults
    const customRatios = msg.ratios || {
      normalText: 4.5,
      largeText: 3,
      nonText: 3,
    };

    const allTextNodes = findAllTextNodes(selection);
    const allColorNodes = findAllSolidFillNodes(selection);

    const textResultsPromises = allTextNodes.map(async (textNode) => {
      if (textNode.removed) return null;
      const textColor = getTextColor(textNode);
      const backgroundColor = getBackgroundColor(textNode);
      if (textColor && backgroundColor) {
        const contrastRatio = getContrastRatio(textColor, backgroundColor);
        await figma.loadFontAsync(textNode.fontName as FontName);
        const fontSize = textNode.fontSize as number;
        const fontWeight = textNode.fontWeight as number;
        const isLarge = isLargeText(fontSize, fontWeight);
        const requiredRatio = isLarge
          ? customRatios.largeText
          : customRatios.normalText;
        return {
          type: "text",
          name: textNode.characters.substring(0, 50),
          contrast: contrastRatio.toFixed(2),
          id: textNode.id,
          pass: contrastRatio >= requiredRatio,
          required: requiredRatio,
        };
      }
      return null;
    });

    const colorResultsPromises = allColorNodes.map(async (colorNode) => {
      if (colorNode.removed) return null;
      const foregroundColor = getSolidFill(colorNode);
      const backgroundColor = getBackgroundColor(colorNode);
      if (foregroundColor && backgroundColor) {
        const contrastRatio = getContrastRatio(
          foregroundColor,
          backgroundColor,
        );
        const requiredRatio = customRatios.nonText;
        return {
          type: "color",
          name: colorNode.name,
          hex: rgbToHex(foregroundColor),
          contrast: contrastRatio.toFixed(2),
          id: colorNode.id,
          pass: contrastRatio >= requiredRatio,
          required: requiredRatio,
        };
      }
      return null;
    });

    const textResults = await Promise.all(textResultsPromises);
    const colorResults = await Promise.all(colorResultsPromises);
    const allResults = [...textResults, ...colorResults].filter(
      (res) => res !== null,
    );
    figma.ui.postMessage({ type: "scan-results", results: allResults });
  } else if (msg.type === "select-node") {
    const node = figma.getNodeById(msg.id);
    if (node) {
      figma.currentPage.selection = [node as SceneNode];
      figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
    }
  } else if (msg.type === "save-settings") {
    await figma.clientStorage.setAsync("customRatios", msg.ratios);
  } else if (msg.type === "load-settings") {
    const ratios = await figma.clientStorage.getAsync("customRatios");
    figma.ui.postMessage({ type: "settings-loaded", ratios: ratios });
  }
};

function findAllTextNodes(nodes: readonly SceneNode[]): TextNode[] {
  let textNodes: TextNode[] = [];
  for (const node of nodes) {
    if (!node.visible) continue; // Skip hidden layers
    if (node.type === "TEXT") {
      textNodes.push(node);
    } else if ("children" in node) {
      textNodes = textNodes.concat(findAllTextNodes(node.children));
    }
  }
  return textNodes;
}

function findAllSolidFillNodes(nodes: readonly SceneNode[]): SceneNode[] {
  let solidNodes: SceneNode[] = [];
  for (const node of nodes) {
    if (!node.visible) continue; // Skip hidden layers
    if (node.type !== "TEXT" && "fills" in node && Array.isArray(node.fills)) {
      if (node.fills.some((fill) => fill.type === "SOLID" && fill.visible)) {
        solidNodes.push(node);
      }
    }
    if ("children" in node) {
      solidNodes = solidNodes.concat(findAllSolidFillNodes(node.children));
    }
  }
  return solidNodes;
}

function getTextColor(textNode: TextNode): RGB | null {
  if (Array.isArray(textNode.fills) && textNode.fills.length > 0) {
    const firstFill = textNode.fills[0];
    if (firstFill.type === "SOLID" && firstFill.visible) {
      return firstFill.color;
    }
  }
  return null;
}

function getSolidFill(node: SceneNode): RGB | null {
  if ("fills" in node && Array.isArray(node.fills)) {
    for (let i = node.fills.length - 1; i >= 0; i--) {
      const fill = node.fills[i];
      if (fill.type === "SOLID" && fill.visible) {
        return fill.color;
      }
    }
  }
  return null;
}

function getBackgroundColor(node: SceneNode): RGB | null {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "PAGE" || parent.type === "DOCUMENT") {
      return { r: 1, g: 1, b: 1 };
    }
    if (
      "fills" in parent &&
      Array.isArray(parent.fills) &&
      parent.fills.length > 0
    ) {
      for (let i = parent.fills.length - 1; i >= 0; i--) {
        const fill = parent.fills[i];
        if (fill.type === "SOLID" && fill.visible && fill.opacity === 1) {
          return fill.color;
        }
      }
    }
    parent = parent.parent;
  }
  return { r: 1, g: 1, b: 1 };
}

function getRelativeLuminance(color: RGB): number {
  const sRGB = [color.r, color.g, color.b];
  const lum = sRGB.map((c) => {
    if (c <= 0.03928) {
      return c / 12.92;
    } else {
      return Math.pow((c + 0.055) / 1.055, 2.4);
    }
  });
  return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
}

function getContrastRatio(color1: RGB, color2: RGB): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function isLargeText(fontSize: number, fontWeight: number): boolean {
  const isBold = fontWeight >= 700;
  return (isBold && fontSize >= 18.66) || fontSize >= 24;
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (c: number) =>
    ("0" + Math.round(c * 255).toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
