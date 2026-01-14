import { describe, it, expect, mock, beforeEach, spyOn } from 'bun:test';
import bcrypt from 'bcrypt';
import { createAuthService } from './auth-service';
import { type UserService } from '../user/interfaces/user-service';
import { type User, type NewUser } from '../database/drizzle/schema';
import { ErrUserAlreadyExists } from '../user/errors/err-user-already-exists';
import { ErrUserNotFound } from '../user/errors/err-user-not-found';
import { ErrPasswordNotMatch } from './errors/err-password-not-match';

describe('AuthService', () => {
  let mockUserService: UserService;
  let mockJwtService: any;
  let authService: any;
  let bcryptHashSpy: any;
  let bcryptCompareSpy: any;

  beforeEach(() => {
    mockUserService = {
      findByUsername: mock(),
      create: mock(),
      findById: mock(),
    };

    mockJwtService = {
      sign: mock((payload) => `mock-jwt-token-${payload.userId}`),
    };

    bcryptHashSpy = spyOn(bcrypt, 'hash');
    bcryptCompareSpy = spyOn(bcrypt, 'compareSync');

    authService = createAuthService(mockUserService);
  });

  describe('signup', () => {
    it('should create a new user and return access token when signup is successful', async () => {
      const signUpDto = {
        username: 'testuser',
        password: 'password123',
      };

      const expectedUser: User = {
        id: 'user-123',
        username: 'testuser',
        password: 'hashed-password',
        createdAt: new Date(),
      };

      bcryptHashSpy.mockResolvedValueOnce('hashed-password');
      mockUserService.findByUsername.mockResolvedValueOnce(null as any);
      mockUserService.create.mockResolvedValueOnce(expectedUser);

      const result = await authService.signup(signUpDto, mockJwtService);

      expect(mockUserService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcryptHashSpy).toHaveBeenCalledWith('password123', 12);
      expect(mockUserService.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'hashed-password',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ userId: 'user-123' });
      expect(result).toEqual({
        user: expectedUser,
        accessToken: 'mock-jwt-token-user-123',
      });
    });

    it('should throw ErrUserAlreadyExists when username already exists', async () => {
      const signUpDto = {
        username: 'existinguser',
        password: 'password123',
      };

      const existingUser: User = {
        id: 'user-456',
        username: 'existinguser',
        password: 'hashed-password',
        createdAt: new Date(),
      };

      mockUserService.findByUsername.mockResolvedValueOnce(existingUser);

      try {
        await authService.signup(signUpDto, mockJwtService);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ErrUserAlreadyExists);
      }
    });

    it('should throw unexpected errors from userService.findByUsername', async () => {
      const signUpDto = {
        username: 'testuser',
        password: 'password123',
      };

      const unexpectedError = new Error('Database connection failed');
      mockUserService.findByUsername.mockRejectedValueOnce(unexpectedError);

      try {
        await authService.signup(signUpDto, mockJwtService);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Database connection failed');
      }
    });

    it('should handle ErrUserNotFound from userService.findByUsername as acceptable', async () => {
      const signUpDto = {
        username: 'newuser',
        password: 'password123',
      };

      const expectedUser: User = {
        id: 'user-789',
        username: 'newuser',
        password: 'hashed-password',
        createdAt: new Date(),
      };

      mockUserService.findByUsername.mockRejectedValueOnce(
        ErrUserNotFound.create('User not found')
      );
      mockUserService.create.mockResolvedValueOnce(expectedUser);

      const result = await authService.signup(signUpDto, mockJwtService);

      expect(result.user).toEqual(expectedUser);
      expect(result.accessToken).toBe('mock-jwt-token-user-789');
    });
  });

  describe('signin', () => {
    it('should return user and access token when credentials are valid', async () => {
      const signInDto = {
        username: 'testuser',
        password: 'password123',
      };

      const hashedPassword = 'hashed-password';
      const existingUser: User = {
        id: 'user-123',
        username: 'testuser',
        password: hashedPassword,
        createdAt: new Date(),
      };

      bcryptCompareSpy.mockReturnValueOnce(true);
      mockUserService.findByUsername.mockResolvedValueOnce(existingUser);

      const result = await authService.signin(signInDto, mockJwtService);

      expect(mockUserService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcryptCompareSpy).toHaveBeenCalledWith('password123', hashedPassword);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ userId: 'user-123' });
      expect(result).toEqual({
        user: existingUser,
        accessToken: 'mock-jwt-token-user-123',
      });
    });

    it('should throw ErrUserNotFound when user does not exist', async () => {
      const signInDto = {
        username: 'nonexistentuser',
        password: 'password123',
      };

      mockUserService.findByUsername.mockResolvedValueOnce(null as any);

      try {
        await authService.signin(signInDto, mockJwtService);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ErrUserNotFound);
      }
    });

    it('should throw ErrPasswordNotMatch when password is incorrect', async () => {
      const signInDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const hashedPassword = 'hashed-correct-password';
      const existingUser: User = {
        id: 'user-123',
        username: 'testuser',
        password: hashedPassword,
        createdAt: new Date(),
      };

      bcryptCompareSpy.mockReturnValueOnce(false);
      mockUserService.findByUsername.mockResolvedValueOnce(existingUser);

      try {
        await authService.signin(signInDto, mockJwtService);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ErrPasswordNotMatch);
      }
    });

    it('should handle bcrypt.compareSync correctly', async () => {
      const signInDto = {
        username: 'testuser',
        password: 'password123',
      };

      const hashedPassword = 'hashed-password';
      const existingUser: User = {
        id: 'user-123',
        username: 'testuser',
        password: hashedPassword,
        createdAt: new Date(),
      };

      bcryptCompareSpy.mockReturnValueOnce(true);
      mockUserService.findByUsername.mockResolvedValueOnce(existingUser);

      const result = await authService.signin(signInDto, mockJwtService);

      expect(result.user).toEqual(existingUser);
      expect(result.accessToken).toBe('mock-jwt-token-user-123');
    });
  });

  describe('generateAccessToken', () => {
    it('should generate JWT token with user ID', async () => {
      const signUpDto = {
        username: 'testuser',
        password: 'password123',
      };

      const expectedUser: User = {
        id: 'user-123',
        username: 'testuser',
        password: 'hashed-password',
        createdAt: new Date(),
      };

      mockUserService.findByUsername.mockResolvedValueOnce(null as any);
      mockUserService.create.mockResolvedValueOnce(expectedUser);

      await authService.signup(signUpDto, mockJwtService);

      expect(mockJwtService.sign).toHaveBeenCalledWith({ userId: 'user-123' });
    });
  });

  describe('password hashing', () => {
    it('should hash password with bcrypt during signup', async () => {
      const signUpDto = {
        username: 'testuser',
        password: 'password123',
      };

      const expectedUser: User = {
        id: 'user-123',
        username: 'testuser',
        password: 'hashed-password',
        createdAt: new Date(),
      };

      bcryptHashSpy.mockResolvedValueOnce('hashed-password');
      mockUserService.findByUsername.mockResolvedValueOnce(null as any);
      mockUserService.create.mockResolvedValueOnce(expectedUser);

      await authService.signup(signUpDto, mockJwtService);

      expect(bcryptHashSpy).toHaveBeenCalledWith('password123', 12);
      expect(mockUserService.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'hashed-password',
      });
    });
  });

  describe('error handling', () => {
    it('should propagate errors from userService.create during signup', async () => {
      const signUpDto = {
        username: 'testuser',
        password: 'password123',
      };

      bcryptHashSpy.mockResolvedValueOnce('hashed-password');
      mockUserService.findByUsername.mockResolvedValueOnce(null as any);
      mockUserService.create.mockRejectedValueOnce(
        new Error('Failed to create user')
      );

      try {
        await authService.signup(signUpDto, mockJwtService);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Failed to create user');
      }
    });
  });
});