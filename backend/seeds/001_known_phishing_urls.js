exports.seed = async function(knex) {
await knex('known_phishing_urls').del();
await knex('known_phishing_urls').insert([
{ url: 'http://bit.ly/fakebank123', source: 'seed', notes: 'example seed' },
{ url: 'http://malicious.example/login', source: 'seed', notes: 'example seed' }
]);
};