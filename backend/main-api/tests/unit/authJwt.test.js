const jwt = require('jsonwebtoken');
const { authJwt, signToken, extractToken, verifyToken } = require('../../src/middleware/authJwt');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function mockReqRes(headers = {}) {
  const req = { headers };
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('authJwt middleware', () => {
  test('should return 401 if no Authorization header', () => {
    const { req, res, next } = mockReqRes();
    authJwt(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      error: 'Authentication required',
      message: 'Please provide a valid JWT token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token is invalid', () => {
    const { req, res, next } = mockReqRes({ authorization: 'Bearer this.is.not.a.valid.jwt' });
    authJwt(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Authentication required');
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next() and attach user if token is valid', () => {
    const token = signToken({ userId: 'user-123', email: 'a@b.com', name: 'A' });
    const { req, res, next } = mockReqRes({ authorization: `Bearer ${token}` });
    authJwt(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('user-123');
    expect(req.user.email).toBe('a@b.com');
  });

  test('extractToken should read Bearer header case-insensitively', () => {
    const r1 = { headers: { authorization: 'Bearer abc.def.ghi' } };
    expect(extractToken(r1)).toBe('abc.def.ghi');
    const r2 = { headers: { Authorization: 'Bearer xyz' } };
    expect(extractToken(r2)).toBe('xyz');
    const r3 = { headers: {} };
    expect(extractToken(r3)).toBeNull();
  });

  test('verifyToken should return null on garbage / null input', () => {
    expect(verifyToken(null)).toBeNull();
    expect(verifyToken('garbage')).toBeNull();
  });

  test('verifyToken should round-trip a freshly signed token', () => {
    const token = jwt.sign({ foo: 'bar' }, JWT_SECRET, { expiresIn: '1h' });
    const decoded = verifyToken(token);
    expect(decoded.foo).toBe('bar');
  });
});
