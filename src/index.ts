#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const BASE_URL = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba';

async function fetchEspnData(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch ESPN data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

const server = new McpServer(
  {
    name: 'mcp-espn',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register all ESPN NBA tools
server.registerTool('espn_nba_scoreboard', {
  description: 'Get NBA scoreboard for a specific date',
  inputSchema: {
    date: z.string().regex(/^\d{8}$/).optional().describe('Date in YYYYMMDD format (optional, defaults to today)'),
  },
}, async (args) => {
  const date = args?.date || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const url = `${BASE_URL}/scoreboard?dates=${date}`;
  const data = await fetchEspnData(url);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
});

server.registerTool('espn_nba_teams', {
  description: 'Get list of all NBA teams',
  inputSchema: {},
}, async () => {
  const url = `${BASE_URL}/teams`;
  const data = await fetchEspnData(url);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
});

server.registerTool('espn_nba_team', {
  description: 'Get specific NBA team information',
  inputSchema: {
    team: z.string().describe('Team ID or abbreviation (e.g., "lal" or "13" for Lakers)'),
  },
}, async (args) => {
  if (!args?.team) {
    throw new McpError(ErrorCode.InvalidParams, 'Team parameter is required');
  }
  const url = `${BASE_URL}/teams/${args.team}`;
  const data = await fetchEspnData(url);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
});

server.registerTool('espn_nba_roster', {
  description: 'Get NBA team roster',
  inputSchema: {
    team: z.string().describe('Team ID or abbreviation'),
  },
}, async (args) => {
  if (!args?.team) {
    throw new McpError(ErrorCode.InvalidParams, 'Team parameter is required');
  }
  const url = `${BASE_URL}/teams/${args.team}/roster`;
  console.log('Fetching roster for team:', url);
  const data = await fetchEspnData(url);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
});

server.registerTool('espn_nba_schedule', {
  description: 'Get NBA team schedule',
  inputSchema: {
    team: z.string().describe('Team ID or abbreviation'),
  },
}, async (args) => {
  if (!args?.team) {
    throw new McpError(ErrorCode.InvalidParams, 'Team parameter is required');
  }
  const url = `${BASE_URL}/${args.team}/schedule`;
  const data = await fetchEspnData(url);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
});

server.registerTool('espn_nba_players', {
  description: 'Get NBA players list',
  inputSchema: {},
}, async () => {
  const url = `${BASE_URL}/players`;
  const data = await fetchEspnData(url);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
});

server.registerTool('espn_nba_player_stats', {
  description: 'Get NBA player statistics',
  inputSchema: {},
}, async () => {
  const url = `${BASE_URL}/statistics/players`;
  const data = await fetchEspnData(url);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
});

server.registerTool('espn_nba_news', {
  description: 'Get NBA news',
  inputSchema: {},
}, async () => {
  const url = `${BASE_URL}/news`;
  const data = await fetchEspnData(url);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ESPN MCP server started');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});