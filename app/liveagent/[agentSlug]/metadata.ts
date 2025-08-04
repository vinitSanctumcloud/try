import { Metadata } from 'next';

// Define types for API response
interface ApiResponse {
  message: string;
  data: {
    ai_agent: AiAgentType;
  };
}

interface AiAgentType {
  id: number;
  user_id: number;
  whitelabel_client_id: number;
  agent_name: string;
  ai_agent_slug: string;
  avatar_image_url: string | null;
  greeting_media_url: string;
  greeting_media_type: string;
  greeting_title: string;
  welcome_greeting: string;
  training_instructions: string;
  last_trained_at: string;
  prompts: any[];
}

export async function generateMetadata({ params }: { params: { agentSlug: string } }): Promise<Metadata> {
  const slug = params.agentSlug;
  const metadataBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Log for debugging
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    console.warn('NEXT_PUBLIC_BASE_URL is not set in .env. Using default: http://localhost:3000');
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/v4/ai-agent/get-agent/details/${slug}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'force-cache', // Cache for performance
      }
    );
    if (!response.ok) throw new Error('Failed to fetch agent details');
    const data: ApiResponse = await response.json();
    const agent = data.data.ai_agent;

    const pageTitle = agent?.greeting_title || 'AI Agent';
    const pageDescription = agent?.welcome_greeting || 'Interact with our AI agent on LinkaAI';
    const thumbnailUrl = agent?.avatar_image_url
      ? agent.avatar_image_url.startsWith('http')
        ? agent.avatar_image_url
        : `${metadataBaseUrl}${agent.avatar_image_url}`
      : `${metadataBaseUrl}/thumbnail.jpg`;

    return {
      title: pageTitle,
      description: pageDescription,
      metadataBase: new URL(metadataBaseUrl),
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        images: [
          {
            url: `/liveagent/${slug}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: `${agent?.agent_name || 'AI Agent'} Preview`,
          },
        ],
        url: `/liveagent/${slug}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [`/liveagent/${slug}/opengraph-image`],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'AI Agent',
      description: 'Interact with our AI agent on LinkaAI',
      metadataBase: new URL(metadataBaseUrl),
      openGraph: {
        title: 'AI Agent',
        description: 'Interact with our AI agent on LinkaAI',
        images: [{ url: '/thumbnail.jpg', width: 1200, height: 630, alt: 'AI Agent Preview' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AI Agent',
        description: 'Interact with our AI agent on LinkaAI',
        images: ['/thumbnail.jpg'],
      },
    };
  }
}