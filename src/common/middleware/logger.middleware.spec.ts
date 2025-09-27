import { LoggerMiddleware } from './logger.middleware';
import { Request, Response, NextFunction } from 'express';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call the next function', () => {
    // Criar mocks para os objetos req (requisição), res (resposta) e next
    const req = {} as Request;
    const res = {} as Response;
    const next: NextFunction = jest.fn();

    // Chamar o método middleware.use(req, res, next) (que ainda não existe)
    middleware.use(req, res, next);

    // Verificar que a função next foi chamada exatamente uma vez
    expect(next).toHaveBeenCalledTimes(1);
  });
});