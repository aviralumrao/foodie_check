"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface UploadCardProps {
  label?: string;
  onFileSelect?: (file: File) => void;
}

export default function UploadCard({
  label = "Back Packaging Image",
  onFileSelect,
}: UploadCardProps) {
  const [img, setImg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImg(URL.createObjectURL(file));
      onFileSelect?.(file);
    }
  };

  return (
    <div className="w-96 bg-[#faf9f5] border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div
        onClick={() => inputRef.current?.click()}
        className="relative h-64 rounded-xl border border-gray-200 overflow-hidden cursor-pointer flex items-center justify-center"
        style={
          img
            ? undefined
            : {
                backgroundImage:
                  "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              }
        }
      >
        {img ? (
          <img src={img} alt={label} className="w-full h-full object-contain" />
        ) : (
          <span className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 rounded-lg text-sm font-semibold">
            Select File
            <Upload size={16} />
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </div>
      <p className="text-center font-semibold mt-3">{label}</p>
    </div>
  );
}
