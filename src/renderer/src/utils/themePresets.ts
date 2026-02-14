import { ThemeConfig } from "../../../shared/types";

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  business: {
    name: "商务专业",
    backgroundColor: "#F0FDFA", // 使用设计令牌中的背景色
    lineStyle: "step",
    palette: ["#0D9488", "#14B8A6", "#0F766E", "#134E4A"], // Teal 调色板
    rootStyle: {
      backgroundColor: "#0D9488", // Brand color
      color: "#FFFFFF",
      borderColor: "#0D9488",
      borderWidth: 0,
      fontSize: 24,
      shape: "rounded", // 修改为更现代的圆角矩形
      borderRadius: 8,
      shadowBlur: 10,
      shadowColor: "rgba(13, 148, 136, 0.2)",
    },
    primaryStyle: {
      backgroundColor: "#FFFFFF",
      color: "#134E4A",
      borderColor: "#CCF2ED",
      borderWidth: 2,
      fontSize: 18,
      shape: "rounded",
      borderRadius: 6,
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#5E7E7B",
      borderColor: "transparent",
      borderWidth: 0,
      fontSize: 14,
      shape: "underline",
    },
  },
  fresh: {
    name: "清新薄荷",
    backgroundColor: "#F0FDF4",
    lineStyle: "bezier",
    palette: ["#10B981", "#34D399", "#059669", "#064E3B"],
    rootStyle: {
      backgroundColor: "#10B981",
      color: "#FFFFFF",
      borderColor: "#10B981",
      borderWidth: 0,
      fontSize: 24,
      shape: "capsule",
      borderRadius: 20,
    },
    primaryStyle: {
      backgroundColor: "#DCFCE7",
      color: "#064E3B",
      borderColor: "#BBF7D0",
      borderWidth: 1,
      fontSize: 18,
      shape: "rounded",
      borderRadius: 12,
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#065F46",
      borderColor: "#BBF7D0",
      borderWidth: 0,
      fontSize: 14,
      shape: "rounded",
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
      borderWidth: 1,
      fontSize: 14,
      shape: "underline",
    },
  },
  vibrant: {
    name: "活力橙光",
    backgroundColor: "#FFF7ED",
    lineStyle: "bezier",
    palette: ["#F97316", "#FB923C", "#EA580C", "#7C2D12"], // Accent color palette
    rootStyle: {
      backgroundColor: "#F97316",
      color: "#FFFFFF",
      borderColor: "#F97316",
      borderWidth: 0,
      fontSize: 24,
      shape: "diamond",
      borderRadius: 4,
    },
    primaryStyle: {
      backgroundColor: "#FFEDD5",
      color: "#7C2D12",
      borderColor: "#FED7AA",
      borderWidth: 1,
      fontSize: 18,
      shape: "rounded",
      borderRadius: 8,
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#9A3412",
      borderColor: "transparent",
      borderWidth: 0,
      fontSize: 14,
      shape: "underline",
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
  handDrawn: {
    name: "手绘草图",
    backgroundColor: "#fffef0",
    lineStyle: "hand-drawn",
    palette: ["#E74C3C", "#3498DB", "#F1C40F", "#2ECC71"],
    rootStyle: {
      backgroundColor: "transparent",
      color: "#333",
      borderColor: "#333",
      borderWidth: 2,
      fontSize: 24,
      shape: "cloud",
    },
    primaryStyle: {
      backgroundColor: "transparent",
      color: "#333",
      borderColor: "#333",
      borderWidth: 2,
      fontSize: 18,
      shape: "ellipse",
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#333",
      borderWidth: 0,
      fontSize: 14,
      shape: "underline",
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
      borderWidth: 1,
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
      borderWidth: 1,
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
  handDrawn: {
    name: "手绘草图 (Dark)",
    backgroundColor: "#2C3E50", // Dark slate background
    lineStyle: "hand-drawn",
    palette: ["#E74C3C", "#3498DB", "#F1C40F", "#2ECC71"],
    rootStyle: {
      backgroundColor: "transparent",
      color: "#ECF0F1", // Light grey text
      borderColor: "#ECF0F1",
      borderWidth: 2,
      fontSize: 24,
      shape: "cloud",
    },
    primaryStyle: {
      backgroundColor: "transparent",
      color: "#ECF0F1",
      borderColor: "#ECF0F1",
      borderWidth: 2,
      fontSize: 18,
      shape: "ellipse",
    },
    secondaryStyle: {
      backgroundColor: "transparent",
      color: "#ECF0F1",
      borderWidth: 0,
      fontSize: 14,
      shape: "underline",
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
