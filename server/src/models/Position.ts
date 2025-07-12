import { DatabaseManager } from './database';
import { Position, CreatePositionRequest, UpdatePositionRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class PositionModel {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public async create(positionData: CreatePositionRequest): Promise<Position> {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    await this.dbManager.run(`
      INSERT INTO positions (id, timestamp, latitude, longitude, source)
      VALUES (?, ?, ?, ?, ?)
    `, [
      id,
      timestamp,
      positionData.latitude,
      positionData.longitude,
      'home_assistant'
    ]);

    return {
      id,
      timestamp,
      latitude: positionData.latitude,
      longitude: positionData.longitude
    };
  }

  public async findAll(): Promise<Position[]> {
    const positionRows = await this.dbManager.all(`
      SELECT id, timestamp, latitude, longitude
      FROM positions
      ORDER BY timestamp ASC
    `);
    
    return positionRows.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude
    }));
  }

  public async findById(id: string): Promise<Position | null> {
    const row = await this.dbManager.get(`
      SELECT id, timestamp, latitude, longitude
      FROM positions
      WHERE id = ?
    `, [id]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude
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

  public async getLatestPosition(): Promise<Position | null> {
    const row = await this.dbManager.get(`
      SELECT id, timestamp, latitude, longitude
      FROM positions
      ORDER BY timestamp DESC
      LIMIT 1
    `);

    if (!row) return null;

    return {
      id: row.id,
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude
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