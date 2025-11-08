import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { AuthGuard } from '../auth/auth.guard';
import { GetUser } from '../auth/get-user.decorator';

// Tipo personalizado para User (compatível com Supabase Auth)
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

@Controller('connections')
@UseGuards(AuthGuard)
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post('/connect-token')
  async getConnectToken(@GetUser() user: User) {
    return this.connectionsService.getConnectToken(user.id);
  }

  @Post('/connections')
  async saveConnection(
    @GetUser() user: User,
    @Body() body: { linkId: string; institution: string },
  ) {
    const { linkId, institution } = body;
    return this.connectionsService.saveConnection(user.id, linkId, institution);
  }
}
