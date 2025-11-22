/* istanbul ignore file */
const UsersTableTestHelper = require('./UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('./AuthenticationsTableTestHelper');

const ServerTestHelper = {
  async getAccessToken({ server, username = 'maoelana' }) {
    const payloadUser = {
      username,
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
    return accessToken;
  },

  async cleanAll() {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  },
};

module.exports = ServerTestHelper;
