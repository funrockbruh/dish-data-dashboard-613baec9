
import { useState } from "react";
import { Skeleton } from "./skeleton";

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export const ImageWithSkeleton = ({
  src,
  alt,
  className,
  fallbackClassName,
  ...props
}: ImageWithSkeletonProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <Skeleton 
          className={cn(
            "absolute inset-0 bg-gray-800 w-full h-full z-0",
            fallbackClassName
          )}
        />
      )}
      
      {hasError ? (
        <div className={cn(
          "absolute inset-0 bg-gray-800 flex items-center justify-center w-full h-full",
          fallbackClassName
        )}>
          <span className="text-gray-400 text-xs">No image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt || ""}
          className={cn(isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300", className)}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
