// components/ArtworkDisplay.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Artwork, ArtworkDisplayType, ArtworkStyle} from '@/types/artwork';
import TextOverlay from './TextOverlay';
import Image from 'next/image';
interface ArtworkDisplayProps {
  artwork: Artwork;
}

const ArtworkDisplay: React.FC<ArtworkDisplayProps> = ({ artwork }) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  
  // Default width/height for full-screen and other types
  const defaultImageProps = {
    fill: true,
    objectFit: "contain",
    alt: artwork.title
  };

  // Adjust image props based on display type
  const imageProps = artwork.type === ArtworkDisplayType.SplitScreenTextLeft
    ? { ...defaultImageProps, }
    : { ...defaultImageProps, };
  
  useEffect(() => {
    if (artwork.descriptionPath) {
      fetch(artwork.descriptionPath)
        .then(response => response.text())
        .then(text => setMarkdownContent(text))
        .catch(error => {
          console.error('Error fetching markdown content:', error);
          setMarkdownContent('');
        });
    }
  }, [artwork.descriptionPath]);

  // Comprehensive default styles with fallback options
  const defaultStyles: { [key in ArtworkDisplayType]: ArtworkStyle } = {
    [ArtworkDisplayType.FullScreen]: {//1st default style
      textPlacement: 'bottom-left',
      textColor: 'black',
      bgOpacity: 0,
      typography: {
        title: {
          size: 'sm',
          weight: 'normal',
          marginBottom: 2
        }
      },
      spacing: {
        padding: {
          x: 4,
          y: 4
        }
      }
    },
    [ArtworkDisplayType.FullScreen2]: {//2nd default style
      textPlacement: 'bottom-left',
      textColor: 'black',
      bgOpacity: 0.1,
      typography: {
        title: {
          size: 'xl',
          weight: 'bold',
          marginBottom: 4
        },
        description: {
          size: 'xl',
          weight: 'normal',
          lineHeight: 'relaxed',
          marginBottom: 2
        }
      },
      spacing: {
        padding: {
          x: 6,
          y: 6
        },
        margin: {
          x: 2
        }
      }
    },
    [ArtworkDisplayType.SplitScreenTextLeft]: {//3rd default style
      textPlacement: 'bottom-left',
      textColor: 'black',
      bgOpacity: 0,
      typography: {
        title: {
          size: '2xl',
          weight: 'bold',
          marginBottom: 2
        }
      },
      spacing: {
        padding: {
          x: 4,
          y: 1
        }
      }
    },
  };

  // Merge default styles with artwork-specific styles
  const style: ArtworkStyle = {
    ...defaultStyles[artwork.type],
    ...artwork.style
  };


  // Markdown rendering components for custom styling
  const MarkdownComponents = {
    h1: (props: React.ComponentProps<'h1'>) => <h1 className="text-3xl font-bold mb-4" {...props} />,
    h2: (props: React.ComponentProps<'h2'>) => <h2 className="text-2xl font-semibold mb-3" {...props} />,
    h3: (props: React.ComponentProps<'h3'>) => <h3 className="text-xl font-semibold mb-2" {...props} />,
    p: (props: React.ComponentProps<'p'>) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: (props: React.ComponentProps<'ul'>) => <ul className="list-disc pl-5 mb-4" {...props} />,
    ol: (props: React.ComponentProps<'ol'>) => <ol className="list-decimal pl-5 mb-4" {...props} />,
    li: (props: React.ComponentProps<'li'>) => <li className="mb-2" {...props} />,
    a: (props: React.ComponentProps<'a'>) => <a className="text-blue-600 hover:underline" {...props} />,
    strong: (props: React.ComponentProps<'strong'>) => <strong className="font-bold" {...props} />,
    em: (props: React.ComponentProps<'em'>) => <em className="italic" {...props} />,
    blockquote: (props: React.ComponentProps<'blockquote'>) => <blockquote className="border-l-4 border-gray-300 pl-4 italic" {...props} />,
  };

  const renderFullScreen_Title = () => (
    <div className="w-full h-full relative">
      <Image
        src={artwork.imageUrl}
        {...imageProps}
        className="w-full h-full object-contain"
      />
      <TextOverlay style={style}>
        <h2 className="text-2xl font-bold">{artwork.title}</h2>
        {artwork.titleLine2 && (
          <h2 className="text-2xl font-bold mt-2">{artwork.titleLine2}</h2>
        )}
      </TextOverlay>
    </div>
  );

  const renderFullScreen_twoTitle = () => (
    <div className="w-full h-full relative">
      <Image
        src={artwork.imageUrl}
        {...imageProps}
        className="w-full h-full object-contain"
        // className="w-full h-full object-cover"
      />
      <TextOverlay style={style}>
        <h2 className="text-2xl font-bold">{artwork.title}</h2>
      </TextOverlay>
      <TextOverlay style={style}>
        <div>
          {/* <h2>{artwork.title}</h2> */}
          {markdownContent && (
            <div>
              <ReactMarkdown
                components={MarkdownComponents}
                remarkPlugins={[remarkGfm]}
                className="prose max-w-none"
              >
                {markdownContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </TextOverlay>
    </div>
  );

  const renderSplitScreenTextLeft = () => (
    <div className="flex w-full h-full">
      <div
        className="relative overflow-y-auto"
        style={{ width: `${artwork.textWidthPercentage || 50}%` }}
      >
        <TextOverlay style={style}>
          <div>
            <h2>{artwork.title}</h2>
            {markdownContent && (
              <ReactMarkdown
                components={MarkdownComponents}
                remarkPlugins={[remarkGfm]}
                className="prose max-w-none"
              >
                {markdownContent}
              </ReactMarkdown>
            )}
          </div>
        </TextOverlay>
      </div>
      <div
        className="relative"
        style={{ width: `${100 - (artwork.textWidthPercentage || 50)}%` }}
      >
        <Image
          src={artwork.imageUrl}
          // alt={artwork.title}
          {...imageProps}
          // layout="fill" //layout="fill" and objectFit="contain" for responsive image display
          objectFit="contain"
        />
      </div>
    </div>
  );

  switch (artwork.type) {
    case ArtworkDisplayType.FullScreen:
      return renderFullScreen_Title();
    case ArtworkDisplayType.FullScreen2:
      return renderFullScreen_twoTitle();
    case ArtworkDisplayType.SplitScreenTextLeft:
      return renderSplitScreenTextLeft();

    default:
      return renderFullScreen_Title();
  }
};

export default ArtworkDisplay;