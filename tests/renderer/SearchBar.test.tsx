import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "../../src/renderer/src/components/SearchBar";
import { useUIStore } from "../../src/renderer/src/store/useUIStore";
import { useMindmapStore } from "../../src/renderer/src/store/useMindmapStore";

describe("SearchBar", () => {
  const mockSelectNode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useUIStore.setState({
      searchQuery: "",
      searchResults: [],
      searchIndex: -1,
    });
    useMindmapStore.setState({
      selectNode: mockSelectNode,
      data: {
        activeSheetId: "sheet-1",
        sheets: [
          {
            id: "sheet-1",
            nodes: {
              root: { id: "root", text: "中心主题", children: [], parentId: undefined },
            },
          },
        ],
      },
    });
  });

  it("renders search input correctly", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("搜索节点...");
    expect(input).toBeInTheDocument();
  });

  it("updates search query on input", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("搜索节点...");
    
    fireEvent.change(input, { target: { value: "test" } });
    expect(useUIStore.getState().searchQuery).toBe("test");
  });

  it("shows clear button when search query exists", () => {
    useUIStore.setState({ searchQuery: "test" });
    render(<SearchBar />);
    const clearButton = screen.getByRole("button");
    expect(clearButton).toBeInTheDocument();
  });

  it("clears search when clear button is clicked", () => {
    useUIStore.setState({ searchQuery: "test" });
    render(<SearchBar />);
    const clearButton = screen.getByRole("button");
    
    fireEvent.click(clearButton);
    expect(useUIStore.getState().searchQuery).toBe("");
    expect(useUIStore.getState().searchResults).toEqual([]);
    expect(useUIStore.getState().searchIndex).toBe(-1);
  });

  it("clears search on Escape key", () => {
    useUIStore.setState({ searchQuery: "test" });
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("搜索节点...");
    
    fireEvent.keyDown(input, { key: "Escape" });
    expect(useUIStore.getState().searchQuery).toBe("");
    expect(useUIStore.getState().searchResults).toEqual([]);
    expect(useUIStore.getState().searchIndex).toBe(-1);
  });

  it("displays search results when query matches", () => {
    useUIStore.setState({
      searchQuery: "test",
      searchResults: [
        { nodeId: "1", nodeText: "Test Node 1", path: ["中心主题", "Test Node 1"] },
      ],
      searchIndex: 0,
    });
    render(<SearchBar />);
    expect(screen.getByText("Test Node 1")).toBeInTheDocument();
  });

  it("navigates to search result on Enter key", () => {
    useUIStore.setState({
      searchQuery: "test",
      searchResults: [
        { nodeId: "1", nodeText: "Test Node 1", path: ["中心主题", "Test Node 1"] },
      ],
      searchIndex: 0,
    });
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("搜索节点...");
    
    fireEvent.keyDown(input, { key: "Enter", preventDefault: vi.fn() });
    expect(useUIStore.getState().searchIndex).toBe(0);
  });
});
