import { ImageResponse } from 'next/og';

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

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage({ params }: { params: { agentSlug: string } }) {
  const slug = params.agentSlug;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.error('NEXT_PUBLIC_API_BASE_URL is not defined.');
  }

  let agent: AiAgentType | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/v4/ai-agent/get-agent/details/${slug}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'force-cache',
      }
    );
    if (!res.ok) throw new Error('Failed to fetch agent details');
    const data: ApiResponse = await res.json();
    agent = data.data.ai_agent;
  } catch (error) {
    console.error('Error fetching agent details:', error);
  }

  const name = agent?.agent_name || 'AI Agent';
  const greeting = agent?.greeting_title || 'Meet your personalized assistant';
  const avatar = agent?.avatar_image_url
    ? agent.avatar_image_url.startsWith('http')
      ? agent.avatar_image_url
      : `${baseUrl}${agent.avatar_image_url}`
    : `${baseUrl}/download.jpeg`;

  const fontData = await fetch(
    'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
    { cache: 'force-cache' }
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: '"Inter"',
          textAlign: 'center',
          color: '#000000',
        }}
      >
        {avatar && (
          <img
            src={avatar}
            alt={`${name} avatar`}
            width={180}
            height={180}
            style={{ borderRadius: '50%', marginBottom: 30, objectFit: 'cover' }}
          />
        )}
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>{name}</div>
        <div style={{ fontSize: 28, color: '#555555', maxWidth: '80%' }}>{greeting}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}