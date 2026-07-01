import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class MastersService {
  constructor(private readonly store: InMemoryStore) {}

  getMasters() {
    return {
      statusCode: 200,
      data: this.store.getMasters(),
    };
  }

  updateMaster(key: string, values: string[]) {
    const updated = this.store.updateMaster(key, values);
    return {
      statusCode: 200,
      message: `Master list for ${key} updated successfully`,
      data: updated,
    };
  }
}
