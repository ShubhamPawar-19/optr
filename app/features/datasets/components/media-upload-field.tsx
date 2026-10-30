
"use client";

import { useRef, useState } from "react";
import { LoaderCircle, Trash2, UploadCloud, X } from "lucide-react";

interface MediaUploadFieldProps {
  datasetId: string;
  fieldKey: string;
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function uploadToCloudinary(
  file: File,
  signature: UploadSignature,
  onProgress: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("folder", signature.folder);
    formData.append("signature", signature.signature);

    const xhr = new XMLHttpRequest();

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let response: { secure_url?: string; error?: { message?: string } };

      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Cloudinary returned an invalid response."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || !response.secure_url) {
        reject(
          new Error(
            response.error?.message || "Image upload failed.",
          ),
        );
        return;
      }

      resolve(response.secure_url);
    };

    xhr.onerror = () => reject(new Error("Network error during image upload."));
    xhr.onabort = () => reject(new Error("Image upload was cancelled."));

    xhr.send(formData);
  });
}

export function MediaUploadField({
  datasetId,
  fieldKey,
  value,
  onChange,
  disabled = false,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  async function handleFiles(fileList: FileList | File[]) {
    setError("");

    const files = Array.from(fileList);

    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - value.length;

    if (remainingSlots <= 0) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    if (files.length > remainingSlots) {
      setError(
        `You can add only ${remainingSlots} more image(s). Maximum is ${MAX_IMAGES}.`,
      );
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name}: Only JPEG, PNG and WebP images are supported.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name}: Image size must be 5 MB or less.`);
        return;
      }
    }

    setIsUploading(true);
    setProgress(0);

    let uploadedUrls = [...value];

    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const signatureResponse = await fetch("/api/uploads/cloudinary/sign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            datasetId,
            fieldKey,
          }),
        });

        const signatureData = await signatureResponse.json();

        if (!signatureResponse.ok) {
          throw new Error(
            signatureData.error || "Could not prepare image upload.",
          );
        }

        const imageUrl = await uploadToCloudinary(
          file,
          signatureData as UploadSignature,
          (fileProgress) => {
            const overallProgress = Math.round(
              ((index + fileProgress / 100) / files.length) * 100,
            );

            setProgress(overallProgress);
          },
        );

        uploadedUrls = [...uploadedUrls, imageUrl];
        onChange(uploadedUrls);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Something went wrong while uploading images.",
      );
    } finally {
      setIsUploading(false);
      setProgress(0);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, imageIndex) => imageIndex !== index));
    setError("");
  }

  return (
    <div className="mt-2 space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={disabled || isUploading || value.length >= MAX_IMAGES}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            void handleFiles(event.target.files);
          }
        }}
      />

      <button
        type="button"
        disabled={disabled || isUploading || value.length >= MAX_IMAGES}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-8 text-center transition ${
          isDragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-300 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/40"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-indigo-600 shadow-sm">
          <UploadCloud size={21} />
        </span>

        <span className="mt-3 text-sm font-semibold text-[#292923]">
          Click to upload or drag and drop
        </span>

        <span className="mt-1 text-xs text-[#292923]/50">
          JPEG, PNG or WebP · Maximum 5 MB per image
        </span>

        <span className="mt-2 text-xs font-medium text-[#292923]/60">
          {value.length} of {MAX_IMAGES} images uploaded
        </span>
      </button>

      {isUploading && (
        <div
          className="rounded-lg border border-indigo-100 bg-indigo-50 p-3"
          role="status"
          aria-live="polite"
        >
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-indigo-800">
            <span className="flex items-center gap-2">
              <LoaderCircle size={14} className="animate-spin" />
              Uploading images...
            </span>
            <span>{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
            >
              <img
                src={url}
                alt={`Uploaded image ${index + 1}`}
                className="size-full object-cover"
              />

              <button
                type="button"
                disabled={disabled || isUploading}
                onClick={() => removeImage(index)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>

              <span className="absolute bottom-0 left-0 right-0 truncate bg-black/55 px-2 py-1.5 text-[10px] text-white">
                Image {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
        >
          <X size={15} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <p className="text-xs leading-5 text-[#292923]/50">
        Images are stored securely and their URLs are saved with this dataset
        record. Removing an image here removes it from the record; it does not
        delete the original file from Cloudinary.
      </p>
    </div>
  );
}
