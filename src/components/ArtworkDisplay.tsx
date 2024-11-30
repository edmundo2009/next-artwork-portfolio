// components/ArtworkDisplay.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Artwork, ArtworkDisplayType, ArtworkStyle } from '@/types/artwork';
import TextOverlay from './TextOverlay';

interface ArtworkDisplayProps {
  artwork: Artwork;
}

const ArtworkDisplay: React.FC<ArtworkDisplayProps> = ({ artwork }) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');

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
      textColor: 'white',
      bgOpacity: 0.9,
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
          y: 4
        }
      }
    },
    [ArtworkDisplayType.SplitScreenTextLeft]: {//2nd default style
      textPlacement: 'top-left',
      textColor: 'black',
      bgOpacity: 0.2,
      typography: {
        title: {
          size: '3xl',
          weight: 'bold',
          marginBottom: 4
        }
      },
      spacing: {
        padding: {
          x: 4,
          y: 8
        }
      }
    },
    [ArtworkDisplayType.FullScreenWithOverlay]: {//3rd default style
      textPlacement: 'bottom-left',
      textColor: 'black',
      bgOpacity: 0.1,
      typography: {
        title: {
          size: '4xl',
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
    }
  };

  // Merge default styles with artwork-specific styles
  const style: ArtworkStyle = {
    ...defaultStyles[artwork.type],
    ...artwork.style
  };


  // Markdown rendering components for custom styling
  const MarkdownComponents = {
    h1: ({ node, ...props }: React.ComponentProps<'h1'> & { node?: any }) => <h1 className="text-3xl font-bold mb-4" {...props} />,
    h2: ({ node, ...props }: React.ComponentProps<'h2'> & { node?: any }) => <h2 className="text-2xl font-semibold mb-3" {...props} />,
    h3: ({ node, ...props }: React.ComponentProps<'h3'> & { node?: any }) => <h3 className="text-xl font-semibold mb-2" {...props} />,
    p: ({ node, ...props }: React.ComponentProps<'p'> & { node?: any }) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: ({ node, ...props }: React.ComponentProps<'ul'> & { node?: any }) => <ul className="list-disc pl-5 mb-4" {...props} />,
    ol: ({ node, ...props }: React.ComponentProps<'ol'> & { node?: any }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
    li: ({ node, ...props }: React.ComponentProps<'li'> & { node?: any }) => <li className="mb-2" {...props} />,
    a: ({ node, ...props }: React.ComponentProps<'a'> & { node?: any }) => <a className="text-blue-600 hover:underline" {...props} />,
    strong: ({ node, ...props }: React.ComponentProps<'strong'> & { node?: any }) => <strong className="font-bold" {...props} />,
    em: ({ node, ...props }: React.ComponentProps<'em'> & { node?: any }) => <em className="italic" {...props} />,
    blockquote: ({ node, ...props }: React.ComponentProps<'blockquote'> & { node?: any }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic" {...props} />,
  };

  const renderFullScreen = () => (
    <div className="w-full h-full relative">
      <img
        src={artwork.imageUrl}
        alt={artwork.title}
        className="w-full h-full object-cover"
      />
      <TextOverlay style={style}>
        <h2 className="text-2xl font-bold">{artwork.title} ({artwork.year})</h2>
      </TextOverlay>
    </div>
  );

  const renderSplitScreenTextLeft = () => (
    <div className="flex w-full h-full">
      <div className="w-1/2 relative bg-gray-100 overflow-y-auto">
        <TextOverlay style={style}>
          <div>
            <h2>{artwork.title}</h2>
            {/* <h2>{artwork.title} ({artwork.year})</h2> */}
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
      <div className="w-1/2">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );


  const renderFullScreenWithOverlay = () => (
    <div className="w-full h-full relative">
      <img
        src={artwork.imageUrl}
        alt={artwork.title}
        className="w-full h-full object-cover"
      />
      <TextOverlay style={style}>
        <div>
          <h2>{artwork.title}</h2>
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



  switch (artwork.type) {
    case ArtworkDisplayType.FullScreen:
      return renderFullScreen();
    case ArtworkDisplayType.SplitScreenTextLeft:
      return renderSplitScreenTextLeft();
    case ArtworkDisplayType.FullScreenWithOverlay:
      return renderFullScreenWithOverlay();

    default:
      return renderFullScreen();
  }
};

export default ArtworkDisplay;