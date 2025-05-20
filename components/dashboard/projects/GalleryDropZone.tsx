import { DragEvent, useRef, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableGalleryImage from './DraggableGalleryImage';

interface GalleryImage {
  file: File | null;
  preview: string;
  id?: string;
}

interface GalleryDropZoneProps {
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
  onError: (message: string) => void;
}

export default function GalleryDropZone({ images, onImagesChange, onError }: GalleryDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const validateAndProcessFiles = (files: File[]) => {
    const remainingSlots = 10 - images.length;
    const validFiles = files.slice(0, remainingSlots).filter(file => {
      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        onError(`${file.name}의 크기가 5MB를 초과합니다.`);
        return false;
      }

      // 파일 포맷 검증
      const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validFormats.includes(file.type)) {
        onError(`${file.name}은(는) 지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)`);
        return false;
      }

      return true;
    });

    // 이미지 미리보기 생성 및 비율 검증
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = document.createElement('img');
        img.onload = () => {
          // 이미지 비율 검증 (16:9 = 1.77778)
          const aspectRatio = img.width / img.height;
          if (Math.abs(aspectRatio - 16/9) > 0.1) { // 10% 오차 허용
            onError(`${file.name}의 비율이 16:9와 크게 다릅니다. 이미지가 왜곡될 수 있습니다.`);
          }
          
          onImagesChange([
            ...images,
            {
              file,
              preview: reader.result as string
            }
          ]);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // dropZone 영역을 벗어났는지 확인
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { left, top, right, bottom } = rect;
      if (
        e.clientX < left ||
        e.clientX > right ||
        e.clientY < top ||
        e.clientY > bottom
      ) {
        setIsDragging(false);
      }
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndProcessFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndProcessFiles(files);
    e.target.value = ''; // 입력 초기화
  };

  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const newImages = [...images];
    const draggedImage = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    onImagesChange(newImages);
  };

  return (
    <div
      ref={dropZoneRef}
      className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
        isDragging
          ? 'border-gold bg-gold/5'
          : 'border-[#353f54]'
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DndProvider backend={HTML5Backend}>
        <div className="flex flex-wrap gap-4">
          {images.map((image, index) => (
            <DraggableGalleryImage
              key={image.id || index}
              image={image}
              index={index}
              moveImage={moveImage}
              onRemove={() => {
                onImagesChange(images.filter((_, i) => i !== index));
              }}
            />
          ))}

          {images.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-40 h-24 flex items-center justify-center border-2 border-dashed border-gray-500 rounded-lg hover:border-gray-400 transition-colors"
            >
              <PhotoIcon className="w-8 h-8 text-gray-500" />
            </button>
          )}
        </div>
      </DndProvider>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {images.length === 0 && (
        <div className="text-center mt-4 text-gray-400">
          이미지를 드래그하여 업로드하거나, 클릭하여 선택하세요
        </div>
      )}
    </div>
  );
} 