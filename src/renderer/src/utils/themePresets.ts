import { ThemeConfig } from "../../../shared/types";

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  business: {
    name: "商务专业",
    backgroundColor: "#F5F7FA",
    lineStyle: "step",
    palette: ["#34495E", "#7F8C8D", "#2980B9", "#16A085"],
    rootStyle: {
      backgroundColor: "#2C3E50",
      color: "#FFFFFF",
      borderColor: "#2C3E50",
      borderWidth: 0,
      fontSize: 24,
      shape: "rectangle",
      borderRadius: 2,
    },
    primaryStyle: {
      backgroundColor: "#FFFFFF",
      color: "#2C3E50",
      borderColor: "#34495E",
      borderWidth: 2,
      fontSize: 18,
      shape: "rectangle",
      borderRadius: 2,
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#34495E",
      borderWidth: 0,
      fontSize: 14,
      shape: "underline",
    },
  },
  fresh: {
    name: "清新薄荷",
    backgroundColor: "#FFFFFF",
    lineStyle: "bezier",
    palette: ["#FF6B6B", "#FFE66D", "#1A535C", "#F7FFF7"],
    rootStyle: {
      backgroundColor: "#4ECDC4",
      color: "#FFFFFF",
      borderWidth: 0,
      fontSize: 24,
      shape: "capsule",
    },
    primaryStyle: {
      backgroundColor: "#F7FFF7",
      color: "#1A535C",
      borderColor: "#4ECDC4",
      borderWidth: 2,
      fontSize: 18,
      shape: "rounded",
      borderRadius: 16,
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#2D3436",
      borderWidth: 0,
      fontSize: 14,
      shape: "rounded",
      borderRadius: 8,
    },
  },
  minimal: {
    name: "极简黑白",
    backgroundColor: "#FFFFFF",
    lineStyle: "straight",
    palette: ["#000000", "#333333"],
    rootStyle: {
      backgroundColor: "#000000",
      color: "#FFFFFF",
      borderWidth: 0,
      fontSize: 24,
      shape: "rounded",
      borderRadius: 8,
    },
    primaryStyle: {
      backgroundColor: "#FFFFFF",
      color: "#000000",
      borderColor: "#000000",
      borderWidth: 2,
      fontSize: 18,
      shape: "underline",
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#000000",
      borderWidth: 0,
      fontSize: 14,
      shape: "underline",
    },
  },
  vibrant: {
    name: "活力橙光",
    backgroundColor: "#FFF5F0",
    lineStyle: "bezier",
    palette: ["#EE5253", "#FECA57", "#FF9FF3", "#54A0FF"],
    rootStyle: {
      backgroundColor: "#FF9F43",
      color: "#FFFFFF",
      borderWidth: 0,
      fontSize: 24,
      shape: "cloud",
    },
    primaryStyle: {
      backgroundColor: "#FFFFFF",
      color: "#EE5253",
      borderColor: "#FF9F43",
      borderWidth: 3,
      fontSize: 18,
      shape: "rounded",
      borderRadius: 12,
    },
    secondaryStyle: {
      backgroundColor: "#FFFFFF",
      color: "#2D3436",
      borderColor: "#FECA57",
      borderWidth: 1,
      fontSize: 14,
      shape: "rounded",
      borderRadius: 8,
    },
  },
  dark: {
    name: "赛博科技 (Dark)", // Renamed from Dark Neon
    backgroundColor: "#1E1E1E",
    lineStyle: "straight",
    palette: ["#00FF9D", "#FF0055", "#00D2FF", "#FF00FF"],
    rootStyle: {
      backgroundColor: "transparent",
      color: "#FFFFFF",
      borderColor: "#00FF9D",
      borderWidth: 2,
      fontSize: 24,
      shape: "hexagon",
      shadowColor: "#00FF9D",
      shadowBlur: 10,
    },
    primaryStyle: {
      backgroundColor: "transparent",
      color: "#FFFFFF",
      borderColor: "#FF0055",
      borderWidth: 1,
      fontSize: 18,
      shape: "rectangle",
      shadowColor: "#FF0055",
      shadowBlur: 5,
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#00D2FF",
      borderColor: "#00D2FF",
      borderWidth: 1,
      fontSize: 14,
      shape: "rectangle",
      shadowColor: "#00D2FF",
      shadowBlur: 3,
    },
  },
};

