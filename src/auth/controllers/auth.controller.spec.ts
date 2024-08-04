import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersService } from './../../users/services/users.service';
import { AuthService } from '../services/auth.service';
import { Role } from './../enums/roles.enum';

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            assignRole: jest.fn().mockResolvedValue({
              id: 2,
              firstName: "Valentina",
              lastName: "Chacon",
              email: "vanessanadal14@gmail.com",
              password: "$10$fUfFhMarx1HyEdYKYeLkSeTIzDJonzWbsdyBzYoZKARoEXfrLPe7S",
              roles: ["guest", "admin"],
              createAt: "2024-08-03T18:01:23.236Z",
              updateAt: "2024-08-04T01:28:08.000Z",
              deletedAt: null,
            }),
          },
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    userService = module.get<UsersService>(UsersService);
  });

  it('should assign a role to a user', async () => {
    const email = 'vanessanadal14@gmail.com';
    const role = Role.Admin;

    const result = await authController.assignRole(email, role);
    expect(result).toEqual({
      id: 2,
      firstName: "Valentina",
      lastName: "Chacon",
      email: "vanessanadal14@gmail.com",
      password: "$10$fUfFhMarx1HyEdYKYeLkSeTIzDJonzWbsdyBzYoZKARoEXfrLPe7S",
      roles: ["guest", "admin"],
      createAt: "2024-08-03T18:01:23.236Z",
      updateAt: "2024-08-04T01:28:08.000Z",
      deletedAt: null,
    });
    expect(userService.assignRole).toHaveBeenCalledWith(email, role);
  });
});
