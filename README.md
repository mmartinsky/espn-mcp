# MCP ESPN

A Model Context Protocol (MCP) server for accessing ESPN NBA API endpoints.

## Features

This MCP server provides access to ESPN's NBA API endpoints including:

- **Scoreboard**: Get NBA games for a specific date
- **Teams**: List all NBA teams or get specific team information
- **Roster**: Get team rosters
- **Schedule**: Get team schedules
- **Players**: List NBA players and get player statistics
- **News**: Get NBA news

## Installation

```bash
npm install
npm run build
```

## Usage

The server provides the following tools:

### espn_nba_scoreboard
Get NBA scoreboard for a specific date.
- `date` (optional): Date in YYYYMMDD format, defaults to today

### espn_nba_teams
Get list of all NBA teams.

### espn_nba_team
Get specific NBA team information.
- `team` (required): Team ID or abbreviation (e.g., "lal" or "13" for Lakers)

### espn_nba_roster
Get NBA team roster.
- `team` (required): Team ID or abbreviation

### espn_nba_schedule
Get NBA team schedule.
- `team` (required): Team ID or abbreviation

### espn_nba_players
Get NBA players list.

### espn_nba_player_stats
Get NBA player statistics.

### espn_nba_news
Get NBA news.

## Development

```bash
npm run dev  # Watch mode for development
npm run build  # Build the project
npm start  # Run the server
```

## API Endpoints

This server uses the public ESPN API endpoints:
- Base URL: `http://site.api.espn.com/apis/site/v2/sports/basketball/nba`

## License

MIT