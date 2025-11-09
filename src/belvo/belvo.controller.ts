// src/belvo/belvo.controller.ts
import { Controller, Get, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';
import axios, { isAxiosError } from 'axios';

@Controller('belvo')
export class BelvoController {
  // Removemos todas as injeções desnecessárias
  constructor() {}

  @Get('connect-token')
  @UseGuards(AuthGuard)
  async getConnectToken(@Req() req: Request) {
    const { BELVO_SECRET_ID, BELVO_SECRET_PASSWORD, BELVO_API_URL } = process.env;

    if (!BELVO_SECRET_ID || !BELVO_SECRET_PASSWORD || !BELVO_API_URL) {
      throw new HttpException('Credenciais da Belvo não configuradas no servidor.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const credentials = Buffer.from(`${BELVO_SECRET_ID}:${BELVO_SECRET_PASSWORD}`).toString('base64');
    const belvoTokenUrl = `${BELVO_API_URL}/api/token/`;

    // Corpo da requisição, contendo o parâmetro 'scopes' obrigatório.
    const requestBody = {
      scopes: 'read_institutions,write_links',
      // NOTA: Parâmetros avançados (widget, consent) não são necessários para gerar o token.
    };

    try {
      console.log(`[BELVO] Iniciando chamada POST para: ${belvoTokenUrl}`);
      const response = await axios.post(belvoTokenUrl, requestBody, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[BELVO] Token do widget gerado com sucesso.');
      return { accessToken: response.data.access };

    } catch (error) {
      if (isAxiosError(error)) {
        console.error('[BELVO] Erro na API da Belvo:', {
          status: error.response?.status,
          data: error.response?.data,
          requestId: error.response?.headers?.['request-id'],
        });

        throw new HttpException(
          `Falha ao comunicar com a Belvo: ${error.response?.status || 'Erro de rede'}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      console.error('[BELVO] Erro inesperado no backend:', error);
      throw new HttpException('Ocorreu um erro interno no servidor.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}