import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useUIStore } from "../../../src/renderer/src/store/useUIStore";
import UpdateModal from "../../../src/renderer/src/components/UpdateModal";

// Mock window.electronAPI
beforeAll(() => {
  Object.defineProperty(window, "electronAPI", {
    value: {
      checkForUpdate: vi.fn(),
      downloadUpdate: vi.fn(),
      installUpdate: vi.fn(),
      onUpdateEvent: vi.fn(() => () => {}),
    },
    writable: true,
  });
});

describe("UpdateModal", () => {
  beforeEach(() => {
    useUIStore.setState({
      updateModalVisible: false,
      updateStatus: "idle",
      updateVersion: "",
      updateProgress: 0,
    });
  });

  it("does not render when updateModalVisible is false", () => {
    render(<UpdateModal />);
    expect(screen.queryByText("更新可用")).not.toBeInTheDocument();
  });

  it("renders when updateModalVisible is true and status is checking", () => {
    useUIStore.setState({ updateModalVisible: true, updateStatus: "checking" });
    render(<UpdateModal />);
    expect(screen.getByText("检查更新中...")).toBeInTheDocument();
  });

  it("renders update available dialog", () => {
    useUIStore.setState({
      updateModalVisible: true,
      updateStatus: "idle",
      updateVersion: "1.4.0",
    });
    render(<UpdateModal />);
    expect(screen.getByText("软件更新")).toBeInTheDocument();
    expect(screen.getByText(/版本 1\.4\.0 可用/)).toBeInTheDocument();
  });

  it("renders downloading progress", () => {
    useUIStore.setState({
      updateModalVisible: true,
      updateStatus: "downloading",
      updateProgress: 50,
    });
    render(<UpdateModal />);
    expect(screen.getByText("下载中")).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it("renders ready to install dialog", () => {
    useUIStore.setState({
      updateModalVisible: true,
      updateStatus: "ready",
    });
    render(<UpdateModal />);
    expect(screen.getByText("下载完成")).toBeInTheDocument();
    expect(screen.getByText("立即安装")).toBeInTheDocument();
  });

  it("renders error state", () => {
    useUIStore.setState({
      updateModalVisible: true,
      updateStatus: "error",
    });
    render(<UpdateModal />);
    expect(screen.getByText("更新失败")).toBeInTheDocument();
  });

  it("closes modal when cancel button is clicked", () => {
    useUIStore.setState({ updateModalVisible: true });
    render(<UpdateModal />);
    fireEvent.click(screen.getByText("稍后"));
    expect(useUIStore.getState().updateModalVisible).toBe(false);
  });

  it("closes modal when close button (X) is clicked", () => {
    useUIStore.setState({ updateModalVisible: true });
    render(<UpdateModal />);
    fireEvent.click(screen.getByText("×"));
    expect(useUIStore.getState().updateModalVisible).toBe(false);
  });
});
