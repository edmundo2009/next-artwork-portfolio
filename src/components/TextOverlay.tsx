// components/TextOverlay.tsx
import { ArtworkStyle } from '@/types/artwork';
import React, { ReactNode, ReactElement, isValidElement, Children } from 'react';

interface TextOverlayProps {
  style?: ArtworkStyle;
  children: ReactNode;
}

const TextOverlay: React.FC<TextOverlayProps> = ({ style, children }) => {
  const getPositionClasses = (placement?: string) => {
    switch (placement) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'middle-left':
        return 'top-1/2 left-4 transform -translate-y-1/2';
      case 'middle-right':
        return 'top-1/2 right-4 transform -translate-y-1/2';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return '';
    }
  };

  const getBackgroundPositionClasses = (placement?: string) => {
    switch (placement) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'middle-left':
        return 'top-1/2 left-4 transform -translate-y-1/2';
      case 'middle-right':
        return 'top-1/2 right-4 transform -translate-y-1/2';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return '';
    }
  };

  const getTextColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
      // Basic colors
      'black': 'text-black',
      'white': 'text-white',
      'red': 'text-red-500',
      'blue': 'text-blue-500',
      'green': 'text-green-500',
      'yellow': 'text-yellow-500',
      'gray': 'text-gray-500',
      'purple': 'text-purple-500',
      'pink': 'text-pink-500',
      'orange': 'text-orange-500',

      // Grayscale variations
      'neutral': 'text-neutral-500',
      'slate': 'text-slate-500',
      'stone': 'text-stone-500',

      // Dark mode friendly colors
      'dark-black': 'text-neutral-900',
      'light-white': 'text-neutral-100',
    };

    // Check if color is in the predefined map
    if (color && colorMap.hasOwnProperty(color)) {
      return colorMap[color];
    }

    // If color follows Tailwind color format (e.g., 'red-600'), return as-is
    const tailwindColorRegex = /^([a-z]+)(-\d{1,3})?$/;
    if (color && tailwindColorRegex.test(color)) {
      return `text-${color}`;
    }

    // Fallback to default (white with slight transparency for readability)
    return 'text-white/90';
  };

  const getBackgroundClasses = (bgOpacity?: number) => {
    if (bgOpacity !== undefined && bgOpacity >= 0 && bgOpacity <= 1) {
      const opacityMap: { [key: number]: string } = {
        0: 'bg-opacity-0',
        0.1: 'bg-opacity-10',
        0.2: 'bg-opacity-20',
        0.3: 'bg-opacity-30',
        0.4: 'bg-opacity-40',
        0.5: 'bg-opacity-50',
        0.6: 'bg-opacity-60',
        0.7: 'bg-opacity-70',
        0.8: 'bg-opacity-80',
        0.9: 'bg-opacity-90',
        1: 'bg-opacity-100'
      };

      const closestOpacity = Object.keys(opacityMap)
        .map(Number)
        .reduce((prev, curr) =>
          Math.abs(curr - bgOpacity) < Math.abs(prev - bgOpacity) ? curr : prev
        );

      return `bg-black ${opacityMap[closestOpacity]}`;
    }
    return '';
  };

  const getTitleClasses = (typography?: ArtworkStyle['typography']) => {
    const titleSize = typography?.title?.size ? `text-${typography.title.size}` : 'text-2xl';
    const titleWeight = typography?.title?.weight ? `font-${typography.title.weight}` : 'font-bold';
    const titleMargin = typography?.title?.marginBottom !== undefined
      ? `mb-${typography.title.marginBottom}`
      : 'mb-4';

    return `${titleSize} ${titleWeight} ${titleMargin}`;
  };

  const getDescriptionClasses = (typography?: ArtworkStyle['typography']) => {
    const descSize = typography?.description?.size ? `text-${typography.description.size}` : 'text-base';
    const descWeight = typography?.description?.weight ? `font-${typography.description.weight}` : 'font-normal';
    const descLineHeight = typography?.description?.lineHeight
      ? `leading-${typography.description.lineHeight}`
      : 'leading-relaxed';
    const descMargin = typography?.description?.marginBottom !== undefined
      ? `mb-${typography.description.marginBottom}`
      : 'mb-4';

    return `${descSize} ${descWeight} ${descLineHeight} ${descMargin}`;
  };

  const getSpacingClasses = (spacing?: ArtworkStyle['spacing']) => {
    const paddingX = spacing?.padding?.x !== undefined ? `px-${spacing.padding.x}` : 'px-4';
    const paddingY = spacing?.padding?.y !== undefined ? `py-${spacing.padding.y}` : 'py-4';
    const marginX = spacing?.margin?.x !== undefined ? `mx-${spacing.margin.x}` : '';
    const marginY = spacing?.margin?.y !== undefined ? `my-${spacing.margin.y}` : '';

    return `${paddingX} ${paddingY} ${marginX} ${marginY}`;
  };






  const titlePositionClasses = getPositionClasses(style?.textPlacement);
  const descriptionPositionClasses = getPositionClasses(style?.descriptionPlacement);
  const textColorClass = getTextColorClass(style?.textColor);
  const titleBackgroundClasses = `${getBackgroundClasses(style?.bgOpacity)} ${getBackgroundPositionClasses(style?.textPlacement)}`;
  const descriptionBackgroundClasses = `${getBackgroundClasses(style?.bgOpacity)} ${getBackgroundPositionClasses(style?.descriptionPlacement)}`;
  const spacingClasses = getSpacingClasses(style?.spacing);

  const classes = [
    titlePositionClasses,
    descriptionPositionClasses,
    textColorClass,
    // backgroundClasses,
    spacingClasses,
    'absolute'
  ].join(' ');

  const enhanceClassName = (
    element: ReactElement,
    defaultClasses: string
  ): ReactElement => {
    // Type assertion to allow adding className
    const elementWithProps = element as ReactElement & {
      props: {
        className?: string,
        children?: ReactNode
      }
    };

    // Merge existing className with default classes
    const mergedClassName = [
      elementWithProps.props.className || '',
      defaultClasses
    ].filter(Boolean).join(' ');

    // Create a new element with merged className and preserve children
    return React.cloneElement(
      elementWithProps,
      { className: mergedClassName },
      elementWithProps.props.children
    );
  };


  const processChildren = (childrenToProcess: ReactNode): ReactNode => {
    return Children.map(childrenToProcess, (child) => {
      if (!isValidElement(child)) return child;

      switch (child.type) {
        case 'h2':
          return (
            <div className={`${titleBackgroundClasses} p-2 rounded`}>
              {enhanceClassName(child, getTitleClasses(style?.typography))}
            </div>
          );
        case 'div':
          return React.cloneElement(child, {},
            Children.map(child.props.children, (grandChild) => {
              if (!isValidElement(grandChild)) return grandChild;

              switch (grandChild.type) {
                case 'h2':
                  return (
                    <div className={`${titleBackgroundClasses} p-2 rounded`}>
                      {enhanceClassName(grandChild, getTitleClasses(style?.typography))}
                    </div>
                  );
                case 'p':
                case 'span':
                case 'div':
                  return (
                    <div className={`${descriptionBackgroundClasses} p-2 rounded`}>
                      {enhanceClassName(grandChild, getDescriptionClasses(style?.typography))}
                    </div>
                  );
                default:
                  return grandChild;
              }
            })
          );
        default:
          return child;
      }
    });
  };

  return (
    <div className={classes}>
      {processChildren(children)}
    </div>
  );
};

export default TextOverlay;