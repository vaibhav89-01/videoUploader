"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  upload,
  // Removed: ImageKitUploadResponse is not exported by @imagekit/next
  ImageKitInvalidRequestError,
  ImageKitUploadNetworkError,
  ImageKitServerError,
  ImageKitAbortError
} from "@imagekit/next";

type FormData = {
  title: string;
  description: string;
  file: FileList;
};

export default function VideoUploadForm() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successURL, setSuccessURL] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setProgress(0);
    setSuccessURL(null);
    const file = data.file?.[0];
    if (!file) {
      return setError("Please select a video file.");
    }

    let authParams;
    try {
      const res = await fetch("/api/upload-auth");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      authParams = await res.json();
    } catch (e: any) {
      return setError(`Auth failed – ${e.message}`);
    }

    try {
      const resp: any = await upload({
        file,
        fileName: file.name,
        publicKey: authParams.publicKey,
        signature: authParams.signature,
        token: authParams.token,
        expire: authParams.expire,
        onProgress: (evt) => setProgress((evt.loaded / evt.total) * 100)
      });
      setSuccessURL(resp.url);
      reset();
    } catch (e: any) {
      console.error(e);
      if (e instanceof ImageKitInvalidRequestError)      setError("Invalid request.");
      else if (e instanceof ImageKitUploadNetworkError)  setError("Network error.");
      else if (e instanceof ImageKitServerError)         setError("Server error.");
      else if (e instanceof ImageKitAbortError)          setError("Upload aborted.");
      else                                              setError("Unexpected error.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Title</label>
        <input {...register("title", { required: true })} className="border px-2 py-1 w-full" />
      </div>
      <div>
        <label>Description</label>
        <textarea {...register("description")} className="border px-2 py-1 w-full" />
      </div>
      <div>
        <label>Video File</label>
        <input type="file" accept="video/*" {...register("file", { required: true })} />
      </div>

      {progress > 0 && (
        <div>
          Uploading: {progress.toFixed(2)}%
          <progress value={progress} max={100} className="w-full" />
        </div>
      )}
      {error && <p className="text-red-600">Error: {error}</p>}
      {successURL && (
        <div className="text-green-600">
          Uploaded! View it <a href={successURL} target="_blank">here</a>.
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary">
        {isSubmitting ? "Uploading..." : "Upload Video"}
      </button>
    </form>
  );
}