export const THEME_PRESETS_DARK: Record<string, ThemeConfig> = {
  business: {
    name: "商务专业 (Dark)",
    backgroundColor: "#1E1E1E",
    lineStyle: "step",
    palette: ["#5D9CEC", "#48C774", "#AC92EC", "#AAB7B8"],
    rootStyle: {
      backgroundColor: "#4B6584",
      color: "#FFFFFF",
      borderColor: "#4B6584",
      borderWidth: 0,
      fontSize: 24,
      shape: "rectangle",
      borderRadius: 2,
    },
    primaryStyle: {
      backgroundColor: "#2C3E50", // Adjusted for contrast
      color: "#FFFFFF",
      borderColor: "#4B6584",
      borderWidth: 2,
      fontSize: 18,
      shape: "rectangle",
      borderRadius: 2,
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#A4B0BE",
      borderWidth: 0,
      fontSize: 14,
      shape: "underline",
    },
  },
  fresh: {
    name: "清新薄荷 (Dark)",
    backgroundColor: "#263238",
    lineStyle: "bezier",
    palette: ["#FF8A80", "#FFFF8D", "#80CBC4", "#F48FB1"],
    rootStyle: {
      backgroundColor: "#00BFA5",
      color: "#FFFFFF",
      borderWidth: 0,
      fontSize: 24,
      shape: "capsule",
    },
    primaryStyle: {
      backgroundColor: "#37474F", // Darker background for contrast
      color: "#E0F2F1",
      borderColor: "#00BFA5",
      borderWidth: 2,
      fontSize: 18,
      shape: "rounded",
      borderRadius: 16,
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#E0F2F1",
      borderWidth: 0,
      fontSize: 14,
      shape: "rounded",
      borderRadius: 8,
    },
  },
  minimal: {
    name: "极简黑白 (Dark)",
    backgroundColor: "#000000",
    lineStyle: "straight",
    palette: ["#FFFFFF", "#CCCCCC"],
    rootStyle: {
      backgroundColor: "#FFFFFF",
      color: "#000000",
      borderWidth: 0,
      fontSize: 24,
      shape: "rounded",
      borderRadius: 8,
    },
    primaryStyle: {
      backgroundColor: "#000000",
      color: "#FFFFFF",
      borderColor: "#FFFFFF",
      borderWidth: 2,
      fontSize: 18,
      shape: "underline",
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#FFFFFF",
      borderWidth: 0,
      fontSize: 14,
      shape: "underline",
    },
  },
  vibrant: {
    name: "活力橙光 (Dark)",
    backgroundColor: "#2D241E",
    lineStyle: "bezier",
    palette: ["#FF7675", "#FDCB6E", "#E056FD", "#74B9FF"],
    rootStyle: {
      backgroundColor: "#E67E22",
      color: "#FFFFFF",
      borderWidth: 0,
      fontSize: 24,
      shape: "cloud",
    },
    primaryStyle: {
      backgroundColor: "#2D241E",
      color: "#FFFFFF",
      borderColor: "#E67E22",
      borderWidth: 3,
      fontSize: 18,
      shape: "rounded",
      borderRadius: 12,
    },
    secondaryStyle: {
      backgroundColor: "#2D241E",
      color: "#FFEAA7",
      borderColor: "#FDCB6E",
      borderWidth: 1,
      fontSize: 14,
      shape: "rounded",
      borderRadius: 8,
    },
  },
  dark: {
    name: "赛博科技 (Dark)", // Renamed from Dark Neon
    backgroundColor: "#1E1E1E",
    lineStyle: "straight",
    palette: ["#00FF9D", "#FF0055", "#00D2FF", "#FF00FF"],
    rootStyle: {
      backgroundColor: "transparent",
      color: "#FFFFFF",
      borderColor: "#00FF9D",
      borderWidth: 2,
      fontSize: 24,
      shape: "hexagon",
      shadowColor: "#00FF9D",
      shadowBlur: 10,
    },
    primaryStyle: {
      backgroundColor: "transparent",
      color: "#FFFFFF",
      borderColor: "#FF0055",
      borderWidth: 1,
      fontSize: 18,
      shape: "rectangle",
      shadowColor: "#FF0055",
      shadowBlur: 5,
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#00D2FF",
      borderColor: "#00D2FF",
      borderWidth: 1,
      fontSize: 14,
      shape: "rectangle",
      shadowColor: "#00D2FF",
      shadowBlur: 3,
    },
  },
};

export const getThemeConfig = (
  themeName: string,
  mode: "light" | "dark" = "light",
): ThemeConfig => {
  const baseTheme = THEME_PRESETS[themeName] || THEME_PRESETS.business;

  if (mode === "dark" && THEME_PRESETS_DARK[themeName]) {
    return {
      ...baseTheme,
      ...THEME_PRESETS_DARK[themeName],
      // Ensure palette and other non-style props are also carried over if redefined
    };
  }

  // For 'dark' theme (Cyber Tech), it's natively dark, but we might want a light version?
  // Spec says: Light Mode: Cyber Tech (Clear Tech Blue)
  if (themeName === "dark" && mode === "light") {
    return {
      name: "赛博科技 (Light)",
      backgroundColor: "#F0F4F8",
      lineStyle: "straight",
      palette: ["#3498DB", "#9B59B6", "#2ECC71", "#E74C3C"],
      rootStyle: {
        backgroundColor: "#FFFFFF",
        color: "#2980B9",
        borderColor: "#3498DB",
        borderWidth: 2,
        fontSize: 24,
        shape: "hexagon", // Or diamond as per spec
      },
      primaryStyle: {
        backgroundColor: "transparent",
        color: "#2C3E50",
        borderColor: "#3498DB",
        borderWidth: 1,
        fontSize: 18,
        shape: "rectangle",
      },
      secondaryStyle: {
        backgroundColor: "transparent",
        color: "#2C3E50",
        borderColor: "#3498DB",
        borderWidth: 1,
        fontSize: 14,
        shape: "rectangle",
      },
    };
  }

  return baseTheme;
};
