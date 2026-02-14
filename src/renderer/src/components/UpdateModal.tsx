import React, { useEffect, useCallback } from "react";
import { useUIStore } from "../store/useUIStore";

const UpdateModal: React.FC = () => {
  const {
    updateModalVisible,
    updateStatus,
    updateVersion,
    updateProgress,
    setUpdateModalVisible,
    setUpdateStatus,
    setUpdateVersion,
    setUpdateProgress,
  } = useUIStore();

  const handleClose = useCallback(() => {
    setUpdateModalVisible(false);
    setUpdateStatus("idle");
  }, [setUpdateModalVisible, setUpdateStatus]);

  const handleCheckUpdate = useCallback(() => {
    window.electronAPI.checkForUpdate?.();
  }, []);

  const handleDownload = useCallback(() => {
    window.electronAPI.downloadUpdate?.();
  }, []);

  const handleInstall = useCallback(() => {
    window.electronAPI.installUpdate?.();
  }, []);

  useEffect(() => {
    if (!window.electronAPI?.onUpdateEvent) return;

    const unsubscribe = window.electronAPI.onUpdateEvent((event, data) => {
      switch (event) {
        case "checking":
          setUpdateStatus("checking");
          setUpdateModalVisible(true);
          break;
        case "available":
          setUpdateStatus("idle");
          setUpdateVersion(data?.version || "");
          setUpdateModalVisible(true);
          break;
        case "downloading":
          setUpdateStatus("downloading");
          setUpdateProgress(data?.percent || 0);
          break;
        case "downloaded":
          setUpdateStatus("ready");
          setUpdateProgress(100);
          break;
        case "error":
          setUpdateStatus("error");
          break;
      }
    });

    return unsubscribe;
  }, [setUpdateStatus, setUpdateModalVisible, setUpdateVersion, setUpdateProgress]);

  if (!updateModalVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {updateStatus === "error" ? "更新失败" : updateStatus === "ready" ? "下载完成" : updateStatus === "downloading" ? "下载中" : "软件更新"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {updateStatus === "checking" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">检查更新中...</p>
          </div>
        )}

        {updateStatus === "idle" && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              版本 {updateVersion} 可用
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                稍后
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                下载更新
              </button>
            </div>
          </div>
        )}

        {updateStatus === "downloading" && (
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              下载中... {Math.round(updateProgress)}%
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${updateProgress}%` }}
              />
            </div>
          </div>
        )}

        {updateStatus === "ready" && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              更新已准备就绪，点击安装将重启应用
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                稍后
              </button>
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                立即安装
              </button>
            </div>
          </div>
        )}

        {updateStatus === "error" && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              更新过程中出现错误，请稍后重试
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                关闭
              </button>
              <button
                onClick={handleCheckUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                重试
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateModal;
