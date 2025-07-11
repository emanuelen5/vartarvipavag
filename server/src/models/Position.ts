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
      INSERT INTO positions (id, timestamp, latitude, longitude, city, country, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      timestamp,
      positionData.latitude,
      positionData.longitude,
      positionData.city || null,
      positionData.country || null,
      positionData.notes || null
    ]);

    return {
      id,
      timestamp,
      latitude: positionData.latitude,
      longitude: positionData.longitude,
      city: positionData.city,
      country: positionData.country,
      notes: positionData.notes
    };
  }

  public async findAll(): Promise<Position[]> {
    const rows = await this.dbManager.all(`
      SELECT id, timestamp, latitude, longitude, city, country, notes
      FROM positions
      ORDER BY timestamp ASC
    `);
    
    return rows as Position[];
  }

  public async findById(id: string): Promise<Position | null> {
    const row = await this.dbManager.get(`
      SELECT id, timestamp, latitude, longitude, city, country, notes
      FROM positions
      WHERE id = ?
    `, [id]);
    
    return row ? row as Position : null;
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