import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/models/user.entity';
import { Role } from '../../src/auth/enums/roles.enum';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcryptjs', () => {
    return {
        compare: jest.fn().mockImplementation(() => Promise.resolve(true)),
    };
});

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let jwtService: JwtService;

    const user = {
        id: 1,
        firstName: "Valentina",
        lastName: "Chacon",
        email: "vanessanadal14@gmail.com",
        password: "$10$fUfFhMarx1HyEdYKYeLkSeTIzDJonzWbsdyBzYoZKARoEXfrLPe7S",
        roles: ["guest", Role.Admin],
        createAt: "2024-08-03T18:01:23.236Z",
        updateAt: "2024-08-04T01:28:08.000Z",
        deletedAt: null
    };

    const mockUserRepository = {
        findOne: jest.fn().mockImplementation(({ where: { email } }) => {
            if (email === user.email) {
                return Promise.resolve(user);
            }
            return Promise.resolve(undefined);
        }),
        save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                AuthModule,
                UsersModule,
            ],
        })
            .overrideProvider(getRepositoryToken(User))
            .useValue(mockUserRepository)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                stopAtFirstError: true,
            }),
        );
        await app.init();

        jwtService = app.get(JwtService);
    });

    async function getValidToken() {
        return jwtService.sign({ email: user.email, roles: user.roles });
    }

    it('/api/auth/roles/:email (POST)', async () => {
        const token = await getValidToken();
        return request(app.getHttpServer())
            .post(`/api/auth/roles/${user.email}`)
            .auth(token, { type: 'bearer' })
            .send({ role: Role.Customer })
            .expect(201)
            .expect('Content-Type', /application\/json/)
            .expect({
                ...user,
                roles: [...user.roles, Role.Customer],
            });
    });
});
