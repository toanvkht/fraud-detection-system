/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Add name column to users table
    .table('users', table => {
      table.string('name', 255);
    })
    // Create messages table
    .createTable('messages', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('content').notNullable();
      table.string('source', 50); // email, sms, social_media, etc.
      table.string('sender', 500);
      table.jsonb('meta');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    // Create analyses table
    .createTable('analyses', table => {
      table.increments('id').primary();
      table.integer('message_id').unsigned().notNullable().references('id').inTable('messages').onDelete('CASCADE');
      table.boolean('is_scam').notNullable().defaultTo(false);
      table.float('score').notNullable().defaultTo(0);
      table.jsonb('explanation');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('analyses')
    .dropTableIfExists('messages')
    .table('users', table => {
      table.dropColumn('name');
    });
};
