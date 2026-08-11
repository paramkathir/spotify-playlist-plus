# Playlist+

A Spotify playlist management extension for Spicetify built with TypeScript.

Playlist+ makes large Spotify playlists easier to explore by classifying tracks by genre and giving users tools to filter, group, queue, shuffle, and save reusable genre presets without modifying the original playlist.

## Features

- Genre classification using Last.fm metadata
- Multi-genre filtering
- Match Any and Match All filtering modes
- Dynamic genre counts
- Group songs by genre
- Queue all matching songs
- Shuffle matching songs
- Now-playing and queue highlighting
- Persistent classification caching
- Saved genre presets
- Create, edit, rename, and delete presets
- Searchable genre picker
- Designed to work with playlists containing thousands of tracks

## Tech Stack

- TypeScript
- Spicetify API
- Last.fm API
- Spotify Desktop
- LocalStorage
- Node.js
- Spicetify Creator

## Why I Built It

Spotify playlists can become difficult to navigate once they contain hundreds or thousands of songs.

I wanted a way to explore a playlist by genre without permanently reorganizing or splitting the original playlist. Playlist+ adds a Genre Lens directly inside Spotify that lets users temporarily reshape how they browse and queue their music.

## Engineering Highlights

- Built a persistent caching layer to avoid repeated Last.fm classification requests
- Added genre normalization to merge inconsistent metadata into a cleaner taxonomy
- Implemented queue synchronization with Spotify's current playback state
- Designed reusable preset storage and editing components
- Added filtering modes for both union and intersection-based genre matching
- Optimized the interface for very large playlists

## Status

Playlist+ is currently under active development.

## Author

Built by [Param Kathiravan](https://github.com/paramkathir).

## Disclaimer

Playlist+ is an independent project and is not affiliated with Spotify, Last.fm, or Spicetify.