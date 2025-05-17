
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface FileUploadDropzoneProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
}

const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({ 
  onFilesChange, 
  maxFiles = 5,
  acceptedFileTypes 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange(acceptedFiles);
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    accept: acceptedFileTypes,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 transition-all
        flex flex-col items-center justify-center cursor-pointer
        ${isDragActive ? 'border-homeo-green bg-homeo-green/10' : 'border-muted'}
        ${isDragReject ? 'border-destructive bg-destructive/10' : ''}
        hover:border-homeo-green/50 hover:bg-homeo-green/5
      `}
    >
      <input {...getInputProps()} />
      <UploadCloud className={`h-12 w-12 mb-4 ${isDragActive ? 'text-homeo-green' : 'text-muted-foreground'}`} />
      <p className="text-center mb-1 font-medium">
        {isDragActive ? 'Solte os arquivos aqui' : 'Arraste e solte arquivos aqui ou clique para selecionar'}
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Arquivos suportados: JPG, PNG, PDF, DOCX (máximo {maxFiles} arquivos)
      </p>
      {isDragReject && (
        <p className="text-center text-destructive text-sm mt-2">
          Algum arquivo não é permitido. Verifique o formato e tamanho.
        </p>
      )}
    </div>
  );
};

export default FileUploadDropzone;
