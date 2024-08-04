import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/models/user.entity';
import { Role } from 'src/auth/enums/roles.enum';


jest.mock('bcryptjs', () => {
    return {
        compare: jest.fn().mockImplementation(() => Promise.resolve(true)),
    };
});

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    const user = {
        id: 1,
        firstName: 'Valentina',
        lastName: 'Chacon',
        email: 'vanessanadal14@gmail.com',
        password: '$10$fUfFhMarx1HyEdYKYeLkSeTIzDJonzWbsdyBzYoZKARoEXfrLPe7S',
        roles: [Role.Guest],
        createAt: '2024-08-03T18:01:23.236Z',
        updateAt: '2024-08-04T01:28:08.000Z',
        deletedAt: null,
    };

    const mockUserRepository = {
        findOne: jest.fn().mockImplementation((query) => Promise.resolve(user)),
        save: jest.fn().mockImplementation((updatedUser) =>
            Promise.resolve({ ...user, roles: [...user.roles, updatedUser.roles.pop()] }),
        ),
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
    });

    async function getValidToken() {
        const {
            body: { access_token },
        } = await request(app.getHttpServer()).post('/api/auth/login').send({
            email: 'demo@demo.com',
            password: 'demo',
        });
        return access_token;
    }

    it('/api/auth/roles/:email (POST) should assign a role to a user', async () => {
        const newRole = Role.Admin;

        return request(app.getHttpServer())
            .post(`/api/auth/roles/${user.email}`)
            .auth(await getValidToken(), { type: 'bearer' })
            .send({ role: newRole })
            .expect(201)
            .expect('Content-Type', /application\/json/)
            .expect({
                ...user,
                roles: [...user.roles, newRole],
            });
    });

    it('/api/auth/roles/:email (POST) should fail because user not found', async () => {
        const nonExistingEmail = 'nonexisting@demo.com';

        return request(app.getHttpServer())
            .post(`/api/auth/roles/${nonExistingEmail}`)
            .auth(await getValidToken(), { type: 'bearer' })
            .send({ role: Role.Admin })
            .expect(404)
            .expect('Content-Type', /application\/json/)
            .expect({
                statusCode: 404,
                message: 'User not found',
                error: 'Not Found',
            });
    });

    afterAll(async () => {
        await app.close();
    });
});