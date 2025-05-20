import { useDrag, useDrop } from 'react-dnd';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRef } from 'react';

interface DraggableGalleryImageProps {
  image: {
    preview: string;
    id?: string;
  };
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  onRemove: () => void;
}

export default function DraggableGalleryImage({ image, index, moveImage, onRemove }: DraggableGalleryImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'gallery-image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'gallery-image',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveImage(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative w-40 h-24 group ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: 'move' }}
    >
      <Image
        src={image.preview}
        alt={`갤러리 이미지 ${index + 1}`}
        fill
        className="object-cover rounded-lg"
        quality={95}
        sizes="160px"
        priority={index < 4}
        unoptimized={true}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
        순서: {index + 1}
      </div>
    </div>
  );
} 