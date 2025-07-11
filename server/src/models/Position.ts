import { DatabaseManager } from './database';
import { Position, CreatePositionRequest, UpdatePositionRequest, Note, AddNoteRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class PositionModel {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async create(positionData: CreatePositionRequest): Promise<Position> {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    const source = positionData.source || 'manual';
    
    // Create position without notes in positions table
    await this.dbManager.run(`
      INSERT INTO positions (id, timestamp, latitude, longitude, city, country, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      timestamp,
      positionData.latitude,
      positionData.longitude,
      positionData.city || null,
      positionData.country || null,
      source
    ]);

    // If there's a note in the legacy format, add it to notes table
    const notes: Note[] = [];
    if (positionData.notes) {
      const noteId = uuidv4();
      const note: Note = {
        id: noteId,
        text: positionData.notes,
        timestamp,
        source: source === 'home_assistant' ? 'home_assistant' : 'manual'
      };

      await this.dbManager.run(`
        INSERT INTO notes (id, position_id, text, timestamp, source)
        VALUES (?, ?, ?, ?, ?)
      `, [noteId, id, note.text, note.timestamp, note.source]);

      notes.push(note);
    }

    return {
      id,
      timestamp,
      latitude: positionData.latitude,
      longitude: positionData.longitude,
      city: positionData.city,
      country: positionData.country,
      notes,
      source
    };
  }

  public async findAll(): Promise<Position[]> {
    // Get all positions
    const positionRows = await this.dbManager.all(`
      SELECT id, timestamp, latitude, longitude, city, country, source
      FROM positions
      ORDER BY timestamp ASC
    `);
    
    // Get all notes
    const noteRows = await this.dbManager.all(`
      SELECT id, position_id, text, timestamp, source, telegram_user
      FROM notes
      ORDER BY timestamp ASC
    `);
    
    // Group notes by position_id
    const notesByPosition: { [positionId: string]: Note[] } = {};
    noteRows.forEach((noteRow: any) => {
      if (!notesByPosition[noteRow.position_id]) {
        notesByPosition[noteRow.position_id] = [];
      }
      notesByPosition[noteRow.position_id].push({
        id: noteRow.id,
        text: noteRow.text,
        timestamp: noteRow.timestamp,
        source: noteRow.source,
        telegram_user: noteRow.telegram_user
      });
    });
    
    // Combine positions with their notes
    return positionRows.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude,
      city: row.city,
      country: row.country,
      source: row.source || 'manual',
      notes: notesByPosition[row.id] || []
    }));
  }

  public async findById(id: string): Promise<Position | null> {
    const row = await this.dbManager.get(`
      SELECT id, timestamp, latitude, longitude, city, country, source
      FROM positions
      WHERE id = ?
    `, [id]);
    
    if (!row) return null;
    
    // Get notes for this position
    const noteRows = await this.dbManager.all(`
      SELECT id, text, timestamp, source, telegram_user
      FROM notes
      WHERE position_id = ?
      ORDER BY timestamp ASC
    `, [id]);
    
    const notes: Note[] = noteRows.map((noteRow: any) => ({
      id: noteRow.id,
      text: noteRow.text,
      timestamp: noteRow.timestamp,
      source: noteRow.source,
      telegram_user: noteRow.telegram_user
    }));
    
    return {
      id: row.id,
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude,
      city: row.city,
      country: row.country,
      source: row.source || 'manual',
      notes
    };
  }

  public async update(id: string, updateData: UpdatePositionRequest): Promise<Position | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const fields = [];
    const values = [];

    if (updateData.latitude !== undefined) {
      fields.push('latitude = ?');
      values.push(updateData.latitude);
    }
    if (updateData.longitude !== undefined) {
      fields.push('longitude = ?');
      values.push(updateData.longitude);
    }
    if (updateData.city !== undefined) {
      fields.push('city = ?');
      values.push(updateData.city);
    }
    if (updateData.country !== undefined) {
      fields.push('country = ?');
      values.push(updateData.country);
    }
    if (updateData.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updateData.notes);
    }

    if (fields.length === 0) {
      return existing; // No changes
    }

    values.push(id);

    await this.dbManager.run(`
      UPDATE positions 
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);

    return await this.findById(id);
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.dbManager.run('DELETE FROM positions WHERE id = ?', [id]);
    return result.changes > 0;
  }

  public async addNote(positionId: string, noteRequest: AddNoteRequest): Promise<Note | null> {
    // Check if position exists
    const position = await this.findById(positionId);
    if (!position) return null;

    const noteId = uuidv4();
    const timestamp = new Date().toISOString();
    const source = noteRequest.source || 'manual';

    const note: Note = {
      id: noteId,
      text: noteRequest.text,
      timestamp,
      source,
      telegram_user: noteRequest.telegram_user
    };

    await this.dbManager.run(`
      INSERT INTO notes (id, position_id, text, timestamp, source, telegram_user)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [noteId, positionId, note.text, note.timestamp, note.source, note.telegram_user || null]);

    return note;
  }

  public async getLatestPosition(): Promise<Position | null> {
    const row = await this.dbManager.get(`
      SELECT id, timestamp, latitude, longitude, city, country, source
      FROM positions
      ORDER BY timestamp DESC
      LIMIT 1
    `);

    if (!row) return null;

    // Get notes for this position
    const noteRows = await this.dbManager.all(`
      SELECT id, text, timestamp, source, telegram_user
      FROM notes
      WHERE position_id = ?
      ORDER BY timestamp ASC
    `, [row.id]);

    const notes: Note[] = noteRows.map((noteRow: any) => ({
      id: noteRow.id,
      text: noteRow.text,
      timestamp: noteRow.timestamp,
      source: noteRow.source,
      telegram_user: noteRow.telegram_user
    }));

    return {
      id: row.id,
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude,
      city: row.city,
      country: row.country,
      source: row.source || 'manual',
      notes
    };
  }

  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
} 