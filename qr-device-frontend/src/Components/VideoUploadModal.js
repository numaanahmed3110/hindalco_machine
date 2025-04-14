import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import "./VideoUploadModal.css";

const VideoUploadModal = ({ isOpen, onClose, deviceId, onUploadSuccess }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid video file");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a video file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Check if user is authenticated and has admin role
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login with return URL
        const returnUrl = `/device-view/${deviceId}`;
        navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
        onClose();
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.role !== "admin") {
        setError("Only admin users can upload tutorial videos");
        return;
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${deviceId}-${Date.now()}.${fileExt}`;

      // Get the auth token to include in the request
      const {
        data: { session: sessionToken },
      } = await supabase.auth.getSession();
      if (!sessionToken) {
        throw new Error("Authentication session expired. Please log in again.");
      }

      // Make sure we're using the authenticated client for storage operations
      // eslint-disable-next-line no-unused-vars
      const { data, error: uploadError } = await supabase.storage
        .from("tutorial-vidoes")
        .upload(fileName, file, {
          upsert: true,
          cacheControl: "3600",
          // Pass user metadata to ensure role-based policy check works
          metadata: {
            role: session?.user?.user_metadata?.role || "user",
          },
          // // Add authorization headers to match the bucket policy
          // headers: {
          //   Authorization: `Bearer ${sessionToken.access_token}`,
          //   "x-supabase-auth-role":
          //     session?.user?.user_metadata?.role || "user",
          // },
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(uploadError.message || "Failed to upload video");
      }

      // Get public URL
      const {
        data: { publicUrl },
        error: urlError,
      } = supabase.storage.from("tutorial-vidoes").getPublicUrl(fileName);

      if (urlError) throw urlError;

      // Use the new dedicated endpoint for updating tutorial videos
      console.log("Updating tutorial video for device:", deviceId);
      console.log("Video URL:", publicUrl);

      try {
        // Log request details
        console.log(
          "Making API request to:",
          `/devices/${deviceId}/tutorial-video`
        );
        console.log("Request payload:", { videoUrl: publicUrl });

        const response = await apiClient.patch(
          `/devices/${deviceId}/tutorial-video`,
          {
            videoUrl: publicUrl,
          }
        );
        console.log("Video upload API response:", response.data);
      } catch (error) {
        // Enhanced error logging
        console.error("API Error Details:");
        console.error("- Status:", error.response?.status);
        console.error("- Status Text:", error.response?.statusText);
        console.error("- Response Data:", error.response?.data);
        console.error("- Request URL:", error.config?.url);
        console.error("- Request Method:", error.config?.method);

        throw new Error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            `Failed to update device with video URL (${
              error.response?.status || "unknown error"
            })`
        );
      }

      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error("Error uploading video:", err);
      setError("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Upload Tutorial Video</h2>

        <div className="upload-container">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {file && <p className="file-name">{file.name}</p>}
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </div>
    </div>
  );
};

export default VideoUploadModal;
