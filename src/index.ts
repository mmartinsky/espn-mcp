#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

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

const server = new Server(
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

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'espn_nba_scoreboard',
        description: 'Get NBA scoreboard for a specific date',
        inputSchema: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'Date in YYYYMMDD format (optional, defaults to today)',
              pattern: '^\\d{8}$',
            },
          },
        },
      },
      {
        name: 'espn_nba_teams',
        description: 'Get list of all NBA teams',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'espn_nba_team',
        description: 'Get specific NBA team information',
        inputSchema: {
          type: 'object',
          properties: {
            team: {
              type: 'string',
              description: 'Team ID or abbreviation (e.g., "lal" or "13" for Lakers)',
            },
          },
          required: ['team'],
        },
      },
      {
        name: 'espn_nba_roster',
        description: 'Get NBA team roster',
        inputSchema: {
          type: 'object',
          properties: {
            team: {
              type: 'string',
              description: 'Team ID or abbreviation',
            },
          },
          required: ['team'],
        },
      },
      {
        name: 'espn_nba_schedule',
        description: 'Get NBA team schedule',
        inputSchema: {
          type: 'object',
          properties: {
            team: {
              type: 'string',
              description: 'Team ID or abbreviation',
            },
          },
          required: ['team'],
        },
      },
      {
        name: 'espn_nba_players',
        description: 'Get NBA players list',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'espn_nba_player_stats',
        description: 'Get NBA player statistics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'espn_nba_news',
        description: 'Get NBA news',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'espn_nba_scoreboard': {
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
      }

      case 'espn_nba_teams': {
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
      }

      case 'espn_nba_team': {
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
      }

      case 'espn_nba_roster': {
        if (!args?.team) {
          throw new McpError(ErrorCode.InvalidParams, 'Team parameter is required');
        }
        const url = `${BASE_URL}/${args.team}/roster`;
        const data = await fetchEspnData(url);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'espn_nba_schedule': {
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
      }

      case 'espn_nba_players': {
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
      }

      case 'espn_nba_player_stats': {
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
      }

      case 'espn_nba_news': {
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
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});