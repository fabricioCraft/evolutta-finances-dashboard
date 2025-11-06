import { Injectable, Inject } from '@nestjs/common';
import { Client as BelvoClient } from 'belvo';
import { BELVO_CLIENT } from '../belvo/belvo.provider';

@Injectable()
export class ConnectionsService {
  constructor(@Inject(BELVO_CLIENT) private readonly belvo: BelvoClient) {}

  async getConnectToken(userId: string): Promise<string> {
    const response = await this.belvo.widgetToken.create();
    return response.access;
  }
}
