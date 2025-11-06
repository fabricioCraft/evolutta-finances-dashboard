import { ConfigService } from '@nestjs/config';
import Client from 'belvo';

export const BELVO_CLIENT = 'BELVO_CLIENT';

export const belvoProvider = {
  provide: BELVO_CLIENT,
  useFactory: (configService: ConfigService) => {
    const secretId = configService.get<string>('BELVO_SECRET_ID');
    const secretPassword = configService.get<string>('BELVO_SECRET_PASSWORD');
    const apiUrl = configService.get<string>('BELVO_API_URL');

    return new Client(secretId, secretPassword, apiUrl);
  },
  inject: [ConfigService],
};
