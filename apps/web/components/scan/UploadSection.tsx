import UploadCard from "./UploadCard";
import PillButton from "@/components/ui/Button";

interface UploadSectionProps {
  frontFile: File | null;
  backFile: File | null;
  onFrontSelect: (file: File) => void;
  onBackSelect: (file: File) => void;
  onGenerate: () => void;
  actionLabel?: string;
  loading?: boolean;
}

export default function UploadSection({
  frontFile,
  backFile,
  onFrontSelect,
  onBackSelect,
  onGenerate,
  actionLabel = "Generate Report",
  loading = false,
}: UploadSectionProps) {
  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Initiate New Scan</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Upload high-resolution images of the product packaging to begin
          automated compliance verification.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-12 w-full max-w-4xl justify-center items-center">
        <UploadCard
          label="Front Packaging Image"
          onFileSelect={onFrontSelect}
        />
        <UploadCard
          label="Back Packaging Image"
          onFileSelect={onBackSelect}
        />
      </div>

      <PillButton
        text={loading ? "Scanning..." : actionLabel}
        onClick={onGenerate}
      />
    </>
  );
}
