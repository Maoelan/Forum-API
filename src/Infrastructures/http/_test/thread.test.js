const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper.js');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  let server;

  beforeAll(async () => {
    server = await createServer(container);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  it('should response 201 and presisted thread', async () => {
    // Arrange
    const payloadUser = {
      username: 'maoelana',
      password: 'secret',
      fullname: 'Maulana Muhammad',
    };

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: payloadUser,
    });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: payloadUser.username,
        password: payloadUser.password,
      },
    });

    const { accessToken } = JSON.parse(responseAuth.payload).data;

    const payloadThread = {
      title: 'thread title',
      body: 'thread body',
    };

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: payloadThread,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(201);
    expect(responseJson.status).toBe('success');
    expect(responseJson.data.addedThread).toHaveProperty('id');
    expect(responseJson.data.addedThread.title).toBe(payloadThread.title);

    const threads = await ThreadsTableTestHelper.findThreadById(responseJson.data.addedThread.id);
    expect(threads).toHaveLength(1);
  });

  it('should response 400 when payload not contain needed property', async () => {
    const accessToken = await ServerTestHelper.getAccessToken({ server, username: 'maoelana' });

    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'the owl' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(400);
    expect(responseJson.status).toBe('fail');
    expect(responseJson.message).toBe('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
  });

  it('should respone 400 when payload not meet data type specification', async () => {
    const accessToken = await ServerTestHelper.getAccessToken({ server, username: 'maoelana' });

    const respone = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 123, body: {} },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const responseJson = JSON.parse(respone.payload);
    expect(respone.statusCode).toBe(400);
    expect(responseJson.status).toBe('fail');
    expect(responseJson.message).toBe('tidak dapat membuat thread baru karena tipe data tidak sesuai');
  });

  it('should response 401 when no authorization header', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'the owl', body: 'body owl' },
    });

    const responseJson = JSON.parse(response.payload);

    expect(response.statusCode).toBe(401);
    expect(responseJson.message).toBeDefined();
    expect(responseJson.message).toMatch(/Missing authentication|Invalid token/);
  });
});
