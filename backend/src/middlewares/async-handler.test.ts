import { Request, Response } from 'express';
import { asyncHandler } from './async-handler';

const request = {} as Request;
const response = {} as Response;

describe('asyncHandler', () => {
  it('calls next() with no arguments when the handler resolves', async () => {
    const next = jest.fn();
    const handler = asyncHandler(async () => undefined);

    handler(request, response, next);
    await Promise.resolve();
    await Promise.resolve();

    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a rejected promise error to next()', async () => {
    const next = jest.fn();
    const error = new Error('boom');
    const handler = asyncHandler(async () => { throw error; });

    handler(request, response, next);
    await Promise.resolve();
    await Promise.resolve();

    expect(next).toHaveBeenCalledWith(error);
  });
});
